import { DevEventReward } from './events';
import { getMailTemplate, MAIL_TEMPLATES } from './mail';

export const PROJECTS = [
  { id: 'hello', name: 'Hello, world', detail: 'One tiny program. One big beginning.', duration: 15_000, reward: 20 },
  { id: 'bug', name: 'Squash a bug', detail: 'It was a missing semicolon. Probably.', duration: 60_000, reward: 70 },
  { id: 'playlist', name: 'Lo-fi beat script', detail: 'Code a chill rain-and-piano loop for late focus.', duration: 120_000, reward: 155 },
  { id: 'site', name: 'Build a little website', detail: 'A cozy corner of the internet.', duration: 300_000, reward: 400 },
  { id: 'bot', name: 'Train a cozy chatbot', detail: 'Teach a tiny assistant to tell terrible dev puns.', duration: 600_000, reward: 850 },
  { id: 'app', name: 'Launch a pocket app', detail: 'Smooth buttons, zero clutter, built with love.', duration: 1200_000, reward: 1750 },
  { id: 'game', name: 'Ship an indie game', detail: 'A small idea, ready for the world.', duration: 1800_000, reward: 2700 },
  { id: 'os', name: 'Write a tiny OS', detail: 'Bootloader, kernel, and a blinking cursor from scratch.', duration: 3600_000, reward: 6000 },
];
export const ITEMS = [
  { id: 'keyboard', name: 'Clicky keyboard', description: '+25% project earnings', price: 60, slot: 'equipment', bonus: .25 },
  { id: 'headphones', name: 'Cozy headphones', description: '+35% project earnings', price: 140, slot: 'equipment', bonus: .35 },
  { id: 'monitor', name: 'Dream monitor', description: '+50% project earnings', price: 240, slot: 'equipment', bonus: .5 },
  { id: 'espresso', name: 'Espresso maker', description: '+65% project earnings', price: 420, slot: 'equipment', bonus: .65 },
  { id: 'oled', name: 'OLED ultrawide', description: '+75% project earnings & ambient glow', price: 680, slot: 'equipment', bonus: .75 },
  { id: 'plant', name: 'Leafy roommate', description: 'A little green on the windowsill', price: 35, slot: 'window', bonus: 0 },
  { id: 'lamp', name: 'Warm desk lamp', description: 'A soft amber glow for late hours', price: 65, slot: 'desk', bonus: 0 },
  { id: 'rug', name: 'Peachy rug', description: 'A soft landing for tired feet', price: 80, slot: 'floor', bonus: 0 },
  { id: 'poster', name: 'Moon print', description: 'For the big dreamer in a small room', price: 120, slot: 'wall', bonus: 0 },
  { id: 'lights', name: 'Fairy lights', description: 'Warm little bulbs draped across your wall', price: 150, slot: 'wall', bonus: 0 },
  { id: 'goldfish', name: 'Desk goldfish', description: 'A tiny orange friend swimming beside your desk', price: 160, slot: 'desk', bonus: 0 },
  { id: 'tv', name: 'Wall smart TV', description: 'Lo-fi visuals mounted right on your studio wall', price: 320, slot: 'wall', bonus: 0 },
  { id: 'bed', name: 'Cozy loft bed', description: 'A soft daybed tucked in your studio corner', price: 480, slot: 'floor', bonus: 0 },
];
export const VENTURES = [
 { id: 'tipjar', name: 'Open-Source Tip Jar', description: 'Grateful devs drop coins in your jar while you sleep.', price: 300, coinsPerHour: 15 },
 { id: 'stickers', name: 'Dev Sticker Shop', description: 'Die-cut terminal stickers shipping offline.', price: 900, coinsPerHour: 45 },
 { id: 'newsletter', name: 'Indie Newsletter', description: 'Weekly handcrafted coding notes with cozy sponsors.', price: 2400, coinsPerHour: 120 },
 { id: 'saas', name: 'Tiny SaaS Tool', description: 'A quiet little utility earning recurring coins 24/7.', price: 6000, coinsPerHour: 320 },
] as const;
export type VentureId = typeof VENTURES[number]['id'];
export const PASSIVE_MAX_HOURS = 24;
export const HOMES = [
 { id: 'bedroom', name: 'Starter Bedroom', city: 'Hometown', host: 'studio', description: 'Where every indie dev journey begins.', price: 0, bonus: 0 },
 { id: 'loft', name: 'Brooklyn Brick Loft', city: 'New York', host: 'brooklyn-loft', description: 'Exposed brick, warm walnut floors & city skyline.', price: 1200, bonus: .3 },
 { id: 'sf', name: 'San Francisco Bay View', city: 'San Francisco', host: 'sf-bay', description: 'Golden Gate Bridge views right outside your desk.', price: 4500, bonus: .6 },
 { id: 'tokyo', name: 'Tokyo Skyline Penthouse', city: 'Tokyo', host: 'tokyo-penthouse', description: 'High-rise cedar studio with Tokyo Tower views.', price: 12000, bonus: 1.0 },
 { id: 'cabin', name: 'Swiss Alps Glass Cabin', city: 'Zermatt', host: 'alps-cabin', description: 'Timber retreat overlooking snow-capped alpine peaks.', price: 25000, bonus: 1.5 },
] as const;
export type HomeId = typeof HOMES[number]['id'];

