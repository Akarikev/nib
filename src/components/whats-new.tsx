import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import changelog from '../changelog.json';
import { Button, C, Icon, IconName, Label } from './ui';

export type ChangelogRelease = {
 id: string;
 version: string;
 title: string;
 subtitle: string;
 highlights: { icon: IconName; title: string; detail: string }[];
};

export const LATEST_RELEASE: ChangelogRelease = changelog.releases[0] as ChangelogRelease;

export function WhatsNewModal({
 open,
 release = LATEST_RELEASE,
 primaryLabel = 'Awesome, let’s code!',
 secondaryLabel,
 onSecondary,
 onClose,
}: {
 open: boolean;
 release?: ChangelogRelease;
 primaryLabel?: string;
 secondaryLabel?: string;
 onSecondary?: () => void;
 onClose: () => void;
}) {
 const insets = useSafeAreaInsets();
 const reduced = useReducedMotion();
 const [visible, setVisible] = useState(open);
 const opacity = useSharedValue(0);
 const scale = useSharedValue(0.94);

 useEffect(() => {
  if (open) {
   setVisible(true);
   opacity.set(withTiming(1, { duration: 180 }));
   scale.set(reduced ? 1 : withSpring(1, { duration: 280, dampingRatio: 0.9 }));
  } else {
   opacity.set(withTiming(0, { duration: 140 }));
   setVisible(false);
  }
 }, [open, reduced, opacity, scale]);

 const cardStyle = useAnimatedStyle(() => ({
  opacity: opacity.get(),
  transform: [{ scale: scale.get() }],
 }));

 if (!visible) return null;

 return (
  <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
   <View
    style={[
     s.backdrop,
     {
      paddingTop: Math.max(insets.top, 20) + 12,
      paddingBottom: Math.max(insets.bottom, 24) + 12,
     },
    ]}
   >
    <Animated.View accessibilityViewIsModal style={[s.card, cardStyle]}>
     <View style={s.header}>
      <View style={{ flex: 1, gap: 4 }}>
       <View style={s.badgeRow}>
        <View style={s.versionPill}>
         <Label style={s.versionText}>WHAT’S NEW · v{release.version}</Label>
        </View>
       </View>
       <Label style={s.title}>{release.title}</Label>
       <Label style={s.subtitle}>{release.subtitle}</Label>
      </View>
      <Pressable
       accessibilityRole="button"
       accessibilityLabel="Close what's new"
       onPress={onClose}
       style={s.closeBtn}
      >
       <Icon name="close" size={18} color={C.ink} />
      </Pressable>
     </View>

     <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.list}
      style={{ maxHeight: 360 }}
     >
      {release.highlights.map((item, idx) => (
       <View key={idx} style={s.row}>
        <View style={s.iconWrap}>
         <Icon name={item.icon} size={20} color={C.green} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
         <Label style={s.rowTitle}>{item.title}</Label>
         <Label style={s.rowDetail}>{item.detail}</Label>
        </View>
       </View>
      ))}
     </ScrollView>

     <View style={s.footer}>
      <Button icon="check" onPress={onClose}>
       {primaryLabel}
      </Button>
      {secondaryLabel && onSecondary && (
       <Button secondary onPress={onSecondary}>
        {secondaryLabel}
       </Button>
      )}
     </View>
    </Animated.View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 backdrop: {
  flex: 1,
  backgroundColor: '#223F3866',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 20,
 },
 card: {
  width: '100%',
  maxWidth: 460,
  maxHeight: '88%',
  backgroundColor: C.bg,
  borderRadius: 30,
  padding: 22,
  gap: 16,
  borderWidth: 1,
  borderColor: '#E4EADB',
  shadowColor: '#1E3830',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.18,
  shadowRadius: 24,
  elevation: 10,
 },
 header: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
 },
 badgeRow: {
  flexDirection: 'row',
 },
 versionPill: {
  backgroundColor: '#F7EDCE',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 11,
 },
 versionText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  letterSpacing: 1.1,
  color: C.gold,
 },
 title: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 25,
  color: C.ink,
  lineHeight: 30,
 },
 subtitle: {
  fontSize: 13,
  color: C.muted,
  lineHeight: 19,
 },
 closeBtn: {
  width: 38,
  height: 38,
  borderRadius: 14,
  backgroundColor: '#E9EFDF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 list: {
  gap: 10,
  paddingVertical: 2,
 },
 row: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 12,
  backgroundColor: '#FFFFFF',
  borderRadius: 20,
  padding: 13,
  borderWidth: 1,
  borderColor: '#E6EBDD',
 },
 iconWrap: {
  width: 40,
  height: 40,
  borderRadius: 14,
  backgroundColor: '#EAF0DE',
  alignItems: 'center',
  justifyContent: 'center',
 },
 rowTitle: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 14,
  color: C.ink,
 },
 rowDetail: {
  fontSize: 12,
  color: C.muted,
  lineHeight: 18,
 },
 footer: {
  gap: 9,
  paddingTop: 2,
 },
});
