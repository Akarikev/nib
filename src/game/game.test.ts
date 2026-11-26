import { describe, expect, test } from 'bun:test';
import { adoptCat, applyDevEventChoice, awardArcadeCoins, boostProject, buyEnergyRefill, buyOrSelectHome, buyOrSelectRide, buyVenture, claimMilestone, clearReadMail, codeAlongFixBug, codeAlongTap, collectPassive, completeOnboarding, CURRENT_ONBOARDING_VERSION, deleteMail, developerRank, energyStatus, ENERGY_REFILL_MS, ensureStarterMail, markMailRead, multiplier, netWorth, passiveRatePerHour, pendingPassiveCoins, projectsForDifficulty, recentActivityGrid, refillEnergy, replyToMail, resolveAtmosphere, buy, claim, freshSave, parseSave, progress, PROJECTS, setAtmosphere, setDeveloperStyle, setDifficulty, setHapticsEnabled, setPlayerName, setSoundEnabled, startProject, toggleDecoration } from './game';
describe('offline project loop', () => {
 test('progress survives serialization and rewards exactly once', () => {
  const active = startProject(freshSave(), 'hello', 1000);
  const loaded = parseSave(JSON.stringify(active));
  expect(progress(loaded, 8500)).toBe(.5);
  expect(claim(loaded, 15999).coins).toBe(0);
  const paid = claim(loaded, 16000);
  expect(paid.coins).toBe(20); expect(claim(paid, 90000).coins).toBe(20); expect(paid.completed).toBe(1);
 });
 test('cannot replace a running project', () => { const s = startProject(freshSave(), 'hello', 0); expect(startProject(s, 'game', 1)).toBe(s); });
 test('purchases are affordable, unique, and boost only future work', () => {
  const s = { ...freshSave(), coins: 100 };
  const running = startProject(s, 'hello', 0); const upgraded = buy(running, 'keyboard');
  expect(upgraded.coins).toBe(40); expect(upgraded.active?.reward).toBe(20);
  expect(buy(upgraded, 'keyboard')).toBe(upgraded); expect(buy(upgraded, 'monitor')).toBe(upgraded);
  expect(startProject(claim(upgraded, 15000), 'hello', 16000).active?.reward).toBe(25);
 });
 test('decorations equip and remove without charging twice', () => { const s = buy({ ...freshSave(), coins: 100 }, 'plant'); expect(s.decorated).toContain('plant'); expect(toggleDecoration(s, 'plant').decorated).toEqual([]); });
 test('clock rollback never creates negative progress', () => { expect(progress(startProject(freshSave(), 'hello', 1000), 0)).toBe(0); });
 test('corrupt saves are rejected', () => { expect(() => parseSave('{"version":1}')).toThrow(); });
});

describe('room atmosphere saves', () => {
 test('old saves remain readable and moods persist without spending coins', () => {
  const old = parseSave(JSON.stringify(freshSave()));
  expect(old.atmosphere).toBeUndefined();
  const changed = setAtmosphere(old, 'rainy');
  expect(parseSave(JSON.stringify(changed)).atmosphere).toBe('rainy');
  expect(changed.coins).toBe(0);
  expect(setAtmosphere(changed, 'rainy')).toBe(changed);
 });
 test('unknown atmosphere is rejected without resetting a save', () => {
  expect(() => parseSave(JSON.stringify({ ...freshSave(), atmosphere: 'invalid' }))).toThrow();
 });
});

