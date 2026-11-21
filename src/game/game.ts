export const PROJECTS = [
  { id: 'hello', name: 'Hello, world', detail: 'One tiny program. One big beginning.', duration: 15_000, reward: 20 },
  { id: 'bug', name: 'Squash a bug', detail: 'It was a missing semicolon. Probably.', duration: 60_000, reward: 70 },
  { id: 'site', name: 'Build a little website', detail: 'A cozy corner of the internet.', duration: 300_000, reward: 400 },
  { id: 'game', name: 'Ship an indie game', detail: 'A small idea, ready for the world.', duration: 1800_000, reward: 2700 },
];
export const ITEMS = [
  { id: 'keyboard', name: 'Clicky keyboard', description: '+25% project earnings', price: 60, slot: 'equipment', bonus: .25 },
  { id: 'monitor', name: 'Dream monitor', description: '+50% project earnings', price: 240, slot: 'equipment', bonus: .5 },
  { id: 'plant', name: 'Leafy roommate', description: 'A little green on the windowsill', price: 35, slot: 'window', bonus: 0 },
  { id: 'lamp', name: 'Warm desk lamp', description: 'A soft amber glow for late hours', price: 65, slot: 'desk', bonus: 0 },
  { id: 'rug', name: 'Peachy rug', description: 'A soft landing for tired feet', price: 80, slot: 'floor', bonus: 0 },
  { id: 'poster', name: 'Moon print', description: 'For the big dreamer in a small room', price: 120, slot: 'wall', bonus: 0 },
];
export const MILESTONES = [
 { id: 'first-ship', name: 'First launch', detail: 'Ship 1 project', reward: 25, check: (s: Save) => s.completed >= 1 },
 { id: 'steady-hands', name: 'Steady rhythm', detail: 'Ship 3 projects', reward: 50, check: (s: Save) => s.completed >= 3 },
 { id: 'cozy-nook', name: 'Cozy corner', detail: 'Own 2 upgrades or decor pieces', reward: 60, check: (s: Save) => s.owned.length >= 2 },
 { id: 'best-friend', name: 'Warm company', detail: 'Adopt the desk cat', reward: 75, check: (s: Save) => !!s.catOwned },
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
export const ENERGY_REFILL_MS = 30 * 60_000;
export type Save = { milestones?: MilestoneId[]; energy?: { count: number; rechargedAt: number }; catOwned?: boolean; atmosphere?: Atmosphere; version: 1; coins: number; completed: number; owned: string[]; decorated: string[]; active: null | { projectId: string; startedAt: number; duration: number; reward: number; boosted?: boolean } };
export const freshSave = (): Save => ({ version: 1, coins: 0, completed: 0, owned: [], decorated: [], active: null });
export function multiplier(save: Save) { return 1 + ITEMS.filter(i => save.owned.includes(i.id)).reduce((n, i) => n + i.bonus, 0); }
export function startProject(save: Save, id: string, now: number): Save {
  const project = PROJECTS.find(p => p.id === id);
  if (save.active || !project) return save;
  return { ...save, active: { projectId: id, startedAt: now, duration: project.duration, reward: Math.round(project.reward * multiplier(save)) } };
}
export function progress(save: Save, now: number) { return save.active ? Math.min(1, Math.max(0, (now - save.active.startedAt) / save.active.duration)) : 0; }
export function claim(save: Save, now: number): Save {
  if (!save.active || progress(save, now) < 1) return save;
  return { ...save, coins: save.coins + save.active.reward, completed: save.completed + 1, active: null };
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
 if (energy.count === ENERGY_CAP) return { ...save, energy: { count: ENERGY_CAP, rechargedAt: safeNow } };
 const earned = Math.floor((safeNow - energy.rechargedAt) / ENERGY_REFILL_MS);
 if (earned === 0) return save;
 const count = Math.min(ENERGY_CAP, energy.count + earned);
 return { ...save, energy: { count, rechargedAt: count === ENERGY_CAP ? safeNow : energy.rechargedAt + earned * ENERGY_REFILL_MS } };
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
export function parseSave(raw: string): Save {
  const s = JSON.parse(raw);
  const validMilestoneIds: string[] = MILESTONES.map(m => m.id);
  if (s.milestones !== undefined && (!Array.isArray(s.milestones) || new Set(s.milestones).size !== s.milestones.length || s.milestones.some((x: string) => !validMilestoneIds.includes(x)))) throw Error('Invalid milestones');
  if (s.energy !== undefined && (!s.energy || !Number.isInteger(s.energy.count) || s.energy.count < 0 || s.energy.count > ENERGY_CAP || !Number.isFinite(s.energy.rechargedAt) || s.energy.rechargedAt < 0)) throw Error('Invalid energy');
  if (s.active?.boosted !== undefined && typeof s.active.boosted !== 'boolean') throw Error('Invalid boost');
  if (s.catOwned !== undefined && typeof s.catOwned !== 'boolean') throw Error('Invalid companion');
  if (s.atmosphere !== undefined && !ATMOSPHERES.some(a => a.id === s.atmosphere)) throw Error('Invalid atmosphere');
  const validIds = ITEMS.map(i => i.id);
  if (s.version !== 1 || !Number.isSafeInteger(s.coins) || s.coins < 0 || !Number.isSafeInteger(s.completed) || s.completed < 0 || !Array.isArray(s.owned) || !Array.isArray(s.decorated) || s.owned.some((x: string) => !validIds.includes(x)) || s.decorated.some((x: string) => !s.owned.includes(x))) throw Error('Invalid save');
  if (s.active && (!PROJECTS.some(p => p.id === s.active.projectId) || !Number.isFinite(s.active.startedAt) || !Number.isFinite(s.active.duration) || s.active.duration <= 0 || !Number.isSafeInteger(s.active.reward) || s.active.reward < 0)) throw Error('Invalid project');
  return s;
}
