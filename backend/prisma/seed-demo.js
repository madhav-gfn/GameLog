import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
config({ path: '.env' });

const prisma = new PrismaClient();

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

// ─── Deterministic RNG (rerunning the seed makes the same choices) ────

let rngState = 1337;
function rand() {
  rngState |= 0;
  rngState = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;
function sample(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length > 0) {
    out.push(copy.splice(Math.floor(rand() * copy.length), 1)[0]);
  }
  return out;
}
const daysAgo = (min, max) => new Date(Date.now() - randInt(min, max) * 24 * 60 * 60 * 1000);
const hoursAfter = (date, min, max) => new Date(date.getTime() + randInt(min, max) * 60 * 60 * 1000);

// ─── Demo account (credentials for the landing page) ─────────────────

const DEMO = {
  username: 'demo',
  email: 'demo@gamelog.app',
  password: 'demo1234',
  displayName: 'Demo Player',
  bio: 'Shared demo account — poke around! Log games, rate them, write reviews, build lists and follow people.',
  avatar: 'https://i.pravatar.cc/300?img=12',
  platformsPlayed: ['PC', 'PlayStation 5', 'Nintendo Switch'],
};

// ─── Seed users ───────────────────────────────────────────────────────

const SEED_USERS = [
  { username: 'aaravplays', email: 'aarav.mehta94@gmail.com', displayName: 'Aarav Mehta', bio: 'RPG addict. Currently 200 hours deep into something, as always.', platforms: ['PC', 'PlayStation 5'], img: 3 },
  { username: 'sofia_rmz', email: 'sofiaramirez.gg@gmail.com', displayName: 'Sofía Ramírez', bio: 'Indie games and coffee. Reviews every game I finish, no exceptions.', platforms: ['Nintendo Switch', 'PC'], img: 5 },
  { username: 'jakethorn', email: 'jake.thornton@outlook.com', displayName: 'Jake Thornton', bio: 'FPS since Quake. Aim is average, opinions are not.', platforms: ['PC', 'Xbox Series S/X'], img: 8 },
  { username: 'priya_n', email: 'priyanair.dev@gmail.com', displayName: 'Priya Nair', bio: 'Software dev by day, cozy games by night. Stardew Valley apologist.', platforms: ['Nintendo Switch', 'PC'], img: 9 },
  { username: 'webbslinger', email: 'marcuswebb91@gmail.com', displayName: 'Marcus Webb', bio: 'Trophy hunter. 42 platinums and counting.', platforms: ['PlayStation 5', 'PlayStation 4'], img: 11 },
  { username: 'hana_yg', email: 'hana.yoshida@yahoo.com', displayName: 'Hana Yoshida', bio: 'JRPGs, rhythm games, and the occasional soulslike I regret starting.', platforms: ['Nintendo Switch', 'PlayStation 5'], img: 16 },
  { username: 'liam_oc', email: 'liamoconnor.ie@gmail.com', displayName: "Liam O'Connor", bio: 'Strategy and sims. My cities have great public transport.', platforms: ['PC'], img: 13 },
  { username: 'ananya_i', email: 'ananya.iyer21@gmail.com', displayName: 'Ananya Iyer', bio: 'Story-first gamer. If it made me cry, it gets a 9 minimum.', platforms: ['PlayStation 5', 'PC'], img: 20 },
  { username: 'dfuentes', email: 'diego.fuentes.mx@gmail.com', displayName: 'Diego Fuentes', bio: 'Fighting games and roguelikes. Perpetually "one more run".', platforms: ['PC', 'Nintendo Switch'], img: 15 },
  { username: 'emcarter', email: 'emily.carter.gg@outlook.com', displayName: 'Emily Carter', bio: 'Backlog of 300+, still buying more on every sale. No regrets.', platforms: ['PC', 'Xbox Series S/X'], img: 23 },
  { username: 'rohan_k', email: 'rohankulkarni.blr@gmail.com', displayName: 'Rohan Kulkarni', bio: 'Open worlds, photo mode, and 4-hour side quest detours.', platforms: ['PC', 'PlayStation 5'], img: 33 },
  { username: 'chloeb', email: 'chloe.bennett95@gmail.com', displayName: 'Chloe Bennett', bio: 'Horror games with the lights off. Chat says I scream a lot.', platforms: ['PC', 'PlayStation 5'], img: 25 },
  { username: 'tnovak', email: 'tomas.novak.cz@gmail.com', displayName: 'Tomáš Novák', bio: 'Grand strategy and CRPGs. Yes, I read all the dialogue.', platforms: ['PC'], img: 53 },
  { username: 'sneha_r', email: 'snehareddy.hyd@gmail.com', displayName: 'Sneha Reddy', bio: 'Weekend gamer. Co-op nights with friends are sacred.', platforms: ['Nintendo Switch', 'PC'], img: 27 },
  { username: 'natebrooks', email: 'nate.brooks88@yahoo.com', displayName: 'Nathan Brooks', bio: 'Racing sims and sports games. Wheel setup cost more than my couch.', platforms: ['Xbox Series S/X', 'PC'], img: 51 },
  { username: 'bellarossi', email: 'isabella.rossi.it@gmail.com', displayName: 'Isabella Rossi', bio: 'Art direction enjoyer. I play games for the vibes and the screenshots.', platforms: ['PlayStation 5', 'Nintendo Switch'], img: 29 },
  { username: 'karan_m', email: 'karanmalhotra.del@gmail.com', displayName: 'Karan Malhotra', bio: 'Esports viewer, casual player. Ranked is a mistake I keep making.', platforms: ['PC'], img: 57 },
  { username: 'mia_and', email: 'mia.anderson.au@outlook.com', displayName: 'Mia Anderson', bio: 'Puzzle games and platformers. Speedran a game once, never again.', platforms: ['Nintendo Switch', 'PC'], img: 31 },
  { username: 'fwagner', email: 'felix.wagner.de@gmail.com', displayName: 'Felix Wagner', bio: 'Immersive sims and stealth. Quicksave is a lifestyle.', platforms: ['PC'], img: 59 },
  { username: 'zarah_', email: 'zara.hussain.uk@gmail.com', displayName: 'Zara Hussain', bio: 'Narrative adventures and visual novels. Currently emotionally compromised.', platforms: ['Nintendo Switch', 'PC'], img: 41 },
  { username: 'ethancole', email: 'ethan.cole.ca@gmail.com', displayName: 'Ethan Cole', bio: 'Survival crafting enjoyer. My base has a moat now.', platforms: ['PC', 'Xbox Series S/X'], img: 61 },
  { username: 'lea_db', email: 'lea.dubois.fr@gmail.com', displayName: 'Léa Dubois', bio: 'Metroidvanias and boss rushes. Pain is content.', platforms: ['PC', 'Nintendo Switch'], img: 44 },
];