describe('adopted companion', () => {
 test('adoption spends earned coins once and persists ownership', () => {
  const old = parseSave(JSON.stringify({ ...freshSave(), coins: 140 }));
  expect(old.catOwned).toBeUndefined();
  const adopted = adoptCat(old);
  expect(adopted.coins).toBe(40); expect(adopted.catOwned).toBe(true);
  expect(adoptCat(adopted)).toBe(adopted);
  const loaded = parseSave(JSON.stringify(adopted));
  expect(loaded.catOwned).toBe(true); expect(loaded.coins).toBe(40);
  expect(multiplier(loaded)).toBe(1);
 });
 test('cannot adopt with insufficient coins, and malformed ownership is rejected', () => {
  const poor = freshSave(); expect(adoptCat(poor)).toBe(poor);
  expect(() => parseSave(JSON.stringify({ ...poor, catOwned: 'yes' }))).toThrow();
 });
});
describe('offline energy and single project boost', () => {
 test('old saves begin with a full reserve without losing existing progress', () => {
  const old = startProject({ ...freshSave(), coins: 80 }, 'hello', 0);
  expect(energyStatus(old, 5000).count).toBe(3);
  const boosted = boostProject(parseSave(JSON.stringify(old)), 5000);
  expect(boosted.energy?.count).toBe(2); expect(boosted.coins).toBe(80);
  expect(boosted.active?.duration).toBe(12500); expect(boosted.active?.reward).toBe(20);
  expect(boostProject(boosted, 6000)).toBe(boosted);
  const loaded = parseSave(JSON.stringify(boosted)); expect(loaded.active?.boosted).toBe(true);
  expect(claim(loaded, 12499).coins).toBe(80);
  const paid = claim(loaded, 12500); expect(paid.coins).toBe(100); expect(claim(paid, 20000).coins).toBe(100);
 });
 test('refills offline at 30-minute boundaries, carries partial progress, and caps at three', () => {
  const s = { ...freshSave(), energy: { count: 0, rechargedAt: 1000 } };
  expect(energyStatus(s, 1000 + ENERGY_REFILL_MS - 1).count).toBe(0);
  expect(energyStatus(s, 1000 + ENERGY_REFILL_MS).count).toBe(1);
  const partial = refillEnergy(s, 1000 + ENERGY_REFILL_MS * 1.5);
  expect(partial.energy?.rechargedAt).toBe(1000 + ENERGY_REFILL_MS);
  expect(energyStatus(partial, 1000 + ENERGY_REFILL_MS * 2).count).toBe(2);
  expect(energyStatus(parseSave(JSON.stringify(s)), 1000 + ENERGY_REFILL_MS * 100).count).toBe(3);
  expect(energyStatus(s, 0).count).toBe(0);
 });
 test('full reserves cannot bank extra refill time, and boosts never spend below zero', () => {
  const full = { ...startProject(freshSave(), 'game', 0), energy: { count: 3, rechargedAt: 0 } };
  const boosted = boostProject(full, ENERGY_REFILL_MS / 2);
  expect(boosted.energy?.rechargedAt).toBe(ENERGY_REFILL_MS / 2);
  expect(energyStatus(boosted, ENERGY_REFILL_MS - 1).count).toBe(2);
  const empty = { ...startProject(freshSave(), 'hello', 1000), energy: { count: 0, rechargedAt: 1000 } };
  expect(boostProject(empty, 2000)).toBe(empty);
 });
 test('idle, finished and clock-rollback projects cannot be boosted', () => {
  const idle = freshSave(); expect(boostProject(idle, 1000)).toBe(idle);
  const s = startProject(idle, 'hello', 1000);
  expect(boostProject(s, 16000)).toBe(s); expect(boostProject(s, 0)).toBe(s);
  expect(() => parseSave(JSON.stringify({ ...idle, energy: { count: -1, rechargedAt: 0 } }))).toThrow();
 });
});

