import React from 'react';
import { Modal, Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
 DEVELOPER_STYLES,
 HOMES,
 RIDES,
 Save,
 developerRank,
 netWorth,
 passiveRatePerHour,
 recentActivityGrid,
} from '../game/game';
import { MascotPreview } from './developer';
import { Button, C, Icon, Label } from './ui';

export function StudioCardModal({
 visible,
 save,
 onClose,
}: {
 visible: boolean;
 save: Save;
 onClose: () => void;
}) {
 const insets = useSafeAreaInsets();
 const styleId = save.developerStyle ?? 'curly';
 const mascot = DEVELOPER_STYLES.find(d => d.id === styleId) ?? DEVELOPER_STYLES[0];
 const home = HOMES.find(h => h.id === (save.activeHome ?? 'bedroom')) ?? HOMES[0];
 const ride = RIDES.find(r => r.id === save.activeRide);
 const rank = developerRank(save.completed);
 const worth = netWorth(save);
 const passive = passiveRatePerHour(save);
 const grid = recentActivityGrid(save, Date.now(), 28);
 const rows = [0, 1, 2, 3].map(r => grid.slice(r * 7, r * 7 + 7));
 const displayName = save.playerName ? `@${save.playerName}` : mascot.name;

 async function onShare() {
  const lines = [
   `Nib Developer Card — ${displayName}`,
   `Rank: ${rank}`,
   `Home: ${home.name} (${home.city})`,
   ride ? `Ride: ${ride.name}` : null,
   `Shipped: ${save.completed} projects · Streak: ${save.streak?.count ?? 0}d`,
   `Net worth: ${worth.toLocaleString()} coins${passive > 0 ? ` · +${passive}/hr passive` : ''}`,
   `Built offline by hand in Nib.`,
  ].filter(Boolean);
  try {
   await Share.share({ message: lines.join('\n') });
  } catch {
   // User dismissed share sheet
  }
 }

 return (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
   <View style={s.backdrop}>
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
    <View style={[s.wrap, { paddingBottom: Math.max(16, insets.bottom) }]}>
     {/* Screenshot-ready framed Developer Card */}
     <View style={s.card}>
      <View style={s.topRow}>
       <View style={s.brandRow}>
        <Label style={s.brand}>
         Nib<Label style={{ color: C.gold }}>.</Label>
        </Label>
        <View style={s.rankPill}>
         <Label style={s.rankText}>{rank}</Label>
        </View>
       </View>
       <Pressable onPress={onClose} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Close studio card">
        <Icon name="close" size={16} color={C.ink} />
       </Pressable>
      </View>

      <View style={s.profileRow}>
       <View style={s.avatarBox}>
        <MascotPreview style={styleId} size={68} />
       </View>
       <View style={{ flex: 1, gap: 4 }}>
        <Label style={s.name} numberOfLines={1}>
         {displayName}
        </Label>
        <View style={s.metaRow}>
         <Icon name="pin" size={12} color={C.green} />
         <Label style={s.metaText} numberOfLines={1}>
          {home.city} · {home.name}
         </Label>
        </View>
        {ride && (
         <View style={s.metaRow}>
          <Icon name="car" size={12} color={C.gold} />
          <Label style={s.metaText} numberOfLines={1}>
           {ride.name}
          </Label>
         </View>
        )}
       </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
       <View style={s.statBox}>
        <Label style={s.statVal}>{save.completed}</Label>
        <Label style={s.statLbl}>Shipped</Label>
       </View>
       <View style={s.statBox}>
        <Label style={s.statVal}>{save.streak?.count ?? 0}d</Label>
        <Label style={s.statLbl}>Streak</Label>
       </View>
       <View style={s.statBox}>
        <Label style={s.statVal}>{worth.toLocaleString()}</Label>
        <Label style={s.statLbl}>Net worth</Label>
       </View>
      </View>

      {/* Mini 28-day green contribution strip */}
      <View style={s.gridBox}>
       <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label style={{ fontSize: 11, fontWeight: '700', color: C.muted }}>28-DAY CODING ACTIVITY</Label>
        {passive > 0 && <Label style={{ fontSize: 11, fontWeight: '700', color: C.green }}>+{passive}/hr passive</Label>}
       </View>
       <View style={{ gap: 5 }}>
        {rows.map((row, rIdx) => (
         <View key={rIdx} style={{ flexDirection: 'row', gap: 5 }}>
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
             : '#E8EFE2';
           return <View key={cell.day} style={[s.cell, { backgroundColor: bg }]} />;
          })}
         </View>
        ))}
       </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
       <View style={{ flex: 1 }}>
        <Button icon="send" onPress={onShare}>
         Share stats
        </Button>
       </View>
      </View>
     </View>
    </View>
   </View>
  </Modal>
 );
}

const s = StyleSheet.create({
 backdrop: {
  flex: 1,
  backgroundColor: '#1E342D88',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
 },
 wrap: {
  width: '100%',
  maxWidth: 380,
 },
 card: {
  backgroundColor: '#FFFDF7',
  borderRadius: 28,
  padding: 20,
  gap: 16,
  borderWidth: 2,
  borderColor: '#DCE6D4',
  shadowColor: '#1D342C',
  shadowOffset: { width: 0, height: 14 },
  shadowOpacity: 0.2,
  shadowRadius: 28,
  elevation: 12,
 },
 topRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
 },
 brandRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
 },
 brand: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 22,
  color: C.ink,
 },
 rankPill: {
  backgroundColor: '#E5EFE0',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 99,
 },
 rankText: {
  fontSize: 11,
  fontWeight: '700',
  color: C.green,
 },
 closeBtn: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#EFF4E9',
  alignItems: 'center',
  justifyContent: 'center',
 },
 profileRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 14,
 },
 avatarBox: {
  width: 74,
  height: 74,
  borderRadius: 22,
  backgroundColor: '#EEF4E6',
  borderWidth: 1.5,
  borderColor: '#D9E4CE',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
 },
 name: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 21,
  color: C.ink,
 },
 metaRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
 },
 metaText: {
  fontSize: 12,
  color: C.muted,
  fontWeight: '600',
  flex: 1,
 },
 statsRow: {
  flexDirection: 'row',
  gap: 8,
 },
 statBox: {
  flex: 1,
  backgroundColor: '#F4F7EE',
  borderRadius: 14,
  paddingVertical: 10,
  paddingHorizontal: 8,
  alignItems: 'center',
  gap: 2,
 },
 statVal: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 17,
  color: C.ink,
 },
 statLbl: {
  fontSize: 11,
  color: C.muted,
  fontWeight: '600',
 },
 gridBox: {
  backgroundColor: '#F7FAF2',
  borderRadius: 16,
  padding: 12,
  gap: 8,
  borderWidth: 1,
  borderColor: '#E6EFE0',
 },
 cell: {
  flex: 1,
  height: 18,
  borderRadius: 5,
 },
});