// ─── Review text generation ───────────────────────────────────────────

const REVIEW_PARTS = {
  high: {
    openers: [
      'Absolutely loved this one.',
      'Took me way too long to finally get to this, and I regret waiting.',
      'One of those games I kept thinking about when I wasn\'t playing it.',
      'Rolled credits last night and immediately wanted to start over.',
      'This completely lived up to the hype for me.',
      'I went in with high expectations and it still managed to surprise me.',
      'Couldn\'t put this down for two straight weeks.',
      'Every so often a game just clicks with you. This was one of those.',
      'Blew past what I expected from it.',
      'Started this on a whim and it ended up being one of my favorites of the year.',
      'What a ride.',
      'I get the hype now. I really do.',
    ],
    middles: [
      'The pacing is close to perfect — it kept introducing new ideas right up to the end.',
      'The world feels genuinely alive, and exploring off the beaten path always paid off.',
      'Moment to moment it just feels great to play, which covers for the few rough edges.',
      'The story stuck the landing, which is rarer than it should be.',
      'The soundtrack carried some scenes to a whole other level.',
      'Difficulty felt fair the entire way through — every death was on me.',
      'The side content is actually worth doing for once, some of it better than the main path.',
      'The art direction does so much heavy lifting; some areas are genuinely stunning.',
      'It respects your time while still feeling huge.',
      'There\'s a level of polish here you can feel in the first ten minutes.',
      'Characters that could have been cardboard cutouts ended up being the best part.',
      'The last few hours are some of the best gaming I\'ve had in years.',
    ],
    closers: [
      'Easy recommendation.',
      'Already itching for a replay.',
      'Will be thinking about this one for a while.',
      'Instant favorite.',
      'Play it. Just play it.',
      'Clears most of what I\'ve played this year.',
      'Worth full price and then some.',
      'Genuinely a special game.',
      'Do yourself a favor and go in blind.',
    ],
  },
  mid: {
    openers: [
      'Solid, but I expected a bit more.',
      'Enjoyed my time with it, with some caveats.',
      'Good game hiding inside a slightly bloated one.',
      'This is a hard one to score.',
      'Liked it, didn\'t love it.',
      'A comfortable 7 — and I mean that as a compliment, mostly.',
      'Fun in bursts, but it never fully grabbed me.',
      'There\'s a lot to like here, even if it doesn\'t all come together.',
      'Kept waiting for it to hit another gear and it never quite did.',
    ],
    middles: [
      'The opening hours are strong, but the midgame drags noticeably.',
      'Combat is fun at first, though it starts repeating itself well before the end.',
      'Story had real moments, but the ending felt rushed.',
      'Great ideas, uneven execution — some systems feel half-finished.',
      'The map is bigger than it needed to be, and a lot of it is filler.',
      'Performance hiccups pulled me out of it more than once.',
      'It borrows from better games without ever quite matching them.',
      'The highs are high, but there\'s a fair amount of downtime between them.',
      'Quality-of-life stuff is weirdly missing — small frictions that add up.',
    ],
    closers: [
      'Worth playing on a sale.',
      'Would recommend, with tempered expectations.',
      'Glad I played it, doubt I\'ll go back.',
      'If the premise appeals to you, you\'ll probably have a good time.',
      'A decent weekend game.',
      'Wait for a patch or two, then dive in.',
      'Not bad at all — just not memorable.',
    ],
  },
  low: {
    openers: [
      'Wanted to like this so much more than I did.',
      'This one just didn\'t work for me.',
      'Dropped it after giving it a fair shot.',
      'I bounced off this hard.',
      'Maybe it\'s a me problem, but this never clicked.',
      'Really disappointing, given the premise.',
    ],
    middles: [
      'The core loop gets old fast, and nothing else picks up the slack.',
      'Clunky controls turned every encounter into a chore.',
      'The story tries a lot and lands very little of it.',
      'Technical issues aside, the design itself feels dated.',
      'It desperately needed another six months in the oven.',
      'Every interesting idea is buried under busywork.',
      'I kept waiting for it to get good, and it kept almost getting there.',
    ],
    closers: [
      'Can\'t recommend it in its current state.',
      'Might revisit someday, but I doubt it.',
      'Life\'s too short and the backlog is too long.',
      'Skip it unless you\'re a diehard fan of the genre.',
      'One of my bigger disappointments this year.',
    ],
  },
};

