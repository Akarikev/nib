import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_NAME, APP_VERSION } from '../config';
import { UpdateState } from '../utils/updates';
import { Button, C, Icon, Label } from './ui';

/**
 * 1) OTA Update Bottom Sheet
 * Shown automatically in-app when an EAS over-the-air update has been downloaded and is ready to apply.
 */
export function OtaUpdateSheet({ updates }: { updates: UpdateState }) {
 const open = updates.kind === 'ota-ready' && updates.bannerVisible;
 const insets = useSafeAreaInsets();
 const { height } = useWindowDimensions();
 const reduced = useReducedMotion();
 const [present, setPresent] = useState(open);
 const y = useSharedValue(1);

 useEffect(() => {
  if (open) {
   setPresent(true);
   y.set(reduced ? withTiming(0, { duration: 160 }) : withSpring(0, { duration: 300, dampingRatio: 0.95 }));
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
  transform: [{ translateY: reduced ? 0 : y.get() * Math.min(height, 420) }],
 }));
 const backdropStyle = useAnimatedStyle(() => ({ opacity: 1 - y.get() }));

 if (!present) return null;

 return (
  <Modal visible={present} transparent animationType="none" statusBarTranslucent onRequestClose={updates.dismissBanner}>
   <View style={s.sheetOverlay}>
    <Animated.View style={[s.backdrop, backdropStyle]}>
     <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dismiss update sheet"
      onPress={updates.dismissBanner}
      style={{ flex: 1 }}
     />
    </Animated.View>

    <Animated.View
     accessibilityViewIsModal
     style={[s.sheet, { paddingBottom: Math.max(insets.bottom, 18) + 8 }, sheetStyle]}
    >
     <View style={s.handle} />
     <View style={s.sheetIconWrap}>
      <Icon name="download" size={28} color={C.gold} />
     </View>

     <View style={{ alignItems: 'center', gap: 6 }}>
      <Label style={s.eyebrow}>NEW STUDIO UPDATE</Label>
      <Label style={s.sheetTitle}>A fresh update is ready!</Label>
      <Label style={s.sheetBody}>
       {updates.releaseNotes ||
        'We’ve downloaded the latest improvements for your studio. Reload now to apply them — your saved progress stays completely safe.'}
      </Label>
     </View>

     <View style={{ width: '100%', gap: 10, marginTop: 4 }}>
      <Button icon="refresh" onPress={updates.applyUpdate}>
       Reload & update now
      </Button>
      <Button secondary onPress={updates.dismissBanner}>
       Maybe later
      </Button>
     </View>
    </Animated.View>
   </View>
  </Modal>
 );
}

/**
 * 2) Full-Screen Store Update Prompt
 * Shown when a newer binary version is published on Google Play Store (via version.json).
 */
export function StoreUpdateScreen({ updates }: { updates: UpdateState }) {
 const open = updates.kind === 'store-available' && updates.bannerVisible;
 const insets = useSafeAreaInsets();

 if (!open) return null;

 const isWeb = Platform.OS === 'web';

 return (
  <Modal visible={open} animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
   <View style={[s.fullScreen, { paddingTop: insets.top + 28, paddingBottom: Math.max(insets.bottom, 24) + 12 }]}>
    <View style={s.fullInner}>
     <Label style={s.brand}>
      {APP_NAME}
      <Label style={{ color: '#D69F6A', fontSize: 34 }}>.</Label>
     </Label>

     <View style={s.heroCard}>
      <View style={s.heroIconCircle}>
       <Icon name="download" size={40} color={C.green} />
      </View>
      <View style={s.versionPill}>
       <Label style={s.versionText}>
        v{APP_VERSION} → v{updates.latestVersion}
       </Label>
      </View>
     </View>

     <View style={{ alignItems: 'center', gap: 10 }}>
      <Label style={s.eyebrow}>UPDATE REQUIRED</Label>
      <Label style={s.fullTitle}>Time to update {APP_NAME}!</Label>
      <Label style={s.fullBody}>
       {updates.releaseNotes ||
        `Version ${updates.latestVersion} is now available with new studio features and improvements. Tap below to get the latest version from ${
         isWeb ? 'the web' : 'Google Play'
        }.`}
      </Label>
     </View>

     <View style={{ width: '100%', gap: 12, marginTop: 8 }}>
      <Button icon="download" onPress={updates.applyUpdate}>
       {isWeb ? 'Reload to update' : 'Update on Google Play'}
      </Button>
      <Label style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
       Your coins, cat, and room decorations are safely kept on this device.
      </Label>
     </View>
    </View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 sheetOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
 },
 backdrop: {
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  backgroundColor: '#223F3858',
 },
 sheet: {
  width: '100%',
  maxWidth: 520,
  alignSelf: 'center',
  backgroundColor: C.bg,
  borderTopLeftRadius: 34,
  borderTopRightRadius: 34,
  paddingHorizontal: 24,
  paddingTop: 12,
  alignItems: 'center',
  gap: 14,
  borderTopWidth: 1,
  borderColor: '#E4EADB',
 },
 handle: {
  width: 42,
  height: 5,
  borderRadius: 3,
  backgroundColor: '#D6DFD0',
  marginBottom: 4,
 },
 sheetIconWrap: {
  width: 62,
  height: 62,
  borderRadius: 22,
  backgroundColor: '#F7EDCE',
  alignItems: 'center',
  justifyContent: 'center',
 },
 eyebrow: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  letterSpacing: 1.5,
  color: C.muted,
 },
 sheetTitle: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 24,
  color: C.ink,
  textAlign: 'center',
 },
 sheetBody: {
  fontSize: 14,
  color: C.muted,
  textAlign: 'center',
  lineHeight: 21,
 },
 fullScreen: {
  flex: 1,
  backgroundColor: C.bg,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 26,
 },
 fullInner: {
  width: '100%',
  maxWidth: 440,
  alignItems: 'center',
  gap: 22,
 },
 brand: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 34,
  letterSpacing: -0.7,
  color: C.ink,
 },
 heroCard: {
  width: '100%',
  backgroundColor: '#E8F0E1',
  borderRadius: 30,
  paddingVertical: 30,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 14,
  borderWidth: 1,
  borderColor: '#DCE6D4',
 },
 heroIconCircle: {
  width: 82,
  height: 82,
  borderRadius: 28,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 versionPill: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 14,
 },
 versionText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 13,
  color: C.green,
 },
 fullTitle: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 28,
  color: C.ink,
  textAlign: 'center',
 },
 fullBody: {
  fontSize: 14.5,
  color: C.muted,
  textAlign: 'center',
  lineHeight: 22,
 },
});