export const RIDES = [
 { id: 'bike', name: 'Vintage Fixie', description: 'Mint commuter bike for morning coffee runs.', price: 500, bonus: .15 },
 { id: 'vespa', name: 'Cream City Scooter', description: 'Zip through town between deploys.', price: 1800, bonus: .25 },
 { id: 'miata', name: 'Classic Roadster', description: 'Top-down sunset drives after shipping v1.', price: 6000, bonus: .45 },
 { id: 'ev', name: 'Electric Coupe', description: 'Whisper-quiet speed and futuristic dash.', price: 15000, bonus: .75 },
 { id: 'porsche', name: 'Vintage 911', description: 'The timeless indie-founder dream car.', price: 35000, bonus: 1.2 },
] as const;
export type RideId = typeof RIDES[number]['id'];

export const COFFEE_REFILL_PRICE = 120;

export const MILESTONES = [
 { id: 'first-ship', name: 'First launch', detail: 'Ship 1 project', reward: 25, check: (s: Save) => s.completed >= 1 },
 { id: 'steady-hands', name: 'Steady rhythm', detail: 'Ship 3 projects', reward: 50, check: (s: Save) => s.completed >= 3 },
 { id: 'cozy-nook', name: 'Cozy corner', detail: 'Own 2 upgrades or decor pieces', reward: 60, check: (s: Save) => s.owned.length >= 2 },
 { id: 'best-friend', name: 'Warm company', detail: 'Adopt the desk cat', reward: 75, check: (s: Save) => !!s.catOwned },
 { id: 'streak-3', name: 'Three-day rhythm', detail: 'Reach a 3-day coding streak', reward: 100, check: (s: Save) => (s.streak?.count ?? 0) >= 3 },
 { id: 'dream-studio', name: 'Full studio', detail: 'Collect 5 upgrades or decor pieces', reward: 120, check: (s: Save) => s.owned.length >= 5 },
 { id: 'first-keys', name: 'First set of keys', detail: 'Buy your first ride for the garage', reward: 150, check: (s: Save) => (s.rides?.length ?? 0) >= 1 },
 { id: 'veteran-dev', name: 'Indie maker', detail: 'Ship 10 projects', reward: 200, check: (s: Save) => s.completed >= 10 },
 { id: 'moving-up', name: 'New zip code', detail: 'Move into a new home', reward: 350, check: (s: Save) => (s.homes ?? []).some(h => h !== 'bedroom') },
 { id: 'sf-dream', name: 'Bay Area founder', detail: 'Move to San Francisco Bay View', reward: 800, check: (s: Save) => (s.homes ?? []).includes('sf') },
] as const;
export type MilestoneId = typeof MILESTONES[number]['id'];
export const ATMOSPHERES = [
 { id: 'sunny', name: 'Sunny studio', description: 'A little afternoon warmth', icon: 'sun' },
 { id: 'rainy', name: 'Rainy day', description: 'Soft rain, nowhere to rush', icon: 'rain' },
 { id: 'moonlit', name: 'Moonlit nook', description: 'A quiet corner after hours', icon: 'poster' },
] as const;
export type Atmosphere = typeof ATMOSPHERES[number]['id'];
export const DESK_CAT = { name: 'Desk cat', price: 100, description: 'A sleepy ginger friend for your coffee breaks.' };
export const ENERGY_CAP = 3;
export const ENERGY_MAX_STOCK = 9;
export const ENERGY_REFILL_MS = 30 * 60_000;
export const CODE_ALONG_MS = 4_000;
export const CODE_ALONG_BUG_MS = 10_000;