const GENRE_LINES = {
  'RPG': [
    'The build variety kept things fresh well past the midgame.',
    'Choices actually feel like they matter, which I appreciated.',
  ],
  'Shooter': [
    'The gunplay is punchy in a way that\'s hard to describe but easy to feel.',
    'Weapon feedback alone carries a lot of the fun here.',
  ],
  'Action': [
    'Combat has real weight to it once the systems open up.',
  ],
  'Adventure': [
    'Exploration is rewarded constantly, and I never used a guide.',
  ],
  'Platformer': [
    'The movement is so good that traversal alone is entertainment.',
  ],
  'Indie': [
    'Astonishing what a small team pulled off here.',
  ],
  'Strategy': [
    '"One more turn" turned into 3 AM more times than I\'ll admit.',
  ],
  'Puzzle': [
    'A couple of puzzles made me feel like a genius, which is all I ask.',
  ],
  'Racing': [
    'The sense of speed is fantastic, especially in cockpit view.',
  ],
  'Fighting': [
    'Easy to pick up, brutal to master — exactly how it should be.',
  ],
  'Simulation': [
    'It\'s the good kind of spreadsheet game.',
  ],
};

function generateReview(rating, genres) {
  const tier = rating >= 8 ? 'high' : rating >= 6 ? 'mid' : 'low';
  const parts = REVIEW_PARTS[tier];
  const bits = [pick(parts.openers), pick(parts.middles)];
  if (chance(0.55)) {
    const genre = genres.find((g) => GENRE_LINES[g]);
    if (genre) bits.push(pick(GENRE_LINES[genre]));
  }
  bits.push(pick(parts.closers));
  return bits.join(' ');
}

const COMMENTS = [
  'Couldn\'t agree more.',
  'Great write-up, you nailed it.',
  'Adding this to my backlog right now.',
  'The ending broke me too, honestly.',
  'Hard disagree on the pacing, but respect.',
  'Okay this review sold me. Buying it tonight.',
  'This is exactly how I felt about it.',
  'How long did it take you to finish?',
  'Underrated game, glad someone said it.',
  'Was on the fence about this one — thanks for this.',
  'You should try the sequel, it fixes most of this.',
  'Playing this right now and 100% agree so far.',
  'The soundtrack alone deserves a 10.',
  'Finally a review that mentions the side quests.',
  'I dropped it at the same point tbh.',
  'Bold take, but you argued it well.',
  'This game deserved so much better at launch.',
  'Screenshot game must have been crazy in this one.',
];

