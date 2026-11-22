import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { Fredoka_500Medium } from '@expo-google-fonts/fredoka/500Medium';
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Room } from './src/components/room';
import { Button, C, Coins, Icon, IconName, Label } from './src/components/ui';
import { Notice, Toast } from './src/components/toast';
import { Shop } from './src/components/shop';
import { PrivacyPolicy } from './src/components/privacy';
import { Onboarding } from './src/components/onboarding';
import { SettingsContent } from './src/components/settings';
import { useAppUpdates } from './src/utils/updates';
import { APP_NAME } from './src/config';
import {
 adoptCat,
 Atmosphere,
 boostProject,
 buy,
 claim,
 claimMilestone,
 completeOnboarding,
 energyStatus,
 ENERGY_CAP,
 freshSave,
 ITEMS,
 MILESTONES,
 MilestoneId,
 multiplier,
 parseSave,
 progress,
 PROJECTS,
 Save,
 setAtmosphere,
 startProject,
 toggleDecoration,
} from './src/game/game';

const KEY = 'pocket-dev.save.v1'; // Keep the original key so existing rooms survive updates.
const projectIcons: Record<string, IconName> = { hello: 'terminal', bug: 'bug', site: 'code', game: 'game' };
type Tab = 'studio' | 'actions' | 'settings';

