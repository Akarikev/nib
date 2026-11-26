import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ATMOSPHERES, Atmosphere, DEVELOPER_STYLES, DIFFICULTIES, Difficulty, developerRank, DeveloperStyle, ITEMS, MILESTONES, multiplier, netWorth, recentActivityGrid, Save } from '../game/game';
import { MascotPreview } from './developer';
import { StudioCardModal } from './studio-card';
import { Button, C, Icon, IconName, Label } from './ui';
import { APP_NAME, APP_VERSION } from '../config';
import { UpdateState } from '../utils/updates';

type SettingsSection = 'menu' | 'profile' | 'mood' | 'difficulty' | 'sound' | 'stats' | 'updates' | 'help' | 'data';

function SectionHeader({ title, subtitle, onBack }: { title: string; subtitle: string; onBack: () => void }) {
 return (
  <View style={s.subHeader}>
   <Pressable
    accessibilityRole="button"
    accessibilityLabel="Back to settings"
    onPress={onBack}
    style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.7 }]}
   >
    <Icon name="back" size={18} color={C.ink} />
    <Label style={s.backText}>Settings</Label>
   </Pressable>
   <View style={{ gap: 2 }}>
    <Label style={s.subTitle}>{title}</Label>
    <Label style={{ fontSize: 13, color: C.muted }}>{subtitle}</Label>
   </View>
  </View>
 );
}

function MenuRow({
 icon,
 iconBg,
 iconColor,
 title,
 subtitle,
 badgeDot,
 danger,
 onPress,
}: {
 icon: IconName;
 iconBg: string;
 iconColor?: string;
 title: string;
 subtitle: string;
 badgeDot?: boolean;
 danger?: boolean;
 onPress: () => void;
}) {
 return (
  <Pressable
   accessibilityRole="button"
   accessibilityLabel={`${title}: ${subtitle}`}
   onPress={onPress}
   style={({ pressed }) => [s.menuRow, pressed && { backgroundColor: '#F3F7EE' }]}
  >
   <View style={[s.menuIconBox, { backgroundColor: iconBg }]}>
    <Icon name={icon} size={19} color={iconColor ?? C.green} />
    {badgeDot && <View style={s.rowBadgeDot} />}
   </View>
   <View style={{ flex: 1, gap: 2 }}>
    <Label style={[s.menuRowTitle, danger && { color: '#B65147' }]}>{title}</Label>
    <Label numberOfLines={1} style={s.menuRowSub}>
     {subtitle}
    </Label>
   </View>
   <Icon name="chevron" size={18} color={C.muted} />
  </Pressable>
 );
}