const LIST_THEMES = [
  { title: 'Games that made me cry', description: 'Emotional damage, ranked. Play with tissues nearby.', genres: ['Adventure', 'RPG'] },
  { title: 'Perfect podcast games', description: 'Turn your brain half-off and grind away while listening to something.', genres: ['Simulation', 'Action', 'Indie'] },
  { title: 'Best co-op nights', description: 'The games that ruined friendships and made better ones.', genres: ['Shooter', 'Action'] },
  { title: 'Short & sweet', description: 'Finished in a weekend, remembered for years.', genres: ['Indie', 'Puzzle', 'Platformer'] },
  { title: 'Open worlds worth getting lost in', description: 'Maps I know better than my own neighbourhood.', genres: ['Action', 'RPG', 'Adventure'] },
  { title: 'Comfort games', description: 'The gaming equivalent of a warm blanket.', genres: ['Simulation', 'Indie', 'Casual'] },
  { title: 'Soundtracks that live rent-free in my head', description: 'Games I sometimes boot up just to hear the menu music.', genres: [] },
  { title: 'Roguelike rabbit holes', description: 'Just one more run. I can stop whenever I want.', genres: ['Indie', 'Action'] },
  { title: 'Story-first favorites', description: 'Gameplay optional, narrative mandatory.', genres: ['Adventure', 'RPG'] },
  { title: 'Couch multiplayer classics', description: 'For when friends actually come over.', genres: ['Fighting', 'Sports', 'Racing'] },
  { title: 'Backlog I swear I\'ll finish', description: 'This is the year. For real this time.', genres: [] },
  { title: 'Hidden gems nobody talks about', description: 'Criminally under-played. Do your part.', genres: ['Indie'] },
];

// Hand-written reviews for the demo account, matched to games if present.
const DEMO_REVIEWS = [
  { match: /witcher 3/i, rating: 10, content: 'Finally rolled credits after 90+ hours and I already miss it. The main quest is great, but it\'s the side quests that make this special — random contracts that spiral into the best short stories in gaming. Geralt\'s world is grim without being joyless, and the Blood and Wine expansion is basically a whole second game. My favorite RPG, full stop.' },
  { match: /^hades/i, rating: 9, content: 'The gold standard for roguelikes. Dying is literally part of the story, so the run-based structure never feels like wasted time. Every weapon changes how you play, the dialogue barely ever repeats, and the soundtrack goes way harder than it has any right to. I "finished" it months ago and I\'m still doing runs.' },
  { match: /elden ring/i, rating: 10, content: 'I\'ve bounced off every soulslike I\'ve tried, and somehow this one got its hooks in me for 120 hours. The open world fixes the genre\'s biggest problem — when a boss walls you, you just go get stronger somewhere else. Standing at the top of a cliff and realizing you can actually go to everything you can see never got old.' },
  { match: /god of war/i, rating: 9, content: 'The single-shot camera thing sounds like a gimmick until you realize it never once cuts away from Kratos and Atreus — and that\'s the whole point. Combat is heavy and brutal in the best way, the axe throw is the most satisfying button in gaming, and the story genuinely moved me. A near-perfect reinvention.' },
  { match: /portal 2/i, rating: 10, content: 'Funniest game ever written, and the puzzles are so well-designed you feel like a genius every ten minutes. The co-op campaign is a completely separate full experience, which is absurd generosity. Fifteen years later nothing has really replaced it.' },
  { match: /red dead redemption 2/i, rating: 9, content: 'Slow, deliberate, and completely absorbing. Arthur Morgan might be the best-written protagonist in a game like this. Yes, the controls are molasses and the missions are on rails — I don\'t care. No open world has ever felt this handmade. The epilogue wrecked me.' },
  { match: /hollow knight/i, rating: 9, content: 'Bought it in a sale for pocket change and it ended up being one of the best games I\'ve ever played. The map is enormous, the bosses are brutal but fair, and the atmosphere is unmatched — all hand-drawn, all haunting. Getting the true ending nearly broke me, in a good way.' },
  { match: /stardew valley/i, rating: 9, content: 'Started a farm to relax and suddenly it was 2 AM and I was optimizing sprinkler layouts. Made by one person, which is still hard to believe. It\'s the game I return to between big releases, and somehow there\'s always something new in it.' },
  { match: /cyberpunk 2077/i, rating: 8, content: 'Played it long after launch, and the game that exists now is genuinely great. Night City is the best-looking place in gaming, the writing in the major questlines is top-tier, and Phantom Liberty is worth the price alone. Still a bit shallow underneath all the neon, but I had a fantastic 60 hours.' },
  { match: /grand theft auto v/i, rating: 8, content: 'The heists still hold up as some of the best missions ever made, and swapping between three protagonists mid-mission never stopped being cool. It\'s carried an entire console generation on its back for a reason.' },
  { match: /breath of the wild|tears of the kingdom/i, rating: 10, content: 'The first game in years that made me feel like a kid exploring again. No waypoint chasing — you just see something weird on the horizon and go. The physics systems let you solve problems in ways the developers clearly never planned for, and that freedom is the whole magic.' },
  { match: /minecraft/i, rating: 9, content: 'There\'s not much left to say about Minecraft, except that every few years I come back, tell myself I\'ll just play a little, and lose a month building something ridiculous. No other game is this permanent.' },
];

