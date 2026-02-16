export const RAGE_FACES = {
  foreveralone: 'https://i.imgur.com/o6ynuSW.png',
  fuuu: 'https://i.imgur.com/OEwR2we.png',
  fap: 'https://i.imgur.com/6rASy9u.png',
  megusta: 'https://i.imgur.com/cI0htXh.png',
  troll: 'https://i.imgur.com/jKE9aoS.png',
  boss: 'https://i.imgur.com/qUfLJ5V.png', // Fixed typo in URL (removed extra 'g')
  girl: 'https://i.imgur.com/ReXtE5E.png',
  sir: 'https://i.imgur.com/4kR05as.png',
  lol: 'https://i.imgur.com/G4RK3Tu.png',
  table: 'https://i.imgur.com/IlHTv53.png',
  happy: 'https://i.imgur.com/LWPQkGv.png',
  stop: 'https://i.imgur.com/kimaxJg.png',
  challenge: 'https://i.imgur.com/HJXxSXC.png',
  kdding: 'https://i.imgur.com/SHKzvcz.png',
  gib: 'https://i.imgur.com/qPQqhLh.png'
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