function Game() {
 const insets = useSafeAreaInsets();
 const [save, setSave] = useState<Save | null>(null);
 const saveRef = useRef<Save | null>(null);
 const busyRef = useRef(false);
 const [celebrateUntil, setCelebrateUntil] = useState(0);
 const [busy, setBusy] = useState(false);
 const [now, setNow] = useState(Date.now());
 const [tab, setTab] = useState<Tab>('studio');
 const [shop, setShop] = useState(false);
 const [onboarding, setOnboarding] = useState(false);
 const [showPrivacy, setShowPrivacy] = useState(() => {
  if (typeof window !== 'undefined' && window.location) {
   return (
    window.location.pathname.includes('privacy') ||
    window.location.hash.includes('privacy') ||
    window.location.search.includes('privacy')
   );
  }
  return false;
 });
 const [notice, setNotice] = useState<Notice>(null);
 const [loadError, setLoadError] = useState(false);
 const noticeId = useRef(0);

 const dismiss = useCallback(() => setNotice(null), []);
 const closeShop = useCallback(() => setShop(false), []);

 const notify = useCallback((text: string, error = false, icon: 'brain' | 'coin' = 'brain') => {
  setNotice({ id: ++noticeId.current, text, error, icon });
 }, []);

 const updates = useAppUpdates(msg => notify(msg));

 async function load() {
  setLoadError(false);
  try {
   const raw = await AsyncStorage.getItem(KEY);
   const next = raw ? parseSave(raw) : freshSave();
   saveRef.current = next;
   setSave(next);
   // Show onboarding automatically for brand-new players
   if (!raw && !next.onboarded && next.completed === 0 && next.coins === 0 && !next.active) {
    setOnboarding(true);
   }
  } catch {
   setLoadError(true);
  }
 }

 useEffect(() => {
  load();
  const interval = setInterval(() => setNow(Date.now()), 500);
  const listener = AppState.addEventListener('change', state => {
   if (state === 'active') setNow(Date.now());
  });
  return () => {
   clearInterval(interval);
   listener.remove();
  };
 }, []);

 async function act(update: (s: Save) => Save, message: string, icon: 'brain' | 'coin' = 'brain') {
  if (busyRef.current || !saveRef.current) return;
  busyRef.current = true;
  setBusy(true);
  try {
   const next = update(saveRef.current);
   if (next === saveRef.current) return;
   await AsyncStorage.setItem(KEY, JSON.stringify(next));
   saveRef.current = next;
   setSave(next);
   setNow(Date.now());
   if (message) notify(message, false, icon);
   if (icon === 'coin') setCelebrateUntil(Date.now() + 2200);
  } catch {
   notify('Couldn’t save. Free some storage and try again.', true);
  } finally {
   busyRef.current = false;
   setBusy(false);
  }
 }

 if (!save)
  return (
   <View style={s.loading}>
    {loadError ? (
     <>
      <Label>Your saved room couldn’t be opened. Your save has been kept safe.</Label>
      <Button onPress={load}>Try again</Button>
     </>
    ) : (
     <>
      <ActivityIndicator color={C.green} />
      <Label>Opening your little studio…</Label>
     </>
    )}
   </View>
  );

 if (showPrivacy)
  return (
   <PrivacyPolicy
    onBack={() => {
     if (typeof window !== 'undefined' && window.history) window.history.pushState({}, '', '/');
     setShowPrivacy(false);
    }}
   />
  );

 const p = progress(save, now);
 const active = save.active;
 const current = PROJECTS.find(x => x.id === active?.projectId);
 const ready = !!active && p >= 1;
 const seconds = active ? Math.max(0, Math.ceil((active.startedAt + active.duration - now) / 1000)) : 0;
 const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
 const energy = energyStatus(save, now);
 const refillSeconds = energy.nextRechargeAt ? Math.max(0, Math.ceil((energy.nextRechargeAt - now) / 1000)) : 0;
 const refillTime = `${Math.floor(refillSeconds / 60)}:${String(refillSeconds % 60).padStart(2, '0')}`;

 function onItem(id: string) {
  const item = ITEMS.find(i => i.id === id)!;
  const owned = save!.owned.includes(id);
  const placed = save!.decorated.includes(id);
  act(
   s => (owned ? toggleDecoration(s, id) : buy(s, id)),
   owned
    ? placed
      ? `${item.name} tucked away.`
      : `${item.name} placed in your room.`
    : `${item.name} is yours. Make yourself at home!`
  );
 }

 function onAtmosphere(id: Atmosphere) {
  act(
   s => setAtmosphere(s, id),
   id === 'sunny'
    ? 'A little sunshine for your studio.'
    : id === 'rainy'
    ? 'Rain outside. Cozy inside.'
    : 'The stars are out. Take it slow.'
  );
 }

 function onMilestone(id: MilestoneId) {
  const m = MILESTONES.find(x => x.id === id)!;
  act(s => claimMilestone(s, id), `${m.name}! ${m.reward} bonus coins in your jar.`, 'coin');
 }

 const readyMilestones = MILESTONES.filter(m => !(save.milestones ?? []).includes(m.id) && m.check(save)).length;

 return (
  <View style={{ flex: 1, backgroundColor: C.bg }}>
   {/* Sticky Header — stays visible while scrolling */}
   <View style={[s.stickyHeaderWrap, { paddingTop: insets.top + 8 }]}>
    <View style={s.header}>
     <View style={{ flexShrink: 1 }}>
      <Label style={s.title}>
       {APP_NAME}
       <Label style={{ color: '#D69F6A', fontSize: 32 }}>.</Label>
      </Label>
     </View>
     <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center' }}>
      <View
       accessibilityLabel={`${energy.count} of ${ENERGY_CAP} energy${
        energy.nextRechargeAt ? `, next refill in ${refillTime}` : ', fully rested'
       }`}
       style={s.energyPill}
      >
       <Icon name="coffee" size={16} color={C.green} />
       <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: C.green }}>
        {energy.count}/{ENERGY_CAP}
       </Label>
      </View>

      <View style={s.wallet}>
       <Coins amount={save.coins} small />
      </View>

      {/* Header Upgrades & Milestones Icon with Count Badge */}
      <Pressable
       accessibilityRole="button"
       accessibilityLabel={`Open upgrades and milestones${
        readyMilestones > 0 ? `, ${readyMilestones} milestone rewards waiting` : ''
       }`}
       onPress={() => setShop(true)}
       style={({ pressed }) => [
        s.headerIconBtn,
        readyMilestones > 0 && { backgroundColor: '#F7EDCE', borderColor: '#E5CFA0' },
        { opacity: pressed ? 0.75 : 1 },
       ]}
      >
       <Icon name="award" size={19} color={readyMilestones > 0 ? C.gold : C.ink} />
       {readyMilestones > 0 && (
        <View style={s.milestoneBadge}>
         <Label style={s.milestoneBadgeText}>{readyMilestones}</Label>
        </View>
       )}
      </Pressable>
     </View>
    </View>

    {/* OTA / Store Update Available Banner */}
    {updates.bannerVisible && (
     <View style={s.updateBanner}>
      <Icon name="download" size={16} color={C.gold} />
      <Label style={{ flex: 1, fontSize: 12, color: C.ink, fontFamily: 'Nunito_800ExtraBold' }}>
       {updates.kind === 'ota-ready'
        ? 'New studio update ready!'
        : `New version ${updates.latestVersion} available!`}
      </Label>
      <Pressable
       accessibilityRole="button"
       onPress={updates.applyUpdate}
       style={({ pressed }) => [s.updateActionBtn, { opacity: pressed ? 0.75 : 1 }]}
      >
       <Label style={{ fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: '#FFFDF4' }}>
        {updates.kind === 'ota-ready' ? 'Reload' : 'Update'}
       </Label>
      </Pressable>
      <Pressable
       accessibilityRole="button"
       accessibilityLabel="Dismiss update notice"
       onPress={updates.dismissBanner}
       style={{ padding: 4 }}
      >
       <Icon name="close" size={15} color={C.muted} />
      </Pressable>
     </View>
    )}
   </View>

   {/* Main Tab View */}
   {tab === 'studio' ? (
    /* Tab 1: Full-Screen Studio View — the animated studio fills the entire screen edge-to-edge */
    <View style={{ flex: 1, width: '100%' }}>
     <Room
      fullScreen
      working={!!active && !ready}
      celebrating={ready || now < celebrateUntil}
      catOwned={!!save.catOwned}
      owned={save.owned}
      decorated={save.decorated}
      atmosphere={save.atmosphere ?? 'sunny'}
     />
    </View>
   ) : tab === 'actions' ? (
    /* Tab 2: Projects & Actions View */
    <ScrollView
     contentInsetAdjustmentBehavior="never"
     contentContainerStyle={{
      paddingTop: 14,
      paddingBottom: 24,
      paddingHorizontal: 22,
      alignItems: 'center',
     }}
    >
     <View style={{ width: '100%', maxWidth: 520, gap: 18 }}>
      <View style={s.status}>
       <View style={s.row}>
        <View style={{ flex: 1 }}>
         <Label style={s.eyebrow}>
          {ready ? 'NICELY DONE, LITTLE DEV' : active ? 'A LITTLE FOCUS' : 'READY WHEN YOU ARE'}
         </Label>
         <Label style={s.subtitle}>
          {ready ? 'Ready to ship!' : current ? current.name : 'Big dreams. Small steps.'}
         </Label>
        </View>
        <Icon name={ready ? 'trophy' : active ? 'keyboard' : 'heart'} size={29} color={ready ? C.gold : C.green} />
       </View>
       {active ? (
        <>
         <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}
          style={s.track}
         >
          <View style={{ width: `${p * 100}%`, height: '100%', backgroundColor: '#83A68B', borderRadius: 20 }} />
         </View>
         <View style={s.row}>
          <Label style={{ fontSize: 12, color: C.muted, flex: 1 }}>
           {ready ? 'Your project is finished.' : 'Keeps going while you’re away.'}
          </Label>
          {ready ? (
           <Coins amount={active.reward} small />
          ) : (
           <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
            <Icon name="clock" size={14} color={C.muted} />
            <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontVariant: ['tabular-nums'] }}>{time}</Label>
           </View>
          )}
         </View>
         {!ready &&
          (active.boosted ? (
           <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Icon name="coffee" size={15} color={C.green} />
            <Label style={{ fontSize: 12, color: C.green, flex: 1 }}>
             Boost used · your reward stays the same
            </Label>
           </View>
          ) : (
           <View style={{ gap: 7 }}>
            <Button
             secondary
             icon="coffee"
             disabled={busy || energy.count === 0}
             onPress={() =>
              act(s => boostProject(s, Date.now()), 'A little boost. 25% of the remaining time saved.')
             }
            >
             Boost · 1 energy
            </Button>
            <Label style={{ textAlign: 'center', fontSize: 11, color: C.muted }}>
             {energy.count === 0
              ? `Next energy in ${refillTime} · one every 30 min`
              : 'Remove 25% of the time left · once per project'}
            </Label>
           </View>
          ))}
         {ready && (
          <Button
           icon="coin"
           disabled={busy}
           onPress={() => act(s => claim(s, Date.now()), `Shipped! ${active.reward} coins in your jar.`, 'coin')}
          >
           Collect {active.reward} coins
          </Button>
         )}
        </>
       ) : (
        <Label style={{ color: C.muted, lineHeight: 22 }}>
         Pick a small project below. Settle into your day. Come back to coins, then make your studio a little more you.
        </Label>
       )}
      </View>

      {/* Upgrades & Milestones Shortcut Card */}
      <Pressable
       accessibilityRole="button"
       accessibilityLabel="Open upgrades and milestones"
       onPress={() => setShop(true)}
       style={({ pressed }) => [s.shopButton, { opacity: pressed ? 0.75 : 1 }]}
      >
       <View style={s.shopIconWrap}>
        <Icon name="award" size={20} color={readyMilestones > 0 ? C.gold : C.ink} />
       </View>
       <View style={{ flex: 1, gap: 2 }}>
        <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 15 }}>Upgrades & milestones</Label>
        <Label style={{ color: C.muted, fontSize: 12 }}>
         {readyMilestones > 0
          ? `${readyMilestones} milestone reward${readyMilestones > 1 ? 's' : ''} ready to claim`
          : 'Desk gear, room decor & studio milestones'}
        </Label>
       </View>
       {readyMilestones > 0 && (
        <View style={{ backgroundColor: '#F7EDCE', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4 }}>
         <Label style={{ fontSize: 11, fontFamily: 'Nunito_800ExtraBold', color: C.gold }}>+{readyMilestones}</Label>
        </View>
       )}
       <Icon name="arrow" size={19} color={C.green} />
      </Pressable>

      <View style={{ gap: 12 }}>
       <View style={s.row}>
        <Label style={s.subtitle}>One small thing at a time</Label>
        <Label style={{ color: C.muted, fontSize: 12 }}>{multiplier(save).toFixed(2)}× earnings</Label>
       </View>
       {PROJECTS.map(project => (
        <View key={project.id} style={s.card}>
         <View style={s.row}>
          <View style={s.icon}>
           <Icon name={projectIcons[project.id]} size={26} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
           <Label style={s.cardTitle}>{project.name}</Label>
           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
             <Icon name="clock" size={13} color={C.muted} />
             <Label style={{ fontSize: 12, color: C.muted }}>
              {project.duration < 60000 ? '15 sec' : `${project.duration / 60000} min`}
             </Label>
            </View>
            <Coins amount={Math.round(project.reward * multiplier(save))} small />
           </View>
          </View>
         </View>
         <Label style={{ color: C.muted, fontSize: 13 }}>{project.detail}</Label>
         <Button
          secondary
          icon={!active ? 'arrow' : undefined}
          disabled={busy || !!active}
          onPress={() => {
           act(s => startProject(s, project.id, Date.now()), 'Project started. Your little dev has it from here.');
          }}
         >
          {active
           ? active.projectId === project.id
             ? ready
               ? 'Ready to collect above'
               : 'Working on this…'
             : 'One project at a time'
           : 'Start project'}
         </Button>
        </View>
       ))}
      </View>
     </View>
    </ScrollView>
   ) : (
    /* Tab 3: Studio Settings View */
    <SettingsContent
     save={save}
     busy={busy}
     onAtmosphere={onAtmosphere}
     onReplayOnboarding={() => setOnboarding(true)}
     onOpenPrivacy={() => {
      if (typeof window !== 'undefined' && window.history) window.history.pushState({}, '', '/privacy');
      setShowPrivacy(true);
     }}
     updates={updates}
    />
   )}

   {/* Bottom Tab Navigation Bar: Icon-Only (Studio, Projects, Settings) */}
   <View style={[s.bottomBarWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
    <View style={s.bottomBar}>
     <Pressable
      accessibilityRole="tab"
      accessibilityLabel="Studio"
      accessibilityState={{ selected: tab === 'studio' }}
      onPress={() => setTab('studio')}
      style={({ pressed }) => [s.tabBtn, tab === 'studio' && s.tabBtnActive, { opacity: pressed ? 0.8 : 1 }]}
     >
      <Icon name="house" size={22} color={tab === 'studio' ? C.green : C.muted} />
     </Pressable>

     <Pressable
      accessibilityRole="tab"
      accessibilityLabel="Projects"
      accessibilityState={{ selected: tab === 'actions' }}
      onPress={() => setTab('actions')}
      style={({ pressed }) => [s.tabBtn, tab === 'actions' && s.tabBtnActive, { opacity: pressed ? 0.8 : 1 }]}
     >
      <View style={{ position: 'relative' }}>
       <Icon name="tasks" size={22} color={tab === 'actions' ? C.green : C.muted} />
       {ready && <View style={s.tabReadyDot} />}
      </View>
     </Pressable>

     <Pressable
      accessibilityRole="tab"
      accessibilityLabel="Settings"
      accessibilityState={{ selected: tab === 'settings' }}
      onPress={() => setTab('settings')}
      style={({ pressed }) => [s.tabBtn, tab === 'settings' && s.tabBtnActive, { opacity: pressed ? 0.8 : 1 }]}
     >
      <View style={{ position: 'relative' }}>
       <Icon name="settings" size={22} color={tab === 'settings' ? C.green : C.muted} />
       {updates.kind !== 'none' && <View style={s.tabReadyDot} />}
      </View>
     </Pressable>
    </View>
   </View>

   {!shop && !onboarding && <Toast notice={notice} onDismiss={dismiss} />}

   <Shop
    open={shop}
    onClose={closeShop}
    save={save}
    busy={busy}
    onItem={onItem}
    onAtmosphere={onAtmosphere}
    onAdopt={() => act(adoptCat, 'A little friend. A little more home.')}
    onMilestone={onMilestone}
    notice={notice}
    onDismiss={dismiss}
   />

   <Onboarding
    open={onboarding}
    onComplete={() => {
     setOnboarding(false);
     act(completeOnboarding, 'Welcome to your studio!');
    }}
   />
  </View>
 );
}