// ─── RAWG fetching ────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPopularGameIds() {
  const collected = new Map();
  const queries = [
    'ordering=-added&page_size=40&page=1',
    'ordering=-added&page_size=40&page=2',
    'dates=2022-01-01,2026-06-30&ordering=-added&page_size=25&page=1',
  ];
  for (const q of queries) {
    const res = await fetch(`${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&${q}`);
    if (!res.ok) {
      console.warn(`  ⚠️  RAWG list query failed (${res.status}): ${q}`);
      continue;
    }
    const data = await res.json();
    for (const g of data.results || []) collected.set(g.id, g.name);
  }
  return [...collected.keys()];
}

async function fetchGameDetails(rawgId) {
  const res = await fetch(`${RAWG_BASE_URL}/games/${rawgId}?key=${RAWG_API_KEY}`);
  if (!res.ok) throw new Error(`RAWG ${res.status} for game ${rawgId}`);
  const game = await res.json();
  return {
    rawgId: game.id,
    title: game.name,
    slug: game.slug,
    description: game.description_raw || game.description || '',
    coverImage: game.background_image || '',
    releaseDate: game.released ? new Date(game.released) : null,
    genres: game.genres ? game.genres.map((g) => g.name) : [],
    platforms: game.platforms ? game.platforms.map((p) => p.platform.name) : [],
    developer: game.developers?.[0]?.name || null,
    publisher: game.publishers?.[0]?.name || null,
    esrbRating: game.esrb_rating?.name || null,
    storeLinks: game.stores
      ? game.stores.reduce((acc, s) => {
        acc[s.store.name] = s.url || `https://${s.store.domain}`;
        return acc;
      }, {})
      : null,
  };
}

// ─── Seeding steps ────────────────────────────────────────────────────

async function seedGames() {
  console.log('📡 Fetching popular games from RAWG...');
  const ids = await fetchPopularGameIds();
  console.log(`  Found ${ids.length} unique games to sync`);

  const games = [];
  for (const rawgId of ids) {
    try {
      const existing = await prisma.game.findUnique({ where: { rawgId } });
      if (existing) {
        games.push(existing);
        continue;
      }
      const data = await fetchGameDetails(rawgId);
      const game = await prisma.game.create({ data });
      games.push(game);
      console.log(`  ✅ ${game.title}`);
      await sleep(120);
    } catch (e) {
      console.warn(`  ⚠️  Skipped RAWG ${rawgId}: ${e.message}`);
    }
  }

  // Include any games already in the DB that weren't in the popular list
  const all = await prisma.game.findMany();
  console.log(`  🎮 Game pool: ${all.length} games\n`);
  return all;
}

async function seedUsers() {
  console.log('👤 Creating users...');
  const sharedHash = await bcrypt.hash('S3edUser!' + randInt(1000, 9999), 10);
  const users = [];

  for (const u of SEED_USERS) {
    const createdAt = daysAgo(60, 540);
    const user = await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        email: u.email,
        passwordHash: sharedHash,
        displayName: u.displayName,
        bio: u.bio,
        avatar: chance(0.85) ? `https://i.pravatar.cc/300?img=${u.img}` : null,
        platformsPlayed: u.platforms,
        isPublic: true,
        createdAt,
      },
    });
    users.push(user);
  }
  console.log(`  ✅ ${users.length} community users ready`);

  const demoHash = await bcrypt.hash(DEMO.password, 10);
  const demoUser = await prisma.user.upsert({
    where: { username: DEMO.username },
    update: { passwordHash: demoHash, email: DEMO.email },
    create: {
      username: DEMO.username,
      email: DEMO.email,
      passwordHash: demoHash,
      displayName: DEMO.displayName,
      bio: DEMO.bio,
      avatar: DEMO.avatar,
      platformsPlayed: DEMO.platformsPlayed,
      isPublic: true,
      createdAt: daysAgo(200, 400),
    },
  });
  console.log(`  ✅ Demo user ready: ${DEMO.email} / ${DEMO.password}\n`);

  return { users, demoUser };
}