export type MailMessage = {
 id: string;
 templateId: string;
 receivedAt: number;
 read: boolean;
 replied?: boolean;
};
export type DeveloperStyle = 'curly' | 'straight' | 'cap' | 'bob';

export const DEVELOPER_STYLES = [
 { id: 'curly', name: 'Leo', subtitle: 'Sage Curls', description: 'Dark curls & sage hoodie', tag: 'Male' },
 { id: 'straight', name: 'Maya', subtitle: 'Amber Bun', description: 'Topknot bun & warm peach hoodie', tag: 'Female' },
 { id: 'cap', name: 'Kai', subtitle: 'Denim Cap', description: 'Backwards cap & denim hoodie', tag: 'Male' },
 { id: 'bob', name: 'Zoe', subtitle: 'Cozy Bob', description: 'Wavy bob & lavender hoodie', tag: 'Female' },
] as const;

export const CURRENT_ONBOARDING_VERSION = 2;

export type Save = {
 onboarded?: boolean;
 onboardingVersion?: number;
 lastSeenRelease?: string;
 playerName?: string;
 streak?: { count: number; lastDay: string };
 milestones?: MilestoneId[];
 energy?: { count: number; rechargedAt: number };
 catOwned?: boolean;
 atmosphere?: Atmosphere;
 developerStyle?: DeveloperStyle;
 homes?: HomeId[];
 activeHome?: HomeId;
 rides?: RideId[];
 activeRide?: RideId;
 ventures?: VentureId[];
 lastPassiveAt?: number;
 activity?: Record<string, number>;
 inbox?: MailMessage[];
 version: 1;
 coins: number;
 completed: number;
 owned: string[];
 decorated: string[];
 active: null | { projectId: string; startedAt: number; duration: number; reward: number; boosted?: boolean };
};

export function developerRank(completed: number): string {
 if (completed >= 30) return 'Studio Legend';
 if (completed >= 16) return 'Indie Maker';
 if (completed >= 8) return 'Cozy Crafter';
 if (completed >= 3) return 'Junior Builder';
 return 'Curious Tinkerer';
}

function localDayKey(ms: number): string {
 const d = new Date(ms);
 const y = d.getFullYear();
 const m = String(d.getMonth() + 1).padStart(2, '0');
 const day = String(d.getDate()).padStart(2, '0');
 return `${y}-${m}-${day}`;
}

