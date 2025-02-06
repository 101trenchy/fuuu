export const RAGE_FACES = {
  foreveralone: 'https://i.imgur.com/npdKeGH.png',
  fuuu: 'https://i.imgur.com/712xc4a.png',
  fap: 'https://i.imgur.com/mbrIn6A.png',
  megusta: 'https://i.imgur.com/jLFZ5zO.png',
  troll: 'https://i.imgur.com/Sef8QGh.png',
  boss: 'https://i.imgur.com/0jy5JTQ.png', // Fixed typo in URL (removed extra 'g')
  girl: 'https://i.imgur.com/GPVgl1w.png',
  sir: 'https://i.imgur.com/b1kQvkx.png',
  lol: 'https://i.imgur.com/Q2Kjwwo.png',
  table: 'https://i.imgur.com/B0UIMDV.png',
  happy: 'https://i.imgur.com/R25AY4d.png',
  stop: 'https://i.imgur.com/HS7Q46z.png',
  challenge: 'https://i.imgur.com/5VKrCgj.png',
  kdding: 'https://i.imgur.com/ORvtM8N.png',
  gib: 'https://i.imgur.com/wN6b2BV.png',
  win: 'https://i.imgur.com/CZ3BoSg.png',
  cereal: 'https://i.imgur.com/QXysvKX.png',
  something: 'https://i.imgur.com/41a0dYx.png',
  facep: 'https://i.imgur.com/BnKeVbP.png',
  lied: 'https://i.imgur.com/w0kDzYe.png',
  megusta2: 'https://i.imgur.com/TmeWOHO.png',
  uno: 'https://i.imgur.com/tXXDjsw.png',
  heppy: 'https://i.imgur.com/IMeCNbD.png',
  womanp: 'https://i.imgur.com/2bm3Zc5.png',
  strngl: 'https://i.imgur.com/BMq9feg.png',
  lmfao: 'https://i.imgur.com/eG30vWA.png',
  bigno: 'https://i.imgur.com/vpDHoEh.png',
  freddy: 'https://i.imgur.com/vpDHoEh.png',
  eyeonu: 'https://i.imgur.com/dysXIxQ.png',
  ohwhy: 'https://i.imgur.com/5kvv6jX.png',
  scream: 'https://i.imgur.com/SK7kvLP.png',
  bshpls: 'https://i.imgur.com/XX9Eb4R.png',
  jetpack: 'https://i.imgur.com/TUaMTtx.png'
} as const;

export const FACE_TYPES = Object.keys(RAGE_FACES) as Array<keyof typeof RAGE_FACES>;

export const VIEWPORT_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1440,
} as const;

export const FACE_COUNT_RANGES = {
  mobile: { min: 35, max: 45 },
  tablet: { min: 100, max: 130 },
  desktop: { min: 280, max: 350 },
  large: { min: 450, max: 550 },
} as const;

export const PHYSICS_CONFIG = {
  minWidth: 35,
  maxWidth: 125,
  spawnDuration: 12000,
  initialBurst: 30,
  decayRate: 2.5,
} as const;