const STATUS_WEIGHTS = [
  ['COMPLETED', 0.30],
  ['PLAYING', 0.14],
  ['BACKLOG', 0.20],
  ['WISHLIST', 0.15],
  ['PLAYED', 0.13],
  ['ABANDONED', 0.08],
];

function weightedStatus() {
  const r = rand();
  let acc = 0;
  for (const [status, w] of STATUS_WEIGHTS) {
    acc += w;
    if (r < acc) return status;
  }
  return 'COMPLETED';
}

function buildLogData(status, game, user) {
  const platformOptions = game.platforms.filter((p) => user.platformsPlayed.includes(p));
  const platform = platformOptions.length > 0 ? pick(platformOptions) : (game.platforms.length > 0 ? pick(game.platforms) : null);

  const data = { status, platform };

  if (status === 'COMPLETED') {
    data.playtimeHours = randInt(120, 1400) / 10;
    data.progressPercent = 100;
    data.rating = pick([6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10]);
    data.playedAt = daysAgo(10, 700);
  } else if (status === 'PLAYING') {
    data.playtimeHours = randInt(20, 600) / 10;
    data.progressPercent = randInt(10, 85);
    if (chance(0.4)) data.rating = pick([6, 7, 8, 8, 9]);
    data.playedAt = daysAgo(1, 45);
  } else if (status === 'PLAYED') {
    data.playtimeHours = randInt(50, 900) / 10;
    data.progressPercent = randInt(40, 95);
    if (chance(0.7)) data.rating = pick([5, 6, 6, 7, 7, 8, 8, 9]);
    data.playedAt = daysAgo(30, 700);
  } else if (status === 'ABANDONED') {
    data.playtimeHours = randInt(5, 200) / 10;
    data.progressPercent = randInt(5, 55);
    if (chance(0.8)) data.rating = pick([2, 3, 3, 4, 4, 5, 5, 6]);
    data.playedAt = daysAgo(60, 700);
  }

  data.createdAt = data.playedAt ? hoursAfter(data.playedAt, 1, 72) : daysAgo(1, 400);
  return data;
}

async function seedLogsAndReviews(users, games) {
  console.log('📚 Creating game logs and reviews...');
  let logCount = 0;
  const reviews = [];

  for (const user of users) {
    const userGames = sample(games, randInt(8, 22));
    for (const game of userGames) {
      const status = weightedStatus();
      const data = buildLogData(status, game, user);

      const log = await prisma.userGame.upsert({
        where: { userId_gameId: { userId: user.id, gameId: game.id } },
        update: {},
        create: { userId: user.id, gameId: game.id, ...data },
      });
      logCount++;

      // ~45% of rated logs get a written review
      if (data.rating && chance(0.45)) {
        const content = generateReview(data.rating, game.genres);
        try {
          const review = await prisma.review.upsert({
            where: { userId_gameId: { userId: user.id, gameId: game.id } },
            update: {},
            create: {
              userId: user.id,
              gameId: game.id,
              content,
              rating: data.rating,
              createdAt: hoursAfter(data.createdAt, 1, 120),
            },
          });
          reviews.push(review);
        } catch (e) {
          console.warn(`  ⚠️  Review skipped (${user.username} / ${game.title}): ${e.message}`);
        }
      }
    }
  }
  console.log(`  ✅ ${logCount} logs, ${reviews.length} reviews\n`);
  return reviews;
}

