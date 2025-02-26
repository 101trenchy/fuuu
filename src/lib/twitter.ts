import { supabase } from './supabase';

const TWITTER_API_BASE = 'https://api.twitter.com/2';
const CLIENT_ID = 'cDk0eV9TeW9wclNzemJwOW5mY2k6MTpjaQ';
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

// Session management
const SESSION_KEY = 'twitter_session_state';
const MAX_RETRIES = 3;

interface TwitterSession {
  state: string;
  codeVerifier: string;
  timestamp: number;
}

// Store session state
function storeSessionState(state: string, codeVerifier: string) {
  const session: TwitterSession = {
    state,
    codeVerifier,
    timestamp: Date.now()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// Retrieve and validate session state
function getSessionState(): TwitterSession | null {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;

  const parsedSession: TwitterSession = JSON.parse(session);
  // Session expires after 5 minutes
  if (Date.now() - parsedSession.timestamp > 5 * 60 * 1000) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }

  return parsedSession;
}

// Generate a random string for PKCE
async function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => 
    byte.toString(16).padStart(2, '0')
  ).join('');
}

// Generate code challenge from verifier
async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Check if token needs refresh
async function checkAndRefreshToken(userId: string): Promise<string | null> {
  const { data: tokens } = await supabase
    .from('twitter_auth_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (!tokens) return null;

  // Add 5 minute buffer for token expiration
  const expiresAt = new Date(tokens.expires_at).getTime() - 5 * 60 * 1000;
  
  if (Date.now() >= expiresAt) {
    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      await supabase.from('twitter_auth_tokens').upsert({
        user_id: userId,
        access_token: newTokens.access_token,
        refresh_token: newTokens.refresh_token,
        expires_at: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString(),
      });
      return newTokens.access_token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  return tokens.access_token;
}

// Refresh access token
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}

export async function initiateTwitterAuth() {
  try {
    const state = crypto.randomUUID();
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    
    // Store state and verifier
    storeSessionState(state, codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'tweet.read users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    window.location.href = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  } catch (error) {
    console.error('Error initiating Twitter auth:', error);
    throw new Error('Failed to initiate Twitter authentication');
  }
}

export async function handleTwitterCallback(code: string, state: string): Promise<boolean> {
  try {
    // Validate state
    const session = getSessionState();
    if (!session || session.state !== state) {
      throw new Error('Invalid session state');
    }

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code_verifier: session.codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token response error:', error);
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();

    // Get user's Twitter info with retry mechanism
    let twitterUser = null;
    let attempts = 0;
    while (attempts < MAX_RETRIES && !twitterUser) {
      try {
        const userResponse = await fetch('https://api.twitter.com/2/users/me', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get Twitter user info');
        }

        twitterUser = await userResponse.json();
        break;
      } catch (error) {
        attempts++;
        if (attempts === MAX_RETRIES) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }

    if (!twitterUser) {
      throw new Error('Failed to get Twitter user info after retries');
    }

    // Create or get anonymous session
    const { data: { session: authSession }, error: authError } = await supabase.auth.signUp({
      email: `${twitterUser.data.id}@twitter.user`,
      password: crypto.randomUUID(),
    });

    if (authError || !authSession?.user) {
      throw new Error('Failed to create session');
    }

    // Store Twitter user info and tokens
    await supabase.from('twitter_users').upsert({
      auth_id: authSession.user.id,
      twitter_id: twitterUser.data.id,
      username: twitterUser.data.username,
      tweet_goal: 100,
    });

    await supabase.from('twitter_auth_tokens').upsert({
      user_id: authSession.user.id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
    });

    // Start tracking tweets
    await fetchAndStoreTweets(twitterUser.data.id, tokenData.access_token);

    // Clean up session
    localStorage.removeItem(SESSION_KEY);

    return true;
  } catch (error) {
    console.error('Error handling Twitter callback:', error);
    localStorage.removeItem(SESSION_KEY);
    return false;
  }
}

async function fetchAndStoreTweets(userId: string, accessToken: string) {
  try {
    const response = await fetch(
      `${TWITTER_API_BASE}/users/${userId}/tweets?tweet.fields=created_at&max_results=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tweets');
    }

    const data = await response.json();
    const tweets = data.data || [];

    const fuuuTweets = tweets.filter((tweet: any) => 
      tweet.text.toLowerCase().includes('#$fuuu')
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: twitterUser } = await supabase
      .from('twitter_users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!twitterUser) return;

    for (const tweet of fuuuTweets) {
      await supabase.from('tweets').upsert({
        user_id: twitterUser.id,
        tweet_id: tweet.id,
        content: tweet.text,
        posted_at: tweet.created_at,
      });
    }

    const { count } = await supabase
      .from('tweets')
      .select('id', { count: 'exact' })
      .eq('user_id', twitterUser.id);

    const milestones = [10, 50, 100, 500, 1000];
    for (const milestone of milestones) {
      if (count >= milestone) {
        await supabase.from('milestones').upsert({
          user_id: twitterUser.id,
          tweet_count: milestone,
        });
      }
    }
  } catch (error) {
    console.error('Error fetching and storing tweets:', error);
    throw error;
  }
}

export async function refreshTweets() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No authenticated user');

    const accessToken = await checkAndRefreshToken(user.id);
    if (!accessToken) throw new Error('No valid access token');

    const { data: twitterUser } = await supabase
      .from('twitter_users')
      .select('twitter_id')
      .eq('auth_id', user.id)
      .single();

    if (!twitterUser) throw new Error('No Twitter user found');

    await fetchAndStoreTweets(twitterUser.twitter_id, accessToken);
  } catch (error) {
    console.error('Error refreshing tweets:', error);
    throw error;
  }
}