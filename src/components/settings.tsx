import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ATMOSPHERES, Atmosphere, ITEMS, MILESTONES, multiplier, Save } from '../game/game';
import { Button, C, Icon, IconName, Label } from './ui';
import { APP_NAME, APP_VERSION } from '../config';
import { UpdateState } from '../utils/updates';

export function SettingsContent({
 save,
 busy,
 onAtmosphere,
 onReplayOnboarding,
 onOpenPrivacy,
 updates,
}: {
 save: Save;
 busy: boolean;
 onAtmosphere: (id: Atmosphere) => void;
 onReplayOnboarding: () => void;
 onOpenPrivacy: () => void;
 updates: UpdateState;
}) {
 const claimedCount = (save.milestones ?? []).length;

 return (
  <ScrollView
   contentInsetAdjustmentBehavior="never"
   contentContainerStyle={{
    paddingTop: 14,
    paddingBottom: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
   }}
  >
   <View style={{ width: '100%', maxWidth: 520, gap: 16 }}>
    {/* App Updates Section (OTA + Store) */}
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
       <Label style={s.cardTitle}>App updates</Label>
       <Label style={{ fontSize: 12, color: C.muted }}>{updates.statusText}</Label>
      </View>
     </View>
     {updates.releaseNotes && updates.kind !== 'none' && (
      <Label style={{ fontSize: 12, color: C.muted }}>{updates.releaseNotes}</Label>
     )}
     <View style={{ flexDirection: 'row', gap: 10 }}>
      {updates.kind !== 'none' ? (
       <View style={{ flex: 1 }}>
        <Button icon="download" onPress={updates.applyUpdate}>
         {updates.kind === 'ota-ready' ? 'Reload to apply update' : `Update to v${updates.latestVersion}`}
        </Button>
       </View>
      ) : (
       <View style={{ flex: 1 }}>
        <Button
         secondary
         icon="refresh"
         disabled={updates.checking}
         onPress={() => updates.checkNow(true)}
        >
         {updates.checking ? 'Checking for updates…' : 'Check for updates'}
        </Button>
       </View>
      )}
     </View>
    </View>

    {/* Quick Studio Mood Selector */}
    <View style={s.card}>
     <View style={{ gap: 2 }}>
      <Label style={s.cardTitle}>Studio mood</Label>
      <Label style={{ fontSize: 12, color: C.muted }}>Switch the window weather anytime for free.</Label>
     </View>
     <View style={{ flexDirection: 'row', gap: 8 }}>
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
         style={({ pressed }) => ({
          flex: 1,
          borderRadius: 17,
          padding: 11,
          gap: 7,
          alignItems: 'center',
          borderWidth: 1.5,
          borderColor: selected ? '#6E9078' : '#E1E7DA',
          backgroundColor: selected ? '#E5EEDC' : '#F8FAF2',
          opacity: pressed ? 0.7 : 1,
         })}
        >
         <Icon name={a.icon as IconName} size={21} color={selected ? C.green : C.muted} />
         <Label style={{ fontSize: 11, textAlign: 'center', fontFamily: 'Nunito_800ExtraBold' }}>
          {a.name}
         </Label>
        </Pressable>
       );
      })}
     </View>
    </View>

    {/* Studio Stats Summary */}
    <View style={s.card}>
     <Label style={s.cardTitle}>Your studio summary</Label>
     <View style={s.statsGrid}>
      <View style={s.statItem}>
       <Label style={s.statValue}>{save.completed}</Label>
       <Label style={s.statLabel}>Projects shipped</Label>
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
     </View>
    </View>

    {/* Guide & Privacy Links */}
    <View style={s.card}>
     <Label style={s.cardTitle}>Help & privacy</Label>
     <Button secondary icon="book" onPress={onReplayOnboarding}>
      Replay welcome guide
     </Button>
     <Button secondary icon="shield" onPress={onOpenPrivacy}>
      Privacy Policy
     </Button>
     <Label style={{ fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 4 }}>
      {APP_NAME} v{APP_VERSION} · Saved locally on this device · No internet needed
     </Label>
    </View>
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
 onReplayOnboarding,
 onOpenPrivacy,
 updates,
}: {
 open: boolean;
 onClose: () => void;
 save: Save;
 busy: boolean;
 onAtmosphere: (id: Atmosphere) => void;
 onReplayOnboarding: () => void;
 onOpenPrivacy: () => void;
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
      onReplayOnboarding={() => {
       onClose();
       onReplayOnboarding();
      }}
      onOpenPrivacy={() => {
       onClose();
       onOpenPrivacy();
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
});