export function SettingsContent({
 save,
 busy,
 onAtmosphere,
 onDeveloperStyle,
 onPlayerName,
 onSoundToggle,
 onHapticsToggle,
 onDifficulty,
 onReplayOnboarding,
 onOpenWhatsNew,
 onOpenPrivacy,
 onResetData,
 updates,
}: {
 save: Save;
 busy: boolean;
 onAtmosphere: (id: Atmosphere) => void;
 onDeveloperStyle: (style: DeveloperStyle) => void;
 onPlayerName: (name: string) => void;
 onSoundToggle?: (enabled: boolean) => void;
 onHapticsToggle?: (enabled: boolean) => void;
 onDifficulty?: (difficulty: Difficulty) => void;
 onReplayOnboarding: () => void;
 onOpenWhatsNew: () => void;
 onOpenPrivacy: () => void;
 onResetData: () => void;
 updates: UpdateState;
}) {
 const [section, setSection] = useState<SettingsSection>('menu');
 const [showCard, setShowCard] = useState(false);
 const [draftName, setDraftName] = useState(save.playerName ?? '');

 useEffect(() => {
  setDraftName(save.playerName ?? '');
 }, [save.playerName]);

 const claimedCount = (save.milestones ?? []).length;
 const currentDev = DEVELOPER_STYLES.find(d => d.id === (save.developerStyle ?? 'curly')) ?? DEVELOPER_STYLES[0];
 const currentMood = ATMOSPHERES.find(a => a.id === (save.atmosphere ?? 'sunny')) ?? ATMOSPHERES[0];
 const nameChanged = draftName.trim() !== (save.playerName ?? '');

 return (
  <ScrollView
   contentInsetAdjustmentBehavior="never"
   keyboardShouldPersistTaps="handled"
   contentContainerStyle={{
    paddingTop: 14,
    paddingBottom: 32,
    paddingHorizontal: 22,
    alignItems: 'center',
   }}
  >
   <View style={{ width: '100%', maxWidth: 520, gap: 16 }}>
    {section === 'menu' && (
     <>
      {/* Studio Profile Summary Banner */}
      <Pressable
       accessibilityRole="button"
       accessibilityLabel="Open profile and mascot settings"
       onPress={() => setSection('profile')}
       style={({ pressed }) => [s.profileBanner, pressed && { opacity: 0.85 }]}
      >
       <MascotPreview style={save.developerStyle ?? 'curly'} size={56} />
       <View style={{ flex: 1, gap: 3 }}>
        <Label style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 20, color: C.ink }}>
         {save.playerName?.trim() || 'Cozy Developer'}
        </Label>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
         <View style={s.rankBadge}>
          <Label style={s.rankBadgeText}>{developerRank(save.completed)}</Label>
         </View>
         <Label style={{ fontSize: 12, color: C.muted }}>
          {currentDev.name} · {currentDev.subtitle}
         </Label>
        </View>
       </View>
       <Icon name="chevron" size={19} color={C.muted} />
      </Pressable>

      {/* Group 1: Personalization */}
      <View style={s.groupWrap}>
       <Label style={s.groupLabel}>PERSONALIZE</Label>
       <View style={s.groupCard}>
        <MenuRow
         icon="user"
         iconBg="#E6EEDC"
         title="Nickname & mascot"
         subtitle={
          save.playerName
           ? `${save.playerName} · ${currentDev.name} (${currentDev.tag})`
           : `No nickname set · ${currentDev.name}`
         }
         onPress={() => setSection('profile')}
        />
        <View style={s.divider} />
        <MenuRow
         icon={currentMood.icon as IconName}
         iconBg="#F7EDCE"
         iconColor={C.gold}
         title="Studio mood"
         subtitle={`${currentMood.name} · ${currentMood.description}`}
         onPress={() => setSection('mood')}
        />
        <View style={s.divider} />
        <MenuRow
         icon={(save.soundEnabled ?? true) ? 'volumeOn' : 'volumeOff'}
         iconBg="#E6EEDC"
         title="Sound & haptics"
         subtitle={`${(save.soundEnabled ?? true) ? 'Soundscapes on' : 'Sound muted'} · ${(save.hapticsEnabled ?? true) ? 'Haptics on' : 'Haptics off'}`}
         onPress={() => setSection('sound')}
        />
        <View style={s.divider} />
        <MenuRow
         icon="code"
         iconBg="#F3ECF9"
         iconColor="#7A62AD"
         title="Coding difficulty"
         subtitle={
          save.difficulty
           ? `${DIFFICULTIES.find(d => d.id === save.difficulty)?.name ?? 'Standard'} · Changes available coding tasks`
           : 'Not chosen yet · Tap to pick Chill, Standard or Pro'
         }
         badgeDot={!save.difficulty}
         onPress={() => setSection('difficulty')}
        />
        <View style={s.divider} />
        <MenuRow
         icon="trophy"
         iconBg="#EAF0DE"
         title="Studio summary"
         subtitle={`${save.completed} shipped · ${save.streak?.count ?? 0}d streak · ${multiplier(save).toFixed(2)}×`}
         onPress={() => setSection('stats')}
        />
       </View>
      </View>

      {/* Group 2: App & Data */}
      <View style={s.groupWrap}>
       <Label style={s.groupLabel}>APP & DATA</Label>
       <View style={s.groupCard}>
        <MenuRow
         icon={updates.kind !== 'none' ? 'download' : 'refresh'}
         iconBg={updates.kind !== 'none' ? '#F7EDCE' : '#E6EEDC'}
         iconColor={updates.kind !== 'none' ? C.gold : C.green}
         title="App updates"
         subtitle={updates.statusText}
         badgeDot={updates.kind !== 'none'}
         onPress={() => setSection('updates')}
        />
        <View style={s.divider} />
        <MenuRow
         icon="shield"
         iconBg="#EAF0DE"
         title="Help & privacy"
         subtitle="Welcome guide, Privacy Policy & offline info"
         onPress={() => setSection('help')}
        />
        <View style={s.divider} />
        <MenuRow
         icon="alert"
         iconBg="#F7E7E5"
         iconColor="#B65147"
         title="Studio data"
         subtitle="Clear saved progress & start fresh"
         danger
         onPress={() => setSection('data')}
        />
       </View>
      </View>

      <Label style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 2 }}>
       {APP_NAME} v{APP_VERSION} · Saved locally on this device
      </Label>
     </>
    )}

    {section === 'profile' && (
     <>
      <SectionHeader
       title="Nickname & mascot"
       subtitle="Customize your studio terminal name and pick your developer."
       onBack={() => setSection('menu')}
      />
      <View style={s.card}>
       <View style={{ gap: 2 }}>
        <Label style={s.cardTitle}>Terminal nickname</Label>
        <Label style={{ fontSize: 12, color: C.muted }}>
         Optional — appears on your studio terminal. A nickname works great, or leave blank.
        </Label>
       </View>
       <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <TextInput
         value={draftName}
         onChangeText={t => setDraftName(t.slice(0, 24))}
         placeholder="e.g. cozydev"
         placeholderTextColor="#9AA99E"
         autoCapitalize="none"
         autoCorrect={false}
         maxLength={24}
         onSubmitEditing={() => {
          if (nameChanged && !busy) onPlayerName(draftName);
         }}
         style={s.nameInput}
        />
        <Pressable
         accessibilityRole="button"
         accessibilityLabel="Save nickname"
         disabled={busy || !nameChanged}
         onPress={() => onPlayerName(draftName)}
         style={({ pressed }) => [
          s.saveNameBtn,
          (busy || !nameChanged) && { opacity: 0.45 },
          pressed && { opacity: 0.75 },
         ]}
        >
         <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: '#FFFDF4' }}>Save</Label>
        </Pressable>
       </View>
      </View>

      <View style={s.card}>
       <View style={{ gap: 2 }}>
        <Label style={s.cardTitle}>Developer mascot</Label>
        <Label style={{ fontSize: 12, color: C.muted }}>Pick who codes at your desk — free to switch anytime.</Label>
       </View>
       <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {DEVELOPER_STYLES.map(dev => {
         const selected = (save.developerStyle ?? 'curly') === dev.id;
         return (
          <Pressable
           key={dev.id}
           accessibilityRole="radio"
           accessibilityLabel={`${dev.name}, ${dev.subtitle}, ${dev.tag}`}
           accessibilityState={{ checked: selected, disabled: busy }}
           disabled={busy}
           onPress={() => onDeveloperStyle(dev.id)}
           style={({ pressed }) => ({
            width: '48%',
            flexGrow: 1,
            borderRadius: 19,
            padding: 12,
            gap: 7,
            alignItems: 'center',
            borderWidth: 1.5,
            borderColor: selected ? '#6E9078' : '#E1E7DA',
            backgroundColor: selected ? '#E5EEDC' : '#F8FAF2',
            opacity: pressed ? 0.7 : 1,
           })}
          >
           <MascotPreview style={dev.id} size={58} />
           <View style={{ alignItems: 'center', gap: 1 }}>
            <Label style={{ fontSize: 14, textAlign: 'center', fontFamily: 'Fredoka_600SemiBold' }}>
             {dev.name}
            </Label>
            <Label style={{ fontSize: 11, color: C.muted }}>
             {dev.subtitle} · {dev.tag}
            </Label>
           </View>
          </Pressable>
         );
        })}
       </View>
      </View>
     </>
    )}

    {section === 'mood' && (
     <>
      <SectionHeader
       title="Studio mood"
       subtitle="Switch the window weather & ambient light anytime for free."
       onBack={() => setSection('menu')}
      />
      <View style={{ gap: 10 }}>
       {ATMOSPHERES.map(a => {
        const selected = (save.atmosphere ?? 'sunny') === a.id;
        return (
         <Pressable
          key={a.id}
          accessibilityRole="radio"
          accessibilityLabel={a.name}
          accessibilityState={{ checked: selected, disabled: busy }}
          disabled={busy}
          onPress={() => onAtmosphere(a.id)}
          style={({ pressed }) => [
           s.card,
           {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            borderColor: selected ? '#6E9078' : '#E6EBDD',
            backgroundColor: selected ? '#EEF5E8' : '#FFFFFF',
            opacity: pressed ? 0.75 : 1,
           },
          ]}
         >
          <View style={[s.iconBox, { backgroundColor: selected ? '#DCEAD0' : '#F3F6EE' }]}>
           <Icon name={a.icon as IconName} size={23} color={selected ? C.green : C.muted} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
           <Label style={s.cardTitle}>{a.name}</Label>
           <Label style={{ fontSize: 12, color: C.muted }}>{a.description}</Label>
          </View>
          {selected && <Icon name="check" size={20} color={C.green} />}
         </Pressable>
        );
       })}
      </View>
     </>
    )}

    {section === 'difficulty' && (
     <>
      <SectionHeader
       title="Coding difficulty"
       subtitle="Choose which coding tasks appear on your Projects tab."
       onBack={() => setSection('menu')}
      />
      <View style={{ gap: 10 }}>
       {DIFFICULTIES.map(d => {
        const selected = save.difficulty === d.id;
        return (
         <Pressable
          key={d.id}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected }}
          disabled={busy}
          onPress={() => onDifficulty?.(d.id)}
          style={[
           s.card,
           selected && { borderColor: C.green, backgroundColor: '#F3FAF0' },
          ]}
         >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
           <Label style={s.cardTitle}>{d.name}</Label>
           {selected && <Icon name="check" size={18} color={C.green} />}
          </View>
          <Label style={{ fontSize: 12.5, color: C.muted, lineHeight: 19 }}>{d.description}</Label>
         </Pressable>
        );
       })}
      </View>
     </>
    )}

    {section === 'sound' && (
     <>
      <SectionHeader
       title="Sound & haptics"
       subtitle="Cozy offline sound effects, rainy ambiance, and tactile feedback."
       onBack={() => setSection('menu')}
      />
      <View style={s.card}>
       <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: save.soundEnabled ?? true }}
        disabled={busy}
        onPress={() => onSoundToggle?.(!(save.soundEnabled ?? true))}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
       >
        <View style={[s.iconBox, { backgroundColor: '#E6EEDC' }]}>
         <Icon name={(save.soundEnabled ?? true) ? 'volumeOn' : 'volumeOff'} size={20} color={C.green} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
         <Label style={s.cardTitle}>Soundscapes & SFX</Label>
         <Label style={{ fontSize: 12, color: C.muted }}>
          Rain patter in Rainy mood, key clicks, coin chimes & cat purrs.
         </Label>
        </View>
        <View
         style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: (save.soundEnabled ?? true) ? C.green : '#D6DFCE',
          padding: 3,
          justifyContent: 'center',
          alignItems: (save.soundEnabled ?? true) ? 'flex-end' : 'flex-start',
         }}
        >
         <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFDF7' }} />
        </View>
       </Pressable>

       <View style={s.divider} />

       <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: save.hapticsEnabled ?? true }}
        disabled={busy}
        onPress={() => onHapticsToggle?.(!(save.hapticsEnabled ?? true))}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
       >
        <View style={[s.iconBox, { backgroundColor: '#F7EDCE' }]}>
         <Icon name="vibrate" size={20} color={C.gold} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
         <Label style={s.cardTitle}>Tactile haptics</Label>
         <Label style={{ fontSize: 12, color: C.muted }}>
          Gentle vibrations on typing, shipping projects & petting your cat.
         </Label>
        </View>
        <View
         style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          backgroundColor: (save.hapticsEnabled ?? true) ? C.green : '#D6DFCE',
          padding: 3,
          justifyContent: 'center',
          alignItems: (save.hapticsEnabled ?? true) ? 'flex-end' : 'flex-start',
         }}
        >
         <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFFDF7' }} />
        </View>
       </Pressable>
      </View>
     </>
    )}

    {section === 'stats' && (
     <>
      <SectionHeader
       title="Studio summary"
       subtitle="Your offline coding milestones and progress so far."
       onBack={() => setSection('menu')}
      />
      <View style={s.card}>
       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Label style={s.cardTitle}>Developer rank</Label>
        <View style={s.rankBadge}>
         <Label style={s.rankBadgeText}>{developerRank(save.completed)}</Label>
        </View>
       </View>
       <View style={s.statsGrid}>
        <View style={s.statItem}>
         <Label style={s.statValue}>{save.completed}</Label>
         <Label style={s.statLabel}>Projects shipped</Label>
        </View>
        <View style={s.statItem}>
         <Label style={s.statValue}>{save.streak?.count ?? 0}d</Label>
         <Label style={s.statLabel}>Daily streak</Label>
        </View>
        <View style={s.statItem}>
         <Label style={s.statValue}>{multiplier(save).toFixed(2)}×</Label>
         <Label style={s.statLabel}>Earnings rate</Label>
        </View>
        <View style={s.statItem}>
         <Label style={s.statValue}>
          {save.owned.length}/{ITEMS.length}
         </Label>
         <Label style={s.statLabel}>Upgrades & decor</Label>
        </View>
        <View style={s.statItem}>
         <Label style={s.statValue}>
          {claimedCount}/{MILESTONES.length}
         </Label>
         <Label style={s.statLabel}>Milestones</Label>
        </View>
        <View style={s.statItem}>
         <Label style={s.statValue}>{netWorth(save).toLocaleString()}</Label>
         <Label style={s.statLabel}>Net worth</Label>
        </View>
       </View>
      </View>

      {/* Offline GitHub-Style Green Contribution Heatmap (Last 28 Days) */}
      <View style={s.card}>
       <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 2 }}>
         <Label style={s.cardTitle}>Coding contributions</Label>
         <Label style={{ fontSize: 12, color: C.muted }}>Last 28 days of offline projects shipped</Label>
        </View>
        <Icon name="code" size={18} color={C.green} />
       </View>
       {(() => {
        const grid = recentActivityGrid(save, Date.now(), 28);
        const rows = [0, 1, 2, 3].map(r => grid.slice(r * 7, r * 7 + 7));
        return (
         <View style={{ gap: 6 }}>
          {rows.map((row, rIdx) => (
           <View key={rIdx} style={{ flexDirection: 'row', gap: 6 }}>
            {row.map(cell => {
             const bg =
              cell.count >= 4
               ? '#35634F'
               : cell.count === 3
               ? '#52876E'
               : cell.count === 2
               ? '#80B197'
               : cell.count === 1
               ? '#BBD8C2'
               : '#E9EFE3';
             return (
              <View
               key={cell.day}
               accessibilityLabel={`${cell.day}: ${cell.count} shipped`}
               style={{
                flex: 1,
                height: 28,
                borderRadius: 7,
                backgroundColor: bg,
                borderWidth: 1,
                borderColor: cell.count > 0 ? '#0000000A' : '#DDE6D6',
               }}
              />
             );
            })}
           </View>
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 4 }}>
           <Label style={{ fontSize: 10, color: C.muted }}>Less</Label>
           {['#E9EFE3', '#BBD8C2', '#80B197', '#52876E', '#35634F'].map(c => (
            <View key={c} style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c }} />
           ))}
           <Label style={{ fontSize: 10, color: C.muted }}>More</Label>
          </View>
         </View>
        );
       })()}
      </View>

      <Button icon="send" onPress={() => setShowCard(true)}>
       View & share Studio Card
      </Button>
      <StudioCardModal visible={showCard} save={save} onClose={() => setShowCard(false)} />
     </>
    )}

    {section === 'updates' && (
     <>
      <SectionHeader
       title="App updates"
       subtitle="Check for quick over-the-air updates or new Google Play releases."
       onBack={() => setSection('menu')}
      />
      <View style={s.card}>
       <View style={s.cardHeader}>
        <View style={[s.iconBox, { backgroundColor: updates.kind !== 'none' ? '#F7EDCE' : '#E6EEDC' }]}>
         <Icon
          name={updates.kind !== 'none' ? 'download' : 'refresh'}
          size={22}
          color={updates.kind !== 'none' ? C.gold : C.green}
         />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
         <Label style={s.cardTitle}>
          {updates.kind === 'ota-ready'
           ? 'Studio update ready'
           : updates.kind === 'store-available'
           ? `Version ${updates.latestVersion} available`
           : `Version ${APP_VERSION}`}
         </Label>
         <Label style={{ fontSize: 12, color: C.muted }}>{updates.statusText}</Label>
        </View>
       </View>
       {updates.releaseNotes && updates.kind !== 'none' && (
        <Label style={{ fontSize: 13, color: C.muted, lineHeight: 20 }}>{updates.releaseNotes}</Label>
       )}
       {updates.kind !== 'none' ? (
        <Button icon="download" onPress={updates.applyUpdate}>
         {updates.kind === 'ota-ready' ? 'Reload to apply update' : `Update to v${updates.latestVersion}`}
        </Button>
       ) : (
        <Button
         secondary
         icon="refresh"
         disabled={updates.checking}
         onPress={() => updates.checkNow(true)}
        >
         {updates.checking ? 'Checking for updates…' : 'Check for updates'}
        </Button>
       )}
       <Button secondary icon="award" onPress={onOpenWhatsNew}>
        What’s new in this version
       </Button>
      </View>
     </>
    )}

    {section === 'help' && (
     <>
      <SectionHeader
       title="Help & privacy"
       subtitle="Replay the studio tour or review how your local data is kept private."
       onBack={() => setSection('menu')}
      />
      <View style={s.card}>
       <Button secondary icon="book" onPress={onReplayOnboarding}>
        Replay welcome guide
       </Button>
       <Button secondary icon="shield" onPress={onOpenPrivacy}>
        Privacy Policy
       </Button>
       <Label style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 4, lineHeight: 18 }}>
        {APP_NAME} v{APP_VERSION} runs 100% offline. No accounts, no tracking, and your room stays safely stored on your device.
       </Label>
      </View>
     </>
    )}

    {section === 'data' && (
     <>
      <SectionHeader
       title="Studio data"
       subtitle="Manage your locally saved studio progress."
       onBack={() => setSection('menu')}
      />
      <View style={[s.card, { borderColor: '#EBD8D5' }]}>
       <View style={{ gap: 4 }}>
        <Label style={[s.cardTitle, { color: '#B65147' }]}>Start fresh</Label>
        <Label style={{ fontSize: 13, color: C.muted, lineHeight: 20 }}>
         Clearing your studio data will permanently remove your coins, furniture, adopted cat, milestones, and streak on this device so you can begin from scratch.
        </Label>
       </View>
       <Button danger disabled={busy} onPress={onResetData}>
        Clear all data & restart
       </Button>
      </View>
     </>
    )}
   </View>
  </ScrollView>
 );
}