async function seedDemoContent(demoUser, games) {
  console.log('⭐ Building the demo user profile...');

  // Prefer well-known games with hand-written reviews
  const matched = [];
  for (const dr of DEMO_REVIEWS) {
    const game = games.find((g) => dr.match.test(g.title));
    if (game && !matched.some((m) => m.game.id === game.id)) matched.push({ ...dr, game });
  }

  const usedIds = new Set(matched.map((m) => m.game.id));
  const rest = sample(games.filter((g) => !usedIds.has(g.id)), 12);
  const reviews = [];

  // Hand-written reviews → COMPLETED logs
  for (const m of matched) {
    const playedAt = daysAgo(20, 400);
    const createdAt = hoursAfter(playedAt, 2, 96);
    await prisma.userGame.upsert({
      where: { userId_gameId: { userId: demoUser.id, gameId: m.game.id } },
      update: { rating: m.rating, status: 'COMPLETED' },
      create: {
        userId: demoUser.id,
        gameId: m.game.id,
        status: 'COMPLETED',
        platform: m.game.platforms.find((p) => DEMO.platformsPlayed.includes(p)) || m.game.platforms[0] || null,
        playtimeHours: randInt(150, 1200) / 10,
        progressPercent: 100,
        rating: m.rating,
        playedAt,
        createdAt,
      },
    });
    const review = await prisma.review.upsert({
      where: { userId_gameId: { userId: demoUser.id, gameId: m.game.id } },
      update: { content: m.content, rating: m.rating },
      create: {
        userId: demoUser.id,
        gameId: m.game.id,
        content: m.content,
        rating: m.rating,
        createdAt: hoursAfter(createdAt, 1, 48),
      },
    });
    reviews.push(review);
  }

  // A varied shelf: playing / backlog / wishlist
  const shelfStatuses = ['PLAYING', 'PLAYING', 'BACKLOG', 'BACKLOG', 'BACKLOG', 'WISHLIST', 'WISHLIST', 'WISHLIST', 'PLAYED', 'PLAYED', 'COMPLETED', 'ABANDONED'];
  for (let i = 0; i < rest.length; i++) {
    const status = shelfStatuses[i % shelfStatuses.length];
    const data = buildLogData(status, rest[i], { platformsPlayed: DEMO.platformsPlayed });
    await prisma.userGame.upsert({
      where: { userId_gameId: { userId: demoUser.id, gameId: rest[i].id } },
      update: {},
      create: { userId: demoUser.id, gameId: rest[i].id, ...data },
    });
  }

  // Demo user's lists
  const favorites = matched.slice(0, 6).map((m) => m.game);
  const backlogGames = rest.slice(0, 5);
  const demoLists = [
    { title: 'All-time favorites', description: 'The games I measure every other game against.', items: favorites },
    { title: 'Backlog I swear I\'ll finish', description: 'This is the year. For real this time.', items: backlogGames },
  ];

  for (const l of demoLists) {
    if (l.items.length === 0) continue;
    const existing = await prisma.gameList.findFirst({ where: { userId: demoUser.id, title: l.title } });
    if (existing) continue;
    const list = await prisma.gameList.create({
      data: { userId: demoUser.id, title: l.title, description: l.description, isPublic: true, createdAt: daysAgo(5, 200) },
    });
    for (let i = 0; i < l.items.length; i++) {
      await prisma.gameListItem.create({ data: { listId: list.id, gameId: l.items[i].id, position: i } });
    }
  }

  console.log(`  ✅ Demo profile: ${matched.length} hand-written reviews, ${rest.length} shelf entries, ${demoLists.length} lists\n`);
  return reviews;
}

async function seedSocial(allUsers, reviews) {
  console.log('👥 Creating follows, likes, and comments...');

  // Follows: everyone follows 3-9 others; everyone follows the demo user's world a bit
  let followCount = 0;
  for (const user of allUsers) {
    const targets = sample(allUsers.filter((u) => u.id !== user.id), randInt(3, 9));
    for (const target of targets) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
        update: {},
        create: { followerId: user.id, followingId: target.id, createdAt: daysAgo(1, 300) },
      });
      followCount++;
    }
  }

  // Likes: skewed toward higher-rated reviews
  let likeCount = 0;
  for (const review of reviews) {
    const maxLikers = Math.min(allUsers.length - 1, Math.max(1, Math.round((review.rating || 5) * 1.4)));
    const likers = sample(allUsers.filter((u) => u.id !== review.userId), randInt(0, maxLikers));
    for (const liker of likers) {
      await prisma.like.upsert({
        where: { userId_reviewId: { userId: liker.id, reviewId: review.id } },
        update: {},
        create: { userId: liker.id, reviewId: review.id, createdAt: hoursAfter(review.createdAt, 1, 800) },
      });
      likeCount++;
    }
  }

  // Comments: ~40% of reviews get 1-4 comments (skip reviews that already have some, so reruns don't duplicate)
  let commentCount = 0;
  for (const review of reviews) {
    if (!chance(0.4)) continue;
    const alreadyCommented = await prisma.comment.count({ where: { reviewId: review.id } });
    if (alreadyCommented > 0) continue;
    const commenters = sample(allUsers.filter((u) => u.id !== review.userId), randInt(1, 4));
    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          reviewId: review.id,
          userId: commenter.id,
          content: pick(COMMENTS),
          createdAt: hoursAfter(review.createdAt, 2, 900),
        },
      });
      commentCount++;
    }
  }

  console.log(`  ✅ ${followCount} follows, ${likeCount} likes, ${commentCount} comments\n`);
}

