import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, Icon, Label } from './ui';
import { APP_NAME } from '../config';

const SECTIONS = [
 {
  title: '1. 100% Offline & Local-Only Storage',
  body: `${APP_NAME} is an offline-first mobile and web game. All game progress—including your coins, completed coding projects, room decorations, studio mood, energy charges, and adopted desk cat—is stored exclusively on your own device using local device storage (AsyncStorage / browser localStorage). We do not operate game servers, user accounts, or cloud databases.`,
 },
 {
  title: '2. Zero Personal Data Collection',
  body: `We do not collect, transmit, store, or share any personal information, device identifiers, location data, usage analytics, or crash telemetry. Because ${APP_NAME} requires no registration or sign-in, we never ask for your name, email address, phone number, or payment details.`,
 },
 {
  title: '3. No Ads, No Tracking, No In-App Purchases',
  body: `${APP_NAME} contains zero third-party advertising SDKs, zero tracking pixels, and zero in-app purchases or real-money transactions. Every upgrade, decoration, and companion in the studio is earned purely through in-game coding projects.`,
 },
 {
  title: '4. Device Permissions',
  body: `${APP_NAME} does not request or access sensitive device permissions such as your camera, microphone, contacts, photos, or location. Our Android build explicitly blocks camera and audio-recording permissions.`,
 },
 {
  title: '5. Data Retention & Deletion',
  body: `Because all save data lives locally on your device, you have complete control over it at all times. Clearing the app’s storage in your Android device settings or uninstalling ${APP_NAME} permanently deletes your local save data.`,
 },
 {
  title: '6. Children’s Privacy',
  body: `${APP_NAME} is a wholesome, family-friendly simulation game that does not collect personal information from anyone, including children under the age of 13, in full compliance with COPPA and global privacy regulations.`,
 },
 {
  title: '7. Contact Us',
  body: `If you have any questions about this Privacy Policy or ${APP_NAME}, please reach out at princeelorm17@gmail.com or visit github.com/Akarikev/nib.`,
 },
];

export function PrivacyPolicy({ onBack }: { onBack?: () => void }) {
 const insets = useSafeAreaInsets();
 return (
  <View style={{ flex: 1, backgroundColor: C.bg }}>
   <ScrollView
    contentInsetAdjustmentBehavior="never"
    contentContainerStyle={{
     paddingTop: insets.top + 16,
     paddingBottom: insets.bottom + 36,
     paddingHorizontal: 22,
     alignItems: 'center',
    }}
   >
    <View style={{ width: '100%', maxWidth: 640, gap: 18 }}>
     <View style={s.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
       <Label style={s.title}>
        {APP_NAME}
        <Label style={{ color: '#D69F6A', fontSize: 34 }}>.</Label>
       </Label>
       <View style={s.badge}>
        <Label style={s.badgeText}>PRIVACY POLICY</Label>
       </View>
      </View>
      {onBack && (
       <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to studio"
        onPress={onBack}
        style={({ pressed }) => [s.backBtn, { opacity: pressed ? 0.75 : 1 }]}
       >
        <Label style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: 13, color: C.green }}>
         Open Studio
        </Label>
        <Icon name="arrow" size={16} color={C.green} />
       </Pressable>
      )}
     </View>

     <View style={s.heroCard}>
      <Label style={s.eyebrow}>EFFECTIVE DATE: NOVEMBER 21, 2026</Label>
      <Label style={s.heroTitle}>Your cozy studio stays on your device.</Label>
      <Label style={s.heroBody}>
       {APP_NAME} (`com.nib.game`) is built for slow days and small wins—with zero data collection,
       zero ads, zero accounts, and 100% local device saves.
      </Label>
      <View style={s.pillRow}>
       <View style={s.pill}>
        <Icon name="check" size={14} color={C.green} />
        <Label style={s.pillText}>No Data Collected</Label>
       </View>
       <View style={s.pill}>
        <Icon name="check" size={14} color={C.green} />
        <Label style={s.pillText}>No Ads or Trackers</Label>
       </View>
       <View style={s.pill}>
        <Icon name="check" size={14} color={C.green} />
        <Label style={s.pillText}>100% Offline Saves</Label>
       </View>
      </View>
     </View>

     {SECTIONS.map(sec => (
      <View key={sec.title} style={s.card}>
       <Label style={s.cardTitle}>{sec.title}</Label>
       <Label style={s.cardBody}>{sec.body}</Label>
      </View>
     ))}

     <View style={{ alignItems: 'center', gap: 6, marginTop: 6 }}>
      <Icon name="heart" size={15} color={C.muted} />
      <Label style={{ textAlign: 'center', fontSize: 12, color: C.muted }}>
       {APP_NAME} · Package ID: com.nib.game · Built by Elorm (princeelorm17@gmail.com)
      </Label>
     </View>
    </View>
   </ScrollView>
  </View>
 );
}

const s = StyleSheet.create({
 header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 12,
 },
 title: { fontFamily: 'Fredoka_600SemiBold', fontSize: 34, letterSpacing: -0.7 },
 badge: {
  backgroundColor: '#E5EEDC',
  paddingHorizontal: 11,
  paddingVertical: 5,
  borderRadius: 12,
 },
 badgeText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  letterSpacing: 1.2,
  color: C.green,
 },
 backBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#E4EADB',
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderRadius: 16,
 },
 heroCard: {
  backgroundColor: '#EEF3E7',
  borderRadius: 24,
  padding: 22,
  gap: 10,
 },
 eyebrow: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 10,
  letterSpacing: 1.4,
  color: C.muted,
 },
 heroTitle: {
  fontFamily: 'Fredoka_500Medium',
  fontSize: 24,
  color: C.ink,
 },
 heroBody: {
  fontSize: 14,
  lineHeight: 22,
  color: C.muted,
 },
 pillRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 4,
 },
 pill: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 14,
 },
 pillText: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 12,
  color: C.green,
 },
 card: {
  backgroundColor: '#FFFFFF',
  borderRadius: 22,
  borderWidth: 1,
  borderColor: '#E9EEE2',
  padding: 18,
  gap: 8,
 },
 cardTitle: {
  fontFamily: 'Nunito_800ExtraBold',
  fontSize: 16,
  color: C.ink,
 },
 cardBody: {
  fontSize: 14,
  lineHeight: 22,
  color: C.muted,
 },
});