export default function App() {
 const [fonts, error] = useFonts({
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
 });
 if (!fonts && !error)
  return (
   <View style={s.loading}>
    <ActivityIndicator color={C.green} />
   </View>
  );
 return (
  <SafeAreaProvider>
   <StatusBar style="dark" />
   <Game />
  </SafeAreaProvider>
 );
}

const s = StyleSheet.create({
 loading: {
  flex: 1,
  backgroundColor: C.bg,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 32,
  gap: 20,
 },
 stickyHeaderWrap: {
  backgroundColor: C.bg,
  borderBottomWidth: 1,
  borderBottomColor: '#E8EDE0',
  paddingHorizontal: 20,
  paddingBottom: 10,
  alignItems: 'center',
  gap: 10,
  zIndex: 10,
 },
 header: {
  width: '100%',
  maxWidth: 520,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
 },
 title: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 32,
  letterSpacing: -0.7,
 },
 energyPill: {
  flexDirection: 'row',
  gap: 5,
  alignItems: 'center',
  backgroundColor: '#E6EEDC',
  paddingHorizontal: 10,
  paddingVertical: 9,
  borderRadius: 18,
 },
 wallet: {
  paddingHorizontal: 12,
  paddingVertical: 9,
  borderRadius: 18,
  backgroundColor: '#F7EDCE',
 },
 headerIconBtn: {
  width: 39,
  height: 39,
  borderRadius: 14,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E4EADB',
  alignItems: 'center',
  justifyContent: 'center',
 },
 milestoneBadge: {
  position: 'absolute',
  top: -5,
  right: -5,
  minWidth: 19,
  height: 19,
  borderRadius: 10,
  backgroundColor: C.gold,
  paddingHorizontal: 5,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 1.5,
  borderColor: C.bg,
 },
 milestoneBadgeText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  color: '#FFFDF4',
 },
 updateDot: {
  position: 'absolute',
  top: -3,
  right: -3,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: C.gold,
  borderWidth: 1.5,
  borderColor: C.bg,
 },
 updateBanner: {
  width: '100%',
  maxWidth: 520,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  backgroundColor: '#F7EDCE',
  borderWidth: 1,
  borderColor: '#E6CFA0',
  borderRadius: 16,
  paddingHorizontal: 12,
  paddingVertical: 8,
 },
 updateActionBtn: {
  backgroundColor: C.green,
  paddingHorizontal: 11,
  paddingVertical: 6,
  borderRadius: 11,
 },
 studioTabContainer: {
  flexGrow: 1,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 14,
 },
 studioFooterCard: {
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E6EBDE',
  borderRadius: 24,
  padding: 16,
  gap: 12,
 },
 quickSwitchBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  backgroundColor: '#EEF3E7',
  paddingVertical: 11,
  borderRadius: 16,
 },
 eyebrow: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 9,
  letterSpacing: 1.5,
  color: C.muted,
  marginBottom: 5,
 },
 shopButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E6EBDE',
  borderRadius: 22,
  padding: 13,
 },
 shopIconWrap: {
  width: 39,
  height: 39,
  borderRadius: 14,
  backgroundColor: '#F7E4D1',
  alignItems: 'center',
  justifyContent: 'center',
 },
 status: {
  backgroundColor: '#EEF3E7',
  borderRadius: 24,
  padding: 20,
  gap: 14,
 },
 subtitle: {
  fontFamily: 'Fredoka_500Medium',
  fontSize: 21,
  flexShrink: 1,
 },
 row: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
 },
 track: {
  height: 10,
  backgroundColor: '#DCE5D5',
  borderRadius: 20,
  overflow: 'hidden',
 },
 card: {
  borderRadius: 24,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E9EEE2',
  padding: 18,
  gap: 13,
 },
 icon: {
  width: 49,
  height: 49,
  borderRadius: 17,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#EBEFDD',
 },
 cardTitle: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 16,
 },
 bottomBarWrap: {
  backgroundColor: C.bg,
  borderTopWidth: 1,
  borderTopColor: '#E8EDE0',
  paddingTop: 10,
  paddingHorizontal: 22,
  alignItems: 'center',
 },
 bottomBar: {
  width: '100%',
  maxWidth: 520,
  flexDirection: 'row',
  backgroundColor: '#EEF3E7',
  borderRadius: 22,
  padding: 5,
  gap: 6,
 },
 tabBtn: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 11,
  borderRadius: 17,
 },
 tabBtnActive: {
  backgroundColor: '#FFFFFF',
 },
 tabReadyDot: {
  position: 'absolute',
  top: -3,
  right: -5,
  width: 9,
  height: 9,
  borderRadius: 5,
  backgroundColor: C.gold,
  borderWidth: 1.5,
  borderColor: '#FFFFFF',
 },
});