describe('warm desk lamp and studio milestones', () => {
 test('desk lamp equips and toggles, and milestones pay out exactly once when criteria are met', () => {
  const s = buy({ ...freshSave(), coins: 100, completed: 1 }, 'lamp');
  expect(s.coins).toBe(35); expect(s.decorated).toContain('lamp');
  expect(claimMilestone(s, 'steady-hands')).toBe(s);
  const claimed = claimMilestone(s, 'first-ship');
  expect(claimed.coins).toBe(60);
  expect(claimed.milestones).toEqual(['first-ship']);
  expect(claimMilestone(claimed, 'first-ship')).toBe(claimed);
  const loaded = parseSave(JSON.stringify(claimed));
  expect(loaded.milestones).toEqual(['first-ship']);
  expect(() => parseSave(JSON.stringify({ ...loaded, milestones: ['first-ship', 'first-ship'] }))).toThrow();
  expect(() => parseSave(JSON.stringify({ ...loaded, milestones: ['unknown'] }))).toThrow();
 });
 test('cozy headphones boost earnings and onboarding state persists safely', () => {
  const s = buy({ ...freshSave(), coins: 200 }, 'headphones');
  expect(s.coins).toBe(60);
  expect(multiplier(s)).toBeCloseTo(1.35);
  const done = completeOnboarding(s);
  expect(done.onboarded).toBe(true);
  expect(done.onboardingVersion).toBe(CURRENT_ONBOARDING_VERSION);
  expect(completeOnboarding(done)).toBe(done);
  expect(parseSave(JSON.stringify(done)).onboarded).toBe(true);
  expect(() => parseSave(JSON.stringify({ ...done, onboarded: 'yes' }))).toThrow();
 });
 test('nickname, mascot variants, and returning-user onboarding version persist safely', () => {
  const legacyRaw = JSON.stringify({ version: 1, coins: 50, completed: 2, owned: [], decorated: [], active: null });
  const legacy = parseSave(legacyRaw);
  expect(legacy.playerName).toBeUndefined();
  expect(legacy.onboardingVersion).toBeUndefined();
  const personalized = completeOnboarding(legacy, { name: '  Elorm  ', style: 'bob' });
  expect(personalized.playerName).toBe('Elorm');
  expect(personalized.developerStyle).toBe('bob');
  expect(personalized.onboardingVersion).toBe(CURRENT_ONBOARDING_VERSION);
  const reloaded = parseSave(JSON.stringify(personalized));
  expect(reloaded.playerName).toBe('Elorm');
  expect(reloaded.developerStyle).toBe('bob');
  expect(setPlayerName(reloaded, '   ').playerName).toBeUndefined();
  expect(setDeveloperStyle(reloaded, 'cap').developerStyle).toBe('cap');
  expect(() => parseSave(JSON.stringify({ ...reloaded, developerStyle: 'alien' }))).toThrow();
  expect(() => parseSave(JSON.stringify({ ...reloaded, playerName: 'a'.repeat(40) }))).toThrow();
 });
 test('expanded projects, espresso/fairy lights, developer rank, and daily coding streak', () => {
  expect(PROJECTS.length).toBe(12);
  const s0 = buy(buy({ ...freshSave(), coins: 700 }, 'espresso'), 'lights');
  expect(s0.coins).toBe(130);
  expect(multiplier(s0)).toBeCloseTo(1.65);
  expect(s0.decorated).toContain('lights');
  // Day 1 ship
  const day1 = Date.UTC(2026, 10, 10, 12, 0, 0);
  const run1 = startProject(s0, 'playlist', day1);
  const done1 = claim(run1, day1 + 120_000);
  expect(done1.streak?.count).toBe(1);
  // Same day second ship does not double-increment streak
  const done1b = claim(startProject(done1, 'hello', day1 + 200_000), day1 + 220_000);
  expect(done1b.streak?.count).toBe(1);
  // Next day ship increments streak to 2
  const day2 = day1 + 86_400_000;
  const done2 = claim(startProject(done1b, 'bot', day2), day2 + 600_000);
  expect(done2.streak?.count).toBe(2);
  expect(parseSave(JSON.stringify(done2)).streak?.count).toBe(2);
  expect(developerRank(0)).toBe('Curious Tinkerer');
  expect(developerRank(3)).toBe('Junior Builder');
  expect(developerRank(8)).toBe('Cozy Crafter');
  expect(developerRank(16)).toBe('Indie Maker');
  expect(developerRank(30)).toBe('Studio Legend');
  expect(() => parseSave(JSON.stringify({ ...done2, streak: { count: -1, lastDay: '2026-11-10' } }))).toThrow();
 });
 test('homes, dream rides, instant coffee refill, and net worth persist safely', () => {
  const rich = { ...freshSave(), coins: 6000, energy: { count: 1, rechargedAt: 1000 } };
  const sf = buyOrSelectHome(rich, 'sf');
  expect(sf.coins).toBe(1500);
  expect(sf.activeHome).toBe('sf');
  expect(sf.homes).toContain('sf');
  expect(multiplier(sf)).toBeCloseTo(1.6);
  // Moving back to starter bedroom is free
  const backHome = buyOrSelectHome(sf, 'bedroom');
  expect(backHome.coins).toBe(1500);
  expect(backHome.activeHome).toBe('bedroom');
  // Buying a ride adds to garage & multiplier
  const withBike = buyOrSelectRide(backHome, 'bike');
  expect(withBike.coins).toBe(1000);
  expect(withBike.activeRide).toBe('bike');
  expect(multiplier(withBike)).toBeCloseTo(1.75);
  // Instant coffee refill spends 120 coins and adds +1 energy
  const refilled = buyEnergyRefill(withBike, 2000);
  expect(refilled.coins).toBe(880);
  expect(refilled.energy?.count).toBe(2);
  expect(netWorth(refilled)).toBe(880 + 4500 + 500);
  const loaded = parseSave(JSON.stringify(refilled));
  expect(loaded.homes).toContain('sf');
  expect(loaded.rides).toContain('bike');
  expect(() => parseSave(JSON.stringify({ ...loaded, activeHome: 'mars' }))).toThrow();
  expect(() => parseSave(JSON.stringify({ ...loaded, activeRide: 'ufo' }))).toThrow();
 });
 test('Nib Mail inbox, overfill coffee buying, code-along flow, and contribution heatmap', () => {
  // Overfill coffee above 3/3 free cap
  const s0 = { ...freshSave(), coins: 500, energy: { count: 3, rechargedAt: 1000 } };
  const s1 = buyEnergyRefill(s0, 2000);
  expect(s1.energy?.count).toBe(4);
  expect(s1.coins).toBe(380);
  expect(energyStatus(s1, 9_000_000).count).toBe(4);
  // Code-along tap shaves 4 seconds
  const run = startProject(s1, 'bug', 10_000);
  const faster = codeAlongTap(run, 15_000);
  expect(faster.active?.duration).toBe(56_000);
  // Starter mail, read, idempotent reply, clear read
  const withMail = ensureStarterMail(faster, 20_000);
  expect(withMail.inbox?.length).toBe(3);
  expect(withMail.inbox?.filter(m => !m.read).length).toBe(2);
  const firstUnread = withMail.inbox!.find(m => !m.read)!;
  const readOne = markMailRead(withMail, firstUnread.id);
  expect(readOne.inbox!.find(m => m.id === firstUnread.id)?.read).toBe(true);
  const replied = replyToMail(readOne, firstUnread.id, 0, 25_000);
  expect(replied.inbox!.find(m => m.id === firstUnread.id)?.replied).toBe(true);
  expect(replyToMail(replied, firstUnread.id, 0, 26_000)).toBe(replied);
  const deleted = deleteMail(replied, firstUnread.id);
  expect(deleted.inbox?.length).toBe(2);
  const cleared = clearReadMail(deleted);
  expect(cleared.inbox?.every(m => !m.read)).toBe(true);
  // Contribution activity recorded on claim
  const shipped = claim(run, 80_000);
  const grid = recentActivityGrid(shipped, 80_000, 7);
  expect(grid.length).toBe(7);
  expect(grid[grid.length - 1]?.count).toBe(1);
  expect(parseSave(JSON.stringify(shipped)).inbox?.length).toBeGreaterThanOrEqual(1);
 });
 test('OLED/TV/bed/goldfish items, side-project passive income, code-along bug fix, and dev events', () => {
  let s = { ...freshSave(), coins: 2500 };
  s = buy(s, 'oled');
  s = buy(s, 'tv');
  s = buy(s, 'bed');
  s = buy(s, 'goldfish');
  expect(s.owned).toEqual(['oled', 'tv', 'bed', 'goldfish']);
  expect(s.decorated).toEqual(['tv', 'bed', 'goldfish']);
  expect(multiplier(s)).toBeCloseTo(1.75);
  // Launch side-project venture & collect offline passive income
  const t0 = 1_000_000;
  const v = buyVenture(s, 'tipjar', t0);
  expect(v.ventures).toEqual(['tipjar']);
  expect(passiveRatePerHour(v)).toBe(15);
  expect(pendingPassiveCoins(v, t0 + 2 * 3_600_000)).toBe(30);
  const collected = collectPassive(v, t0 + 2 * 3_600_000);
  expect(collected.coins).toBe(v.coins + 30);
  expect(pendingPassiveCoins(collected, t0 + 2 * 3_600_000)).toBe(0);
  // Code-along bug fix shaves 10s
  const running = startProject(collected, 'bug', t0 + 2 * 3_600_000);
  const fixed = codeAlongFixBug(running, t0 + 2 * 3_600_000 + 5_000);
  expect(fixed.active?.duration).toBe(50_000);
  // Dev event speed & coin choices
  const sped = applyDevEventChoice(fixed, { kind: 'speed', percent: 0.2 }, t0 + 2 * 3_600_000 + 5_000);
  expect(sped.active!.duration).toBeLessThan(fixed.active!.duration);
  const gifted = applyDevEventChoice(sped, { kind: 'coins', amount: 80 }, t0 + 2 * 3_600_000 + 5_000);
  expect(gifted.coins).toBe(sped.coins + 80);
  expect(parseSave(JSON.stringify(gifted)).ventures).toEqual(['tipjar']);
 });
 test('sound and haptics preferences persist safely without breaking v1 saves', () => {
  const s0 = freshSave();
  expect(s0.soundEnabled).toBeUndefined();
  expect(s0.hapticsEnabled).toBeUndefined();
  const muted = setSoundEnabled(s0, false);
  const quiet = setHapticsEnabled(muted, false);
  const loaded = parseSave(JSON.stringify(quiet));
  expect(loaded.soundEnabled).toBe(false);
  expect(loaded.hapticsEnabled).toBe(false);
  expect(() => parseSave(JSON.stringify({ ...loaded, soundEnabled: 'yes' }))).toThrow();
 });
 test('auto time-of-day weather and phone arcade coin rewards work safely', () => {
  const autoSave = setAtmosphere(freshSave(), 'auto');
  expect(parseSave(JSON.stringify(autoSave)).atmosphere).toBe('auto');
  const nightMs = new Date(2026, 10, 26, 22, 0, 0).getTime();
  const morningMs = new Date(2026, 10, 26, 9, 0, 0).getTime();
  expect(resolveAtmosphere('auto', nightMs)).toBe('moonlit');
  expect(resolveAtmosphere('auto', morningMs)).toBe('sunny');
  expect(resolveAtmosphere('rainy', morningMs)).toBe('rainy');
  const rewarded = awardArcadeCoins(autoSave, 48);
  expect(rewarded.coins).toBe(48);
  expect(awardArcadeCoins(rewarded, 9999).coins).toBe(48 + 250);
  // Difficulty level persistence and task filtering
  const chill = setDifficulty(rewarded, 'chill');
  expect(parseSave(JSON.stringify(chill)).difficulty).toBe('chill');
  expect(projectsForDifficulty('chill').length).toBeLessThan(projectsForDifficulty('pro').length);
  expect(projectsForDifficulty('pro').length).toBe(12);
  expect(() => parseSave(JSON.stringify({ ...chill, difficulty: 'extreme' }))).toThrow();
 });
});