async function seedLists(users, games) {
  console.log('📋 Creating curated lists...');
  const listOwners = sample(users, Math.min(users.length, 12));
  let listCount = 0;

  for (let i = 0; i < listOwners.length; i++) {
    const owner = listOwners[i];
    const theme = LIST_THEMES[i % LIST_THEMES.length];

    const existing = await prisma.gameList.findFirst({ where: { userId: owner.id } });
    if (existing) continue;

    let pool = theme.genres.length > 0
      ? games.filter((g) => g.genres.some((gg) => theme.genres.includes(gg)))
      : games;
    if (pool.length < 4) pool = games;

    const items = sample(pool, randInt(4, 8));
    const list = await prisma.gameList.create({
      data: {
        userId: owner.id,
        title: theme.title,
        description: theme.description,
        isPublic: true,
        createdAt: daysAgo(3, 350),
      },
    });
    for (let p = 0; p < items.length; p++) {
      await prisma.gameListItem.create({ data: { listId: list.id, gameId: items[p].id, position: p } });
    }
    listCount++;
  }
  console.log(`  ✅ ${listCount} lists\n`);
}

async function seedNotifications() {
  console.log('🔔 Generating notifications from activity...');

  const likes = await prisma.like.findMany({
    take: 250,
    orderBy: { createdAt: 'desc' },
    include: { review: { select: { userId: true } } },
  });
  const comments = await prisma.comment.findMany({
    take: 150,
    orderBy: { createdAt: 'desc' },
    include: { review: { select: { userId: true } } },
  });
  const follows = await prisma.follow.findMany({ take: 150, orderBy: { createdAt: 'desc' } });

  // Avoid piling up duplicates on reruns
  const existing = await prisma.notification.count();
  if (existing > 200) {
    console.log(`  ⚠️  ${existing} notifications already exist — skipping\n`);
    return;
  }

  let count = 0;
  for (const like of likes) {
    if (!like.review || like.review.userId === like.userId || !chance(0.5)) continue;
    await prisma.notification.create({
      data: {
        userId: like.review.userId,
        type: 'LIKE',
        fromUserId: like.userId,
        entityId: like.reviewId,
        read: chance(0.6),
        createdAt: like.createdAt,
      },
    });
    count++;
  }
  for (const comment of comments) {
    if (!comment.review || comment.review.userId === comment.userId || !chance(0.7)) continue;
    await prisma.notification.create({
      data: {
        userId: comment.review.userId,
        type: 'COMMENT',
        fromUserId: comment.userId,
        entityId: comment.reviewId,
        read: chance(0.5),
        createdAt: comment.createdAt,
      },
    });
    count++;
  }
  for (const follow of follows) {
    if (!chance(0.6)) continue;
    await prisma.notification.create({
      data: {
        userId: follow.followingId,
        type: 'NEW_FOLLOWER',
        fromUserId: follow.followerId,
        entityId: follow.followerId,
        read: chance(0.5),
        createdAt: follow.createdAt,
      },
    });
    count++;
  }
  console.log(`  ✅ ${count} notifications\n`);
}

async function recomputeGameRatings() {
  console.log('🧮 Recomputing game average ratings...');
  const games = await prisma.game.findMany({ select: { id: true } });
  for (const game of games) {
    const agg = await prisma.userGame.aggregate({
      where: { gameId: game.id, rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.game.update({
      where: { id: game.id },
      data: {
        avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
        ratingCount: agg._count.rating || 0,
      },
    });
  }
  console.log(`  ✅ Updated ${games.length} games\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  if (!RAWG_API_KEY) {
    console.error('❌ RAWG_API_KEY is required. Set it in backend/.env');
    process.exit(1);
  }

  console.log('🎮 GameLog demo seed — augmenting database with community data\n');

  const games = await seedGames();
  const { users, demoUser } = await seedUsers();
  const allUsers = [...users, demoUser];

  const communityReviews = await seedLogsAndReviews(users, games);
  const demoReviews = await seedDemoContent(demoUser, games);
  await seedSocial(allUsers, [...communityReviews, ...demoReviews]);
  await seedLists(users, games);
  await seedNotifications();
  await recomputeGameRatings();

  const totals = {
    users: await prisma.user.count(),
    games: await prisma.game.count(),
    logs: await prisma.userGame.count(),
    reviews: await prisma.review.count(),
    comments: await prisma.comment.count(),
    likes: await prisma.like.count(),
    follows: await prisma.follow.count(),
    lists: await prisma.gameList.count(),
    notifications: await prisma.notification.count(),
  };

  console.log('✅ Seed complete! Database totals:');
  console.table(totals);
  console.log(`\n🔑 Demo account for the landing page:\n   Email:    ${DEMO.email}\n   Password: ${DEMO.password}`);
}

main()
  .catch((e) => {
    console.error('\n❌ Fatal error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
