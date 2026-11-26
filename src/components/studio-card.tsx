import React, { useRef, useState } from 'react';
import { Modal, Platform, Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
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
 onSaved,
}: {
 visible: boolean;
 save: Save;
 onClose: () => void;
 onSaved?: (message: string) => void;
}) {
 const insets = useSafeAreaInsets();
 const cardRef = useRef<React.ComponentRef<typeof ViewShot>>(null);
 const [busyAction, setBusyAction] = useState<'share' | 'save' | null>(null);
 const [statusMsg, setStatusMsg] = useState<string | null>(null);

 const styleId = save.developerStyle ?? 'curly';
 const mascot = DEVELOPER_STYLES.find(d => d.id === styleId) ?? DEVELOPER_STYLES[0];
 const home = HOMES.find(h => h.id === (save.activeHome ?? 'bedroom')) ?? HOMES[0];
 const ride = RIDES.find(r => r.id === save.activeRide);
 const mood = save.atmosphere ?? 'sunny';
 const rank = developerRank(save.completed);
 const worth = netWorth(save);
 const passive = passiveRatePerHour(save);
 const grid = recentActivityGrid(save, Date.now(), 28);
 const rows = [0, 1, 2, 3].map(r => grid.slice(r * 7, r * 7 + 7));
 const displayName = save.playerName ? `@${save.playerName}` : mascot.name;

 const headerTint =
  mood === 'moonlit' ? '#253538' : mood === 'rainy' ? '#DCE8E6' : '#F3F6E9';
 const headerInk = mood === 'moonlit' ? '#F5F6EC' : C.ink;
 const headerMuted = mood === 'moonlit' ? '#B8CAC3' : C.muted;

 async function captureCardUri(): Promise<string | null> {
  if (!cardRef.current?.capture) return null;
  try {
   return await cardRef.current.capture();
  } catch {
   return null;
  }
 }

 async function fallbackTextShare() {
  const lines = [
   `Nib Developer Card — ${displayName}`,
   `Rank: ${rank}`,
   `Home: ${home.name} (${home.city})`,
   ride ? `Ride: ${ride.name}` : null,
   `Shipped: ${save.completed} projects · Streak: ${save.streak?.count ?? 0}d`,
   `Net worth: ${worth.toLocaleString()} coins${passive > 0 ? ` · +${passive}/hr passive` : ''}`,
   `Built offline by hand in Nib · nib.elorm.xyz`,
  ].filter(Boolean);
  try {
   await Share.share({ message: lines.join('\n') });
  } catch {
   // User dismissed share sheet
  }
 }

 async function onShareImage() {
  if (busyAction) return;
  setBusyAction('share');
  setStatusMsg(null);
  try {
   if (Platform.OS === 'web') {
    await fallbackTextShare();
    return;
   }
   const uri = await captureCardUri();
   const Sharing = await import('expo-sharing');
   if (uri && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri, {
     mimeType: 'image/png',
     dialogTitle: 'Share your Nib Studio Card',
     UTI: 'public.png',
    });
   } else {
    await fallbackTextShare();
   }
  } catch {
   setStatusMsg('Could not open share sheet. Try again.');
  } finally {
   setBusyAction(null);
  }
 }

 async function onSaveImage() {
  if (busyAction) return;
  setBusyAction('save');
  setStatusMsg(null);
  try {
   if (Platform.OS === 'web') {
    const uri = await captureCardUri();
    if (uri && typeof document !== 'undefined') {
     const a = document.createElement('a');
     a.href = uri;
     a.download = `nib-studio-${save.playerName || mascot.name.toLowerCase()}.png`;
     a.click();
     setStatusMsg('Studio Card downloaded!');
     onSaved?.('Studio Card image downloaded!');
    } else {
     setStatusMsg('Take a screenshot to save on this browser.');
    }
    return;
   }
   const MediaLibrary = await import('expo-media-library');
   const perm = await MediaLibrary.requestPermissionsAsync(true);
   if (!perm.granted) {
    setStatusMsg('Photo permission needed to save directly. Use Share image instead!');
    return;
   }
   const uri = await captureCardUri();
   if (!uri) {
    setStatusMsg('Could not render card image.');
    return;
   }
   await MediaLibrary.Asset.create(uri);
   setStatusMsg('Saved to your photo gallery!');
   onSaved?.('Studio Card saved to your photo gallery!');
  } catch {
   setStatusMsg('Could not save image. Try Share image instead.');
  } finally {
   setBusyAction(null);
  }
 }

 return (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
   <View style={s.backdrop}>
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
    <View style={[s.wrap, { paddingBottom: Math.max(16, insets.bottom) }]}>
     {/* Top floating close row outside the exported PNG */}
     <View style={s.modalBar}>
      <Label style={s.modalBarTitle}>Studio Card</Label>
      <Pressable onPress={onClose} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Close studio card">
       <Icon name="close" size={16} color={C.ink} />
      </Pressable>
     </View>

     {/* Clean, screenshot- & export-ready framed Developer Card */}
     <ViewShot
      ref={cardRef}
      options={{ format: 'png', quality: 1, result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile' }}
      style={s.shotWrap}
     >
      <View style={s.card}>
       {/* Mood-tinted studio banner */}
       <View style={[s.banner, { backgroundColor: headerTint }]}>
        <View style={s.brandRow}>
         <Label style={[s.brand, { color: headerInk }]}>
          Nib<Label style={{ color: C.gold }}>.</Label>
         </Label>
         <View style={[s.rankPill, mood === 'moonlit' && { backgroundColor: '#354C4E' }]}>
          <Label style={[s.rankText, mood === 'moonlit' && { color: '#BCE0C6' }]}>{rank}</Label>
         </View>
        </View>
        <View style={s.moodBadge}>
         <Icon
          name={mood === 'rainy' ? 'rain' : mood === 'moonlit' ? 'poster' : 'sun'}
          size={13}
          color={headerMuted}
         />
         <Label style={[s.moodText, { color: headerMuted }]}>
          {mood === 'rainy' ? 'Rainy' : mood === 'moonlit' ? 'Moonlit' : 'Sunny'}
         </Label>
        </View>
       </View>

       <View style={s.cardBody}>
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
          <Label style={{ fontSize: 10.5, fontWeight: '800', color: C.muted, letterSpacing: 0.4 }}>
           28-DAY CODING ACTIVITY
          </Label>
          {passive > 0 && (
           <Label style={{ fontSize: 11, fontWeight: '800', color: C.green }}>+{passive}/hr passive</Label>
          )}
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

        <View style={s.footerStamp}>
         <Label style={s.footerStampText}>Coded offline by hand</Label>
         <Label style={s.footerStampUrl}>nib.elorm.xyz</Label>
        </View>
       </View>
      </View>
     </ViewShot>

     {statusMsg && (
      <View style={s.statusPill}>
       <Icon name="check" size={14} color={C.green} />
       <Label style={s.statusPillText}>{statusMsg}</Label>
      </View>
     )}

     {/* Action buttons outside the captured PNG */}
     <View style={s.actionsRow}>
      <View style={{ flex: 1 }}>
       <Button secondary icon="download" disabled={!!busyAction} onPress={onSaveImage}>
        {busyAction === 'save' ? 'Saving...' : 'Save PNG'}
       </Button>
      </View>
      <View style={{ flex: 1 }}>
       <Button icon="share" disabled={!!busyAction} onPress={onShareImage}>
        {busyAction === 'share' ? 'Sharing...' : 'Share PNG'}
       </Button>
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
  backgroundColor: '#192D27AA',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 18,
 },
 wrap: {
  width: '100%',
  maxWidth: 386,
  gap: 12,
 },
 modalBar: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 4,
 },
 modalBarTitle: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 18,
  color: '#FFFDF7',
 },
 closeBtn: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: '#FFFDF7',
  alignItems: 'center',
  justifyContent: 'center',
 },
 shotWrap: {
  borderRadius: 28,
  overflow: 'hidden',
  shadowColor: '#13241E',
  shadowOffset: { width: 0, height: 16 },
  shadowOpacity: 0.28,
  shadowRadius: 30,
  elevation: 14,
 },
 card: {
  backgroundColor: '#FFFDF7',
  borderRadius: 28,
  overflow: 'hidden',
  borderWidth: 2,
  borderColor: '#DCE6D4',
 },
 banner: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 18,
  paddingVertical: 13,
  borderBottomWidth: 1,
  borderBottomColor: '#E5EDE0',
 },
 brandRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 9,
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
  fontWeight: '800',
  color: C.green,
 },
 moodBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
 },
 moodText: {
  fontSize: 11,
  fontWeight: '700',
 },
 cardBody: {
  padding: 18,
  gap: 14,
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
  borderRadius: 15,
  paddingVertical: 10,
  paddingHorizontal: 8,
  alignItems: 'center',
  gap: 2,
  borderWidth: 1,
  borderColor: '#E6EFE0',
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
  height: 17,
  borderRadius: 5,
 },
 footerStamp: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 2,
 },
 footerStampText: {
  fontSize: 11,
  color: C.muted,
  fontWeight: '600',
 },
 footerStampUrl: {
  fontSize: 11,
  color: C.green,
  fontWeight: '800',
 },
 statusPill: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  backgroundColor: '#EEF6E9',
  borderRadius: 99,
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderColor: '#D4E4CA',
 },
 statusPillText: {
  fontSize: 12,
  fontWeight: '700',
  color: C.green,
 },
 actionsRow: {
  flexDirection: 'row',
  gap: 10,
 },
});
