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
import { AlertConfig, CustomAlert } from './src/components/alert';
import { TerminalOverlay } from './src/components/terminal';
import { OtaUpdateSheet, StoreUpdateScreen } from './src/components/update-prompts';
import { LATEST_RELEASE, WhatsNewModal } from './src/components/whats-new';
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
 CURRENT_ONBOARDING_VERSION,
 developerRank,
 DeveloperStyle,
 energyStatus,
 ENERGY_CAP,
 freshSave,
 ITEMS,
 markReleaseSeen,
 MILESTONES,
 MilestoneId,
 multiplier,
 parseSave,
 progress,
 PROJECTS,
 Save,
 setAtmosphere,
 setDeveloperStyle,
 setPlayerName,
 startProject,
 toggleDecoration,
} from './src/game/game';

const KEY = 'pocket-dev.save.v1'; // Keep the original key so existing rooms survive updates.
const projectIcons: Record<string, IconName> = {
 hello: 'terminal',
 bug: 'bug',
 playlist: 'music',
 site: 'code',
 bot: 'bot',
 app: 'smartphone',
 game: 'game',
 os: 'cpu',
};
const CAT_PURRS = [
 'Purrr… your desk cat curls up closer to your keyboard.',
 'Mrrp! A gentle headbutt against your warm coffee mug.',
 'Your desk cat slowly blinks at you. Pure cozy trust.',
 'Tiny paws knead the desk mat while you code.',
];
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
 const [whatsNew, setWhatsNew] = useState(false);
 const [isReturningUpdate, setIsReturningUpdate] = useState(false);
 const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
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

 const updates = useAppUpdates(notify);

 async function load() {
  setLoadError(false);
  try {
   const raw = await AsyncStorage.getItem(KEY);
   const next = raw ? parseSave(raw) : freshSave();
   saveRef.current = next;
   setSave(next);
   // Show full-screen onboarding automatically for brand-new players
   if (!raw) {
    setIsReturningUpdate(false);
    setOnboarding(true);
   } else if (next.lastSeenRelease !== LATEST_RELEASE.id) {
    // Existing player who just updated: show the data-driven What's New popup (from src/changelog.json)
    setWhatsNew(true);
   } else if ((next.onboardingVersion ?? 0) < CURRENT_ONBOARDING_VERSION) {
    setIsReturningUpdate(true);
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
   </View>

   {/* Main Tab View */}
   {tab === 'studio' ? (
    /* Tab 1: Full-Screen Studio View with rounded frame and ambient status pill */
    <View style={s.studioFrame}>
     <View style={s.studioCanvasCard}>
      <Room
       fullScreen
       working={!!active && !ready}
       celebrating={ready || now < celebrateUntil}
       catOwned={!!save.catOwned}
       owned={save.owned}
       decorated={save.decorated}
       atmosphere={save.atmosphere ?? 'sunny'}
       developerStyle={save.developerStyle ?? 'curly'}
       onPetCat={() => {
        const msg = CAT_PURRS[Math.floor(Math.random() * CAT_PURRS.length)]!;
        notify(msg);
       }}
      />

      {/* Simulated Dev Terminal Overlay */}
      <TerminalOverlay
       projectId={active?.projectId}
       working={!!active && !ready}
       ready={ready}
       progress={p}
       playerName={save.playerName}
       rank={developerRank(save.completed)}
       streak={save.streak?.count ?? 0}
       completed={save.completed}
       onOpenProjects={() => setTab('actions')}
      />

      {/* Floating Status Pill over the Studio */}
      <Pressable
       accessibilityRole="button"
       accessibilityLabel={
        ready
         ? `${current?.name ?? 'Project'} is ready to ship, tap to collect coins`
         : active
         ? `Currently working on ${current?.name}, ${time} remaining`
         : 'Studio resting, tap to pick a project'
       }
       onPress={() => {
        if (ready) {
         act(s => claim(s, Date.now()), `Shipped! ${active!.reward} coins in your jar.`, 'coin');
        } else {
         setTab('actions');
        }
       }}
       style={({ pressed }) => [
        s.studioStatusPill,
        ready && { backgroundColor: '#FDF7E7', borderColor: '#E5CFA0' },
        { opacity: pressed ? 0.85 : 1 },
       ]}
      >
       <View
        style={[
         s.statusDot,
         { backgroundColor: ready ? C.gold : active ? '#5C946E' : '#9EB0A5' },
        ]}
       />
       <View style={{ flexShrink: 1 }}>
        <Label style={[s.statusPillTitle, ready && { color: C.gold }]}>
         {ready
          ? `Ready to ship! (+${active?.reward} coins)`
          : active
          ? `Coding ${current?.name} · ${time}`
          : 'Resting · Tap to code'}
        </Label>
       </View>
       <Icon
        name={ready ? 'coin' : active ? 'terminal' : 'arrow'}
        size={15}
        color={ready ? C.gold : active ? C.green : C.muted}
       />
      </Pressable>
     </View>
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

      {/* Developer Rank & Daily Streak Bar */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
       <View style={s.rankPill}>
        <Icon name="trophy" size={14} color={C.green} />
        <Label style={{ fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: C.ink }}>
         {developerRank(save.completed)}
        </Label>
       </View>
       <View style={[s.rankPill, (save.streak?.count ?? 0) > 0 && { backgroundColor: '#FDF4DC', borderColor: '#EAD5A5' }]}>
        <Icon name="flame" size={14} color={(save.streak?.count ?? 0) > 0 ? C.gold : C.muted} />
        <Label
         style={{
          fontSize: 12,
          fontFamily: 'Nunito_800ExtraBold',
          color: (save.streak?.count ?? 0) > 0 ? C.gold : C.muted,
         }}
        >
         {(save.streak?.count ?? 0) > 0 ? `${save.streak!.count}-day streak` : 'Start a streak'}
        </Label>
       </View>
      </View>

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
     onDeveloperStyle={(style: DeveloperStyle) => {
      act(s => setDeveloperStyle(s, style), 'Mascot updated! Looking great.');
     }}
     onPlayerName={(name: string) => {
      act(
       s => setPlayerName(s, name),
       name.trim() ? `Terminal updated for ${name.trim()}!` : 'Nickname cleared.'
      );
     }}
     onReplayOnboarding={() => {
      setIsReturningUpdate(false);
      setOnboarding(true);
     }}
     onOpenWhatsNew={() => setWhatsNew(true)}
     onOpenPrivacy={() => {
      if (typeof window !== 'undefined' && window.history) window.history.pushState({}, '', '/privacy');
      setShowPrivacy(true);
     }}
     onResetData={() => {
      setAlertConfig({
       title: 'Clear studio data?',
       message: 'All your coins, upgrades, milestones and projects will be permanently reset to start fresh.',
       icon: 'alert',
       iconColor: '#B65147',
       options: [
        {
         text: 'Cancel',
         style: 'cancel',
        },
        {
         text: 'Reset data',
         style: 'danger',
         onPress: () => {
          act(() => freshSave(), 'Studio reset. Welcome to a fresh start!');
          setOnboarding(true);
          setTab('studio');
         },
        },
       ],
      });
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
    initialName={save.playerName ?? ''}
    initialStyle={save.developerStyle ?? 'curly'}
    isReturningUpdate={isReturningUpdate}
    onComplete={({ name, style }) => {
     setOnboarding(false);
     setIsReturningUpdate(false);
     act(
      s => completeOnboarding(s, { name, style, releaseId: LATEST_RELEASE.id }),
      name ? `Welcome to your studio, ${name}!` : 'Welcome to your studio!'
     );
    }}
   />

   <WhatsNewModal
    open={whatsNew}
    primaryLabel={
     (save.onboardingVersion ?? 0) < CURRENT_ONBOARDING_VERSION
      ? 'Personalize my studio'
      : 'Awesome, let’s code!'
    }
    secondaryLabel={
     (save.onboardingVersion ?? 0) < CURRENT_ONBOARDING_VERSION ? 'Skip for now' : undefined
    }
    onSecondary={() => {
     setWhatsNew(false);
     act(s => completeOnboarding(s, { releaseId: LATEST_RELEASE.id }), '');
    }}
    onClose={() => {
     setWhatsNew(false);
     if ((save.onboardingVersion ?? 0) < CURRENT_ONBOARDING_VERSION) {
      act(s => markReleaseSeen(s, LATEST_RELEASE.id), '');
      setIsReturningUpdate(true);
      setOnboarding(true);
     } else {
      act(s => markReleaseSeen(s, LATEST_RELEASE.id), '');
     }
    }}
   />

   <CustomAlert
    visible={!!alertConfig}
    config={alertConfig}
    onClose={() => setAlertConfig(null)}
   />

   {/* Dedicated OTA Update Bottom Sheet & Full-Screen Store Update Prompt */}
   <OtaUpdateSheet updates={updates} />
   <StoreUpdateScreen updates={updates} />
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
 studioFrame: {
  flex: 1,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 16,
  paddingTop: 12,
  paddingBottom: 10,
 },
 studioCanvasCard: {
  flex: 1,
  width: '100%',
  maxWidth: 560,
  borderRadius: 32,
  overflow: 'hidden',
  backgroundColor: '#E2EDE2',
  borderWidth: 2,
  borderColor: '#E1E9DA',
  shadowColor: '#25443B',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 16,
  elevation: 4,
 },
 studioStatusPill: {
  position: 'absolute',
  bottom: 14,
  alignSelf: 'center',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  backgroundColor: '#FFFFFFEE',
  borderWidth: 1,
  borderColor: '#E0E7D6',
  paddingHorizontal: 15,
  paddingVertical: 9,
  borderRadius: 20,
  shadowColor: '#203A32',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 10,
  elevation: 3,
 },
 statusDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
 },
 statusPillTitle: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12,
  color: C.ink,
 },
 rankPill: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E6EBDE',
  borderRadius: 16,
  paddingVertical: 9,
  paddingHorizontal: 12,
 },
});