export function SettingsModal({
 open,
 onClose,
 save,
 busy,
 onAtmosphere,
 onDeveloperStyle,
 onReplayOnboarding,
 onOpenPrivacy,
 onResetData,
 updates,
}: {
 open: boolean;
 onClose: () => void;
 save: Save;
 busy: boolean;
 onAtmosphere: (id: Atmosphere) => void;
 onDeveloperStyle?: (style: DeveloperStyle) => void;
 onReplayOnboarding: () => void;
 onOpenPrivacy: () => void;
 onResetData: () => void;
 updates: UpdateState;
}) {
 const insets = useSafeAreaInsets();
 const { height } = useWindowDimensions();
 const reduced = useReducedMotion();
 const [present, setPresent] = useState(open);
 const y = useSharedValue(1);

 useEffect(() => {
  if (open) {
   setPresent(true);
   y.set(reduced ? withTiming(0, { duration: 160 }) : withSpring(0, { duration: 300, dampingRatio: 1 }));
  } else {
   y.set(
    withTiming(1, { duration: reduced ? 140 : 220, easing: Easing.bezier(0.32, 0.72, 0, 1) }, finished => {
     if (finished) scheduleOnRN(setPresent, false);
    })
   );
  }
 }, [open, reduced, y]);

 const sheetStyle = useAnimatedStyle(() => ({
  opacity: reduced ? 1 - y.get() : 1,
  transform: [{ translateY: reduced ? 0 : y.get() * height }],
 }));
 const backdropStyle = useAnimatedStyle(() => ({ opacity: 1 - y.get() }));

 return (
  <Modal visible={present} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
   <View style={{ flex: 1, justifyContent: 'flex-end' }}>
    <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: '#223F3850' }, backdropStyle]}>
     <Pressable accessibilityRole="button" accessibilityLabel="Close settings" onPress={onClose} style={{ flex: 1 }} />
    </Animated.View>
    <Animated.View
     accessibilityViewIsModal
     style={[
      {
       width: '100%',
       maxWidth: 560,
       alignSelf: 'center',
       maxHeight: height - insets.top - 36,
       backgroundColor: C.bg,
       borderTopLeftRadius: 34,
       borderTopRightRadius: 34,
       overflow: 'hidden',
       paddingBottom: insets.bottom,
      },
      sheetStyle,
     ]}
    >
     <View style={s.header}>
      <View style={{ gap: 2, flex: 1 }}>
       <Label accessibilityRole="header" style={{ fontFamily: 'Fredoka_600SemiBold', fontSize: 28 }}>
        Studio settings
       </Label>
       <Label style={{ fontSize: 13, color: C.muted }}>
        Updates, room mood, guide, and local save info.
       </Label>
      </View>
      <Pressable
       accessibilityRole="button"
       accessibilityLabel="Close settings"
       onPress={onClose}
       style={s.closeBtn}
      >
       <Icon name="close" size={20} />
      </Pressable>
     </View>

     <SettingsContent
      save={save}
      busy={busy}
      onAtmosphere={onAtmosphere}
      onDeveloperStyle={onDeveloperStyle ?? (() => {})}
      onPlayerName={() => {}}
      onOpenWhatsNew={() => {}}
      onReplayOnboarding={() => {
       onClose();
       onReplayOnboarding();
      }}
      onOpenPrivacy={() => {
       onClose();
       onOpenPrivacy();
      }}
      onResetData={() => {
       onClose();
       onResetData();
      }}
      updates={updates}
     />
    </Animated.View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 header: {
  paddingHorizontal: 24,
  paddingTop: 18,
  paddingBottom: 18,
  borderBottomWidth: 1,
  borderBottomColor: '#E4EADB',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
 },
 closeBtn: {
  width: 44,
  height: 44,
  borderRadius: 16,
  backgroundColor: '#E9EFDF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 profileBanner: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14,
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  padding: 15,
  borderWidth: 1,
  borderColor: '#E6EBDD',
 },
 rankBadge: {
  backgroundColor: '#E6EEDC',
  paddingHorizontal: 9,
  paddingVertical: 3,
  borderRadius: 10,
 },
 rankBadgeText: {
  fontSize: 10.5,
  fontFamily: 'Nunito_800ExtraBold',
  color: C.green,
 },
 groupWrap: {
  gap: 7,
 },
 groupLabel: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  letterSpacing: 1.4,
  color: C.muted,
  paddingHorizontal: 6,
 },
 groupCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  borderWidth: 1,
  borderColor: '#E6EBDD',
  overflow: 'hidden',
 },
 menuRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 13,
  paddingHorizontal: 16,
  paddingVertical: 14,
 },
 menuIconBox: {
  width: 40,
  height: 40,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
 },
 rowBadgeDot: {
  position: 'absolute',
  top: -2,
  right: -2,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: C.gold,
  borderWidth: 1.5,
  borderColor: '#FFFFFF',
 },
 menuRowTitle: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 15,
  color: C.ink,
 },
 menuRowSub: {
  fontSize: 12,
  color: C.muted,
 },
 divider: {
  height: 1,
  backgroundColor: '#EDF2E7',
  marginLeft: 69,
 },
 subHeader: {
  gap: 10,
  marginBottom: 2,
 },
 backBtn: {
  alignSelf: 'flex-start',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: '#E9EFDF',
  paddingHorizontal: 13,
  paddingVertical: 8,
  borderRadius: 14,
 },
 backText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 13,
  color: C.ink,
 },
 subTitle: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 26,
  color: C.ink,
 },
 card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 23,
  padding: 18,
  gap: 13,
  borderWidth: 1,
  borderColor: '#E6EBDD',
 },
 cardHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
 },
 iconBox: {
  width: 44,
  height: 44,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
 },
 cardTitle: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 16,
  color: C.ink,
 },
 statsGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
 },
 statItem: {
  flex: 1,
  minWidth: 110,
  backgroundColor: '#F3F6EE',
  borderRadius: 16,
  padding: 12,
  gap: 2,
 },
 statValue: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 20,
  color: C.green,
 },
 statLabel: {
  fontSize: 11,
  color: C.muted,
 },
 nameInput: {
  flex: 1,
  backgroundColor: '#F8FAF2',
  borderWidth: 1.5,
  borderColor: '#DCE5D3',
  borderRadius: 15,
  paddingHorizontal: 14,
  paddingVertical: 11,
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 14,
  color: C.ink,
 },
 saveNameBtn: {
  backgroundColor: C.green,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 15,
  alignItems: 'center',
  justifyContent: 'center',
 },
});