function nextStreak(prev: Save['streak'], now: number): { count: number; lastDay: string } {
 const today = localDayKey(now);
 if (!prev) return { count: 1, lastDay: today };
 if (prev.lastDay === today) return prev;
 const yesterday = localDayKey(now - 86_400_000);
 return prev.lastDay === yesterday ? { count: prev.count + 1, lastDay: today } : { count: 1, lastDay: today };
}
export const freshSave = (): Save => ({ version: 1, coins: 0, completed: 0, owned: [], decorated: [], active: null, developerStyle: 'curly' });
export function setDeveloperStyle(save: Save, style: DeveloperStyle): Save {
 return DEVELOPER_STYLES.some(d => d.id === style) && save.developerStyle !== style ? { ...save, developerStyle: style } : save;
}
export function setPlayerName(save: Save, name: string): Save {
 const cleaned = name.trim().slice(0, 24);
 const nextName = cleaned.length > 0 ? cleaned : undefined;
 if (save.playerName === nextName) return save;
 const next = { ...save };
 if (nextName) next.playerName = nextName;
 else delete next.playerName;
 return next;
}
export function multiplier(save: Save) {
 const itemBonus = ITEMS.filter(i => save.owned.includes(i.id)).reduce((n, i) => n + i.bonus, 0);
 const homeBonus = HOMES.filter(h => (save.homes ?? []).includes(h.id)).reduce((n, h) => n + h.bonus, 0);
 const rideBonus = RIDES.filter(r => (save.rides ?? []).includes(r.id)).reduce((n, r) => n + r.bonus, 0);
 return 1 + itemBonus + homeBonus + rideBonus;
}
export function buyOrSelectHome(save: Save, id: HomeId): Save {
 const home = HOMES.find(h => h.id === id);
 if (!home) return save;
 const ownedHomes: HomeId[] = save.homes ? (save.homes.includes('bedroom') ? save.homes : ['bedroom', ...save.homes]) : ['bedroom'];
 if (ownedHomes.includes(id)) {
  return (save.activeHome ?? 'bedroom') === id ? save : { ...save, homes: ownedHomes, activeHome: id };
 }
 if (save.coins < home.price) return save;
 return { ...save, coins: save.coins - home.price, homes: [...ownedHomes, id], activeHome: id };
}
export function buyOrSelectRide(save: Save, id: RideId): Save {
 const ride = RIDES.find(r => r.id === id);
 if (!ride) return save;
 const ownedRides = save.rides ?? [];
 if (ownedRides.includes(id)) {
  return save.activeRide === id ? save : { ...save, activeRide: id };
 }
 if (save.coins < ride.price) return save;
 return { ...save, coins: save.coins - ride.price, rides: [...ownedRides, id], activeRide: id };
}
export function buyEnergyRefill(save: Save, now: number): Save {
 const available = refillEnergy(save, now);
 if (available.energy!.count >= ENERGY_MAX_STOCK || available.coins < COFFEE_REFILL_PRICE) return save;
 const nextCount = available.energy!.count + 1;
 return {
  ...available,
  coins: available.coins - COFFEE_REFILL_PRICE,
  energy: {
   count: nextCount,
   rechargedAt: nextCount >= ENERGY_CAP ? now : available.energy!.rechargedAt,
  },
 };
}
export function codeAlongTap(save: Save, now: number): Save {
 if (!save.active || progress(save, now) >= 1 || now < save.active.startedAt) return save;
 const remaining = save.active.startedAt + save.active.duration - now;
 const trim = Math.min(CODE_ALONG_MS, Math.max(0, remaining - 500));
 if (trim <= 0) return save;
 return { ...save, active: { ...save.active, duration: save.active.duration - trim } };
}
export function recentActivityGrid(save: Save, now: number, days = 28): { day: string; count: number }[] {
 const map = save.activity ?? {};
 const out: { day: string; count: number }[] = [];
 for (let i = days - 1; i >= 0; i--) {
  const day = localDayKey(now - i * 86_400_000);
  out.push({ day, count: map[day] ?? 0 });
 }
 return out;
}
function recordActivity(prev: Save['activity'], now: number): Record<string, number> {
 const today = localDayKey(now);
 const next: Record<string, number> = { ...(prev ?? {}), [today]: ((prev ?? {})[today] ?? 0) + 1 };
 const keys = Object.keys(next).sort();
 if (keys.length > 35) {
  for (const oldKey of keys.slice(0, keys.length - 35)) delete next[oldKey];
 }
 return next;
}
export function deliverRandomMail(save: Save, now: number, count = 1, seed?: number): Save {
 const existing = save.inbox ?? [];
 const existingTemplates = new Set(existing.map(m => m.templateId));
 const pool = MAIL_TEMPLATES.filter(t => t.id !== 'welcome-nib' && !existingTemplates.has(t.id));
 const source = pool.length > 0 ? pool : MAIL_TEMPLATES.filter(t => t.id !== 'welcome-nib');
 if (source.length === 0) return save;
 const added: MailMessage[] = [];
 const used = new Set<string>();
 for (let i = 0; i < count; i++) {
  const avail = source.filter(t => !used.has(t.id));
  if (avail.length === 0) break;
  const pickIdx = seed !== undefined ? (seed + i * 7) % avail.length : Math.floor(Math.random() * avail.length);
  const chosen = avail[pickIdx]!;
  used.add(chosen.id);
  added.push({
   id: `m-${now}-${i}-${chosen.id}`,
   templateId: chosen.id,
   receivedAt: now - i * 1000,
   read: false,
  });
 }
 return { ...save, inbox: [...added, ...existing].slice(0, 14) };
}
export function ensureStarterMail(save: Save, now: number): Save {
 if (save.inbox && save.inbox.length > 0) return save;
 const welcome: MailMessage = {
  id: `m-${now}-welcome`,
  templateId: 'welcome-nib',
  receivedAt: now - 3600_000,
  read: true,
 };
 const withWelcome: Save = { ...save, inbox: [welcome] };
 return deliverRandomMail(withWelcome, now, 2);
}
export function markMailRead(save: Save, id: string): Save {
 const inbox = save.inbox ?? [];
 const target = inbox.find(m => m.id === id);
 if (!target || target.read) return save;
 return { ...save, inbox: inbox.map(m => (m.id === id ? { ...m, read: true } : m)) };
}
export function replyToMail(save: Save, id: string, optionIndex: number, now: number): Save {
 const inbox = save.inbox ?? [];
 const target = inbox.find(m => m.id === id);
 if (!target || target.replied) return save;
 const tpl = getMailTemplate(target.templateId);
 const opt = tpl?.replies[optionIndex];
 if (!opt) return save;
 let next: Save = {
  ...save,
  inbox: inbox.map(m => (m.id === id ? { ...m, read: true, replied: true } : m)),
 };
 if (opt.rewardCoins) next = { ...next, coins: next.coins + opt.rewardCoins };
 if (opt.rewardEnergy) {
  const avail = refillEnergy(next, now);
  const count = Math.min(ENERGY_MAX_STOCK, avail.energy!.count + opt.rewardEnergy);
  next = { ...avail, energy: { count, rechargedAt: count >= ENERGY_CAP ? now : avail.energy!.rechargedAt } };
 }
 return next;
}
export function deleteMail(save: Save, id: string): Save {
 const inbox = save.inbox ?? [];
 if (!inbox.some(m => m.id === id)) return save;
 return { ...save, inbox: inbox.filter(m => m.id !== id) };
}
export function clearReadMail(save: Save): Save {
 const inbox = save.inbox ?? [];
 const remaining = inbox.filter(m => !m.read);
 return remaining.length === inbox.length ? save : { ...save, inbox: remaining };
}
export function markAllMailRead(save: Save): Save {
 const inbox = save.inbox ?? [];
 if (!inbox.some(m => !m.read)) return save;
 return { ...save, inbox: inbox.map(m => ({ ...m, read: true })) };
}
export function netWorth(save: Save): number {
 const itemsVal = ITEMS.filter(i => save.owned.includes(i.id)).reduce((n, i) => n + i.price, 0);
 const homesVal = HOMES.filter(h => (save.homes ?? []).includes(h.id)).reduce((n, h) => n + h.price, 0);
 const ridesVal = RIDES.filter(r => (save.rides ?? []).includes(r.id)).reduce((n, r) => n + r.price, 0);
 const venturesVal = VENTURES.filter(v => (save.ventures ?? []).includes(v.id)).reduce((n, v) => n + v.price, 0);
 return save.coins + itemsVal + homesVal + ridesVal + venturesVal + (save.catOwned ? DESK_CAT.price : 0);
}
export function passiveRatePerHour(save: Save): number {
 return VENTURES.filter(v => (save.ventures ?? []).includes(v.id)).reduce((n, v) => n + v.coinsPerHour, 0);
}
export function pendingPassiveCoins(save: Save, now: number): number {
 const rate = passiveRatePerHour(save);
 if (rate <= 0 || !save.lastPassiveAt) return 0;
 const elapsedMs = Math.max(0, Math.min(PASSIVE_MAX_HOURS * 3_600_000, now - save.lastPassiveAt));
 return Math.floor((elapsedMs / 3_600_000) * rate);
}
export function collectPassive(save: Save, now: number): Save {
 const earned = pendingPassiveCoins(save, now);
 if (earned <= 0) return save;
 return { ...save, coins: save.coins + earned, lastPassiveAt: now };
}
export function buyVenture(save: Save, id: VentureId, now: number): Save {
 const v = VENTURES.find(x => x.id === id);
 const owned = save.ventures ?? [];
 if (!v || owned.includes(id)) return save;
 const settled = pendingPassiveCoins(save, now) > 0 ? collectPassive(save, now) : save;
 if (settled.coins < v.price) return save;
 return {
  ...settled,
  coins: settled.coins - v.price,
  ventures: [...owned, id],
  lastPassiveAt: settled.lastPassiveAt ?? now,
 };
}
export function codeAlongFixBug(save: Save, now: number): Save {
 if (!save.active || progress(save, now) >= 1 || now < save.active.startedAt) return save;
 const remaining = save.active.startedAt + save.active.duration - now;
 if (remaining <= 0) return save;
 const shave = Math.min(remaining, CODE_ALONG_BUG_MS);
 return { ...save, active: { ...save.active, duration: Math.max(1000, save.active.duration - shave) } };
}
export function applyDevEventChoice(save: Save, reward: DevEventReward, now: number): Save {
 if (reward.kind === 'coins') {
  return { ...save, coins: save.coins + reward.amount };
 }
 if (reward.kind === 'coffee') {
  const avail = refillEnergy(save, now);
  const count = Math.min(ENERGY_MAX_STOCK, avail.energy!.count + reward.amount);
  return { ...avail, energy: { count, rechargedAt: count >= ENERGY_CAP ? now : avail.energy!.rechargedAt } };
 }
 if (reward.kind === 'speed' && save.active && progress(save, now) < 1 && now >= save.active.startedAt) {
  const remaining = save.active.startedAt + save.active.duration - now;
  const shave = Math.floor(remaining * reward.percent);
  if (shave < 1) return save;
  return { ...save, active: { ...save.active, duration: Math.max(1000, save.active.duration - shave) } };
 }
 return save;
}
export function startProject(save: Save, id: string, now: number): Save {
  const project = PROJECTS.find(p => p.id === id);
  if (save.active || !project) return save;
  return { ...save, active: { projectId: id, startedAt: now, duration: project.duration, reward: Math.round(project.reward * multiplier(save)) } };
}
export function progress(save: Save, now: number) { return save.active ? Math.min(1, Math.max(0, (now - save.active.startedAt) / save.active.duration)) : 0; }
export function claim(save: Save, now: number): Save {
  if (!save.active || progress(save, now) < 1) return save;
  const shipped: Save = {
   ...save,
   coins: save.coins + save.active.reward,
   completed: save.completed + 1,
   streak: nextStreak(save.streak, now),
   activity: recordActivity(save.activity, now),
   active: null,
  };
  return deliverRandomMail(shipped, now, 1);
}
export function buy(save: Save, id: string): Save {
  const item = ITEMS.find(i => i.id === id);
  if (!item || save.owned.includes(id) || save.coins < item.price) return save;
  return { ...save, coins: save.coins - item.price, owned: [...save.owned, id], decorated: item.slot === 'equipment' ? save.decorated : [...save.decorated, id] };
}
export function toggleDecoration(save: Save, id: string): Save {
  const item = ITEMS.find(i => i.id === id);
  if (!item || item.slot === 'equipment' || !save.owned.includes(id)) return save;
  return { ...save, decorated: save.decorated.includes(id) ? save.decorated.filter(x => x !== id) : [...save.decorated, id] };
}
export function refillEnergy(save: Save, now: number): Save {
 const energy = save.energy;
 if (!energy) return { ...save, energy: { count: ENERGY_CAP, rechargedAt: now } };
 const safeNow = Math.max(now, energy.rechargedAt);
 if (energy.count >= ENERGY_CAP) return { ...save, energy: { count: energy.count, rechargedAt: safeNow } };
 const earned = Math.floor((safeNow - energy.rechargedAt) / ENERGY_REFILL_MS);
 if (earned === 0) return save;
 const count = Math.min(ENERGY_CAP, energy.count + earned);
 return { ...save, energy: { count, rechargedAt: count >= ENERGY_CAP ? safeNow : energy.rechargedAt + earned * ENERGY_REFILL_MS } };
}
export function energyStatus(save: Save, now: number) {
 const energy = refillEnergy(save, now).energy!;
 return { count: energy.count, nextRechargeAt: energy.count < ENERGY_CAP ? energy.rechargedAt + ENERGY_REFILL_MS : null };
}
export function boostProject(save: Save, now: number): Save {
 if (!save.active || save.active.boosted || progress(save, now) >= 1 || now < save.active.startedAt) return save;
 const available = refillEnergy(save, now);
 if (available.energy!.count < 1) return save;
 const remaining = save.active.startedAt + save.active.duration - now;
 const savedTime = Math.floor(remaining * .25);
 if (savedTime < 1) return save;
 return { ...available, energy: { ...available.energy!, count: available.energy!.count - 1 }, active: { ...save.active, duration: save.active.duration - savedTime, boosted: true } };
}
export function adoptCat(save: Save): Save {
 if (save.catOwned || save.coins < DESK_CAT.price) return save;
 return { ...save, coins: save.coins - DESK_CAT.price, catOwned: true };
}
export function setAtmosphere(save: Save, atmosphere: Atmosphere): Save {
 return ATMOSPHERES.some(a => a.id === atmosphere) && save.atmosphere !== atmosphere ? { ...save, atmosphere } : save;
}
export function claimMilestone(save: Save, id: MilestoneId): Save {
 const milestone = MILESTONES.find(m => m.id === id);
 const claimed = save.milestones ?? [];
 if (!milestone || claimed.includes(id) || !milestone.check(save)) return save;
 return { ...save, coins: save.coins + milestone.reward, milestones: [...claimed, id] };
}
export function completeOnboarding(save: Save, profile?: { name?: string; style?: DeveloperStyle; releaseId?: string }): Save {
 let next = save;
 if (profile?.name !== undefined) next = setPlayerName(next, profile.name);
 if (profile?.style !== undefined) next = setDeveloperStyle(next, profile.style);
 if (profile?.releaseId !== undefined) next = markReleaseSeen(next, profile.releaseId);
 if (next.onboarded && next.onboardingVersion === CURRENT_ONBOARDING_VERSION && next === save) return save;
 return { ...next, onboarded: true, onboardingVersion: CURRENT_ONBOARDING_VERSION };
}
export function markReleaseSeen(save: Save, releaseId: string): Save {
 return save.lastSeenRelease === releaseId ? save : { ...save, lastSeenRelease: releaseId };
}
export function parseSave(raw: string): Save {
  const s = JSON.parse(raw);
  if (s.onboarded !== undefined && typeof s.onboarded !== 'boolean') throw Error('Invalid onboarding');
  if (s.onboardingVersion !== undefined && (!Number.isInteger(s.onboardingVersion) || s.onboardingVersion < 0)) throw Error('Invalid onboarding version');
  if (s.lastSeenRelease !== undefined && (typeof s.lastSeenRelease !== 'string' || s.lastSeenRelease.length > 32)) throw Error('Invalid release id');
  if (s.playerName !== undefined && (typeof s.playerName !== 'string' || s.playerName.length > 24)) throw Error('Invalid player name');
  if (s.streak !== undefined && (!s.streak || !Number.isInteger(s.streak.count) || s.streak.count < 0 || typeof s.streak.lastDay !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.streak.lastDay))) throw Error('Invalid streak');
  if (s.developerStyle !== undefined && !DEVELOPER_STYLES.some(d => d.id === s.developerStyle)) throw Error('Invalid developer style');
  const validMilestoneIds: string[] = MILESTONES.map(m => m.id);
  if (s.milestones !== undefined && (!Array.isArray(s.milestones) || new Set(s.milestones).size !== s.milestones.length || s.milestones.some((x: string) => !validMilestoneIds.includes(x)))) throw Error('Invalid milestones');
  if (s.energy !== undefined && (!s.energy || !Number.isInteger(s.energy.count) || s.energy.count < 0 || s.energy.count > ENERGY_MAX_STOCK || !Number.isFinite(s.energy.rechargedAt) || s.energy.rechargedAt < 0)) throw Error('Invalid energy');
  if (s.active?.boosted !== undefined && typeof s.active.boosted !== 'boolean') throw Error('Invalid boost');
  if (s.catOwned !== undefined && typeof s.catOwned !== 'boolean') throw Error('Invalid companion');
  if (s.atmosphere !== undefined && !ATMOSPHERES.some(a => a.id === s.atmosphere)) throw Error('Invalid atmosphere');
  const validHomeIds: string[] = HOMES.map(h => h.id);
  if (s.homes !== undefined && (!Array.isArray(s.homes) || new Set(s.homes).size !== s.homes.length || s.homes.some((x: string) => !validHomeIds.includes(x)))) throw Error('Invalid homes');
  if (s.activeHome !== undefined && !validHomeIds.includes(s.activeHome)) throw Error('Invalid active home');
  const validRideIds: string[] = RIDES.map(r => r.id);
  if (s.rides !== undefined && (!Array.isArray(s.rides) || new Set(s.rides).size !== s.rides.length || s.rides.some((x: string) => !validRideIds.includes(x)))) throw Error('Invalid rides');
  if (s.activeRide !== undefined && !validRideIds.includes(s.activeRide)) throw Error('Invalid active ride');
  const validVentureIds: string[] = VENTURES.map(v => v.id);
  if (s.ventures !== undefined && (!Array.isArray(s.ventures) || new Set(s.ventures).size !== s.ventures.length || s.ventures.some((x: string) => !validVentureIds.includes(x)))) throw Error('Invalid ventures');
  if (s.lastPassiveAt !== undefined && (!Number.isFinite(s.lastPassiveAt) || s.lastPassiveAt < 0)) throw Error('Invalid passive timestamp');
  if (s.activity !== undefined && (!s.activity || typeof s.activity !== 'object' || Array.isArray(s.activity) || Object.entries(s.activity).some(([k, v]) => !/^\d{4}-\d{2}-\d{2}$/.test(k) || !Number.isInteger(v) || (v as number) < 0))) throw Error('Invalid activity');
  if (s.inbox !== undefined && (!Array.isArray(s.inbox) || s.inbox.some((m: MailMessage) => !m || typeof m.id !== 'string' || typeof m.templateId !== 'string' || typeof m.read !== 'boolean' || !Number.isFinite(m.receivedAt)))) throw Error('Invalid inbox');
  const validIds = ITEMS.map(i => i.id);
  if (s.version !== 1 || !Number.isSafeInteger(s.coins) || s.coins < 0 || !Number.isSafeInteger(s.completed) || s.completed < 0 || !Array.isArray(s.owned) || !Array.isArray(s.decorated) || s.owned.some((x: string) => !validIds.includes(x)) || s.decorated.some((x: string) => !s.owned.includes(x))) throw Error('Invalid save');
  if (s.active && (!PROJECTS.some(p => p.id === s.active.projectId) || !Number.isFinite(s.active.startedAt) || !Number.isFinite(s.active.duration) || s.active.duration <= 0 || !Number.isSafeInteger(s.active.reward) || s.active.reward < 0)) throw Error('Invalid project');
  return s;
}
