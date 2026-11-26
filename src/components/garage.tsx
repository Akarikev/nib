import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, G, Line, Path, Rect } from 'react-native-svg';
import { HOMES, RIDES, ResolvedAtmosphere, RideId, Save } from '../game/game';
import { Button, C, Icon, Label } from './ui';

export function GarageModal({
 visible,
 save,
 resolvedAtmosphere,
 onClose,
 onSelectRide,
 onOpenShop,
 onHonk,
 onCruiseReward,
}: {
 visible: boolean;
 save: Save;
 resolvedAtmosphere: ResolvedAtmosphere;
 onClose: () => void;
 onSelectRide: (id: RideId) => void;
 onOpenShop: () => void;
 onHonk: () => void;
 onCruiseReward: (coins: number, message: string) => void;
}) {
 const insets = useSafeAreaInsets();
 const [lightsOn, setLightsOn] = useState(false);
 const [lastCruiseAt, setLastCruiseAt] = useState(0);
 const [banner, setBanner] = useState<string | null>(null);

 const home = HOMES.find(h => h.id === (save.activeHome ?? 'bedroom')) ?? HOMES[0];
 const ownedRides = RIDES.filter(r => (save.rides ?? []).includes(r.id));
 const activeRide = RIDES.find(r => r.id === save.activeRide) ?? ownedRides[0];
 const night = resolvedAtmosphere === 'moonlit';
 const rain = resolvedAtmosphere === 'rainy';
 const stroke = '#3E5049';

 function handleHonk() {
  onHonk();
  setLightsOn(true);
  setBanner(
   activeRide?.id === 'bike'
    ? 'Ring-ring! Bell sounds crisp and ready.'
    : activeRide
    ? `Beep beep! ${activeRide.name} headlights flashed.`
    : 'Echo… echo… your garage is waiting for its first set of keys!'
  );
  setTimeout(() => setLightsOn(false), 900);
 }

 function handleCruise() {
  if (!activeRide) {
   onClose();
   onOpenShop();
   return;
  }
  const now = Date.now();
  const waitSec = Math.ceil((lastCruiseAt + 30_000 - now) / 1000);
  if (waitSec > 0) {
   setBanner(`Just got back! Next cozy cruise ready in ${waitSec}s.`);
   return;
  }
  setLastCruiseAt(now);
  onHonk();
  const lines = [
   `Cruised around ${home.city} in your ${activeRide.name}! Found +15 lucky coins.`,
   `Sunset loop through ${home.city} — barista waved and tossed +15 tip coins!`,
   `Windows down in ${home.city}, lo-fi playing. +15 cozy cruise coins!`,
  ];
  const msg = lines[Math.floor(Math.random() * lines.length)]!;
  setBanner(msg);
  onCruiseReward(15, msg);
 }

 return (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
   <View style={s.backdrop}>
    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
    <View style={[s.sheet, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
     {/* Header */}
     <View style={s.header}>
      <View style={{ flex: 1 }}>
       <Label style={s.title}>{home.city} Garage</Label>
       <Label style={{ fontSize: 12.5, color: C.muted }}>
        {activeRide ? `${activeRide.name} · Tap your ride to honk!` : 'Empty driveway — pick up your first ride in Shop'}
       </Label>
      </View>
      <Pressable onPress={onClose} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="Close garage">
       <Icon name="close" size={18} color={C.ink} />
      </Pressable>
     </View>

     {/* Illustrated Interactive Garage Scene */}
     <Pressable onPress={handleHonk} style={s.sceneWrap} accessibilityRole="button" accessibilityLabel="Tap vehicle to honk horn">
      <Svg viewBox="0 0 360 210" width="100%" height={205}>
       {/* Sky & garage wall */}
       <Rect width="360" height="210" fill={night ? '#263445' : rain ? '#7E98A3' : '#B9DCE3'} />
       {night ? (
        <Circle cx="305" cy="36" r="14" fill="#FAF0CA" />
       ) : (
        <Circle cx="305" cy="36" r="16" fill={rain ? '#D8E3E6' : '#FFF1B5'} />
       )}
       {/* Garage structure */}
       <Rect x="16" y="34" width="248" height="122" rx="10" fill={night ? '#4C5857' : '#E7DEC8'} stroke={stroke} strokeWidth="3" />
       {/* Open garage door bay */}
       <Rect x="32" y="54" width="216" height="102" rx="6" fill={night ? '#2C3735' : '#C9C0AD'} stroke={stroke} strokeWidth="2.8" />
       {[66, 78].map(y => (
        <Line key={y} x1="34" y1={y} x2="246" y2={y} stroke={stroke} strokeWidth="2" opacity="0.35" />
       ))}
       {/* Warm overhead garage bulb */}
       <Circle cx="140" cy="64" r="18" fill="#FFEAA7" opacity={night ? 0.35 : 0.18} />
       <Circle cx="140" cy="62" r="4" fill="#FFFDF0" stroke={stroke} strokeWidth="1.5" />
       {/* Driveway & road */}
       <Rect y="154" width="360" height="56" fill={night ? '#3C4648' : '#8A938E'} />
       <Line x1="0" y1="154" x2="360" y2="154" stroke={stroke} strokeWidth="3" />
       <Line x1="20" y1="184" x2="340" y2="184" stroke="#E8E4D3" strokeWidth="2.5" strokeDasharray="16 14" opacity="0.55" />

       {/* Headlight beam when honking or at night */}
       {activeRide && (lightsOn || night) && (
        <Path
         d="M238 134 L348 118 V162 L238 144 Z"
         fill="#FFF3B0"
         opacity={lightsOn ? 0.62 : 0.25}
        />
       )}

       {/* Parked Vehicle Silhouette */}
       {!activeRide ? (
        <G>
         <Rect x="94" y="102" width="92" height="36" rx="8" fill="#FAF6EA" stroke={stroke} strokeWidth="2.5" />
         <Line x1="112" y1="116" x2="168" y2="116" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
         <Line x1="122" y1="126" x2="158" y2="126" stroke="#8FA197" strokeWidth="2.2" strokeLinecap="round" />
        </G>
       ) : activeRide.id === 'bike' ? (
        /* Vintage Mint Fixie */
        <G>
         <Circle cx="110" cy="144" r="20" fill="none" stroke={stroke} strokeWidth="4" />
         <Circle cx="182" cy="144" r="20" fill="none" stroke={stroke} strokeWidth="4" />
         <Path d="M110 144 L138 114 H170 L144 144 Z M170 114 L182 144 M165 104 H178 M130 114 H144" fill="none" stroke="#6FA88B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
         <Circle cx="110" cy="144" r="4" fill={stroke} />
         <Circle cx="182" cy="144" r="4" fill={stroke} />
        </G>
       ) : activeRide.id === 'vespa' ? (
        /* Cream City Scooter */
        <G>
         <Circle cx="112" cy="150" r="14" fill="#3B4944" stroke={stroke} strokeWidth="3" />
         <Circle cx="182" cy="150" r="14" fill="#3B4944" stroke={stroke} strokeWidth="3" />
         <Path d="M98 144 Q102 122 130 124 L144 142 H164 L168 108 H180 L192 146 H98 Z" fill="#F6E8CC" stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
         <Rect x="108" y="118" width="28" height="8" rx="4" fill="#9E6A4E" stroke={stroke} strokeWidth="2.2" />
         <Circle cx="182" cy="112" r="5" fill={lightsOn ? '#FFF4B2' : '#DDE8E4'} stroke={stroke} strokeWidth="2" />
        </G>
       ) : (
        /* Cars: Classic Roadster (coral), Electric Coupe (sage-silver), Vintage 911 (cream-gold) */
        <G>
         <Path
          d={
           activeRide.id === 'porsche'
            ? 'M78 148 Q82 124 114 118 Q138 98 176 102 Q204 106 218 122 Q242 126 244 148 Z'
            : activeRide.id === 'ev'
            ? 'M74 148 L86 122 Q118 100 174 100 L214 120 Q242 124 246 148 Z'
            : 'M80 148 Q84 126 116 124 L132 108 H178 L198 124 Q238 126 242 148 Z'
          }
          fill={
           activeRide.id === 'porsche'
            ? '#E7C477'
            : activeRide.id === 'ev'
            ? '#A9C4BD'
            : '#DF7D67'
          }
          stroke={stroke}
          strokeWidth="3.2"
          strokeLinejoin="round"
         />
         {/* Cabin windshield */}
         <Path d="M126 122 L140 107 H178 L198 122 Z" fill={night ? '#3C5161' : '#D4EBF0'} stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" />
         {/* Headlight */}
         <Circle cx="237" cy="134" r="5" fill={lightsOn ? '#FFF4B2' : '#FFFDF5'} stroke={stroke} strokeWidth="2" />
         {/* Wheels */}
         <Circle cx="114" cy="150" r="15" fill="#2E3A36" stroke={stroke} strokeWidth="3" />
         <Circle cx="114" cy="150" r="7" fill="#DCE4DE" />
         <Circle cx="206" cy="150" r="15" fill="#2E3A36" stroke={stroke} strokeWidth="3" />
         <Circle cx="206" cy="150" r="7" fill="#DCE4DE" />
        </G>
       )}
      </Svg>
     </Pressable>

     {banner && (
      <View style={s.bannerPill}>
       <Label style={s.bannerText}>{banner}</Label>
      </View>
     )}

     {/* Switch between owned rides if > 1 */}
     {ownedRides.length > 1 && (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
       {ownedRides.map(r => {
        const selected = activeRide?.id === r.id;
        return (
         <Pressable
          key={r.id}
          onPress={() => onSelectRide(r.id)}
          style={[s.rideChip, selected && { backgroundColor: C.green, borderColor: C.green }]}
         >
          <Label style={[s.rideChipText, selected && { color: '#FFFDF7' }]}>{r.name}</Label>
         </Pressable>
        );
       })}
      </View>
     )}

     <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ flex: 1 }}>
       <Button secondary icon="volumeOn" onPress={handleHonk}>
        {activeRide?.id === 'bike' ? 'Ring bell' : 'Honk horn'}
       </Button>
      </View>
      <View style={{ flex: 1 }}>
       <Button icon={activeRide ? 'car' : 'shop'} onPress={handleCruise}>
        {activeRide ? 'Coffee cruise' : 'Browse rides'}
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
  backgroundColor: '#14221EA8',
  justifyContent: 'flex-end',
 },
 sheet: {
  backgroundColor: C.bg,
  borderTopLeftRadius: 30,
  borderTopRightRadius: 30,
  paddingHorizontal: 20,
  paddingTop: 18,
  gap: 14,
 },
 header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
 },
 title: {
  fontFamily: 'Fredoka_600SemiBold',
  fontSize: 24,
  color: C.ink,
 },
 closeBtn: {
  width: 36,
  height: 36,
  borderRadius: 14,
  backgroundColor: '#E9EFDF',
  alignItems: 'center',
  justifyContent: 'center',
 },
 sceneWrap: {
  borderRadius: 22,
  overflow: 'hidden',
  borderWidth: 2,
  borderColor: '#DCE5D3',
 },
 bannerPill: {
  backgroundColor: '#EDF5E7',
  borderRadius: 14,
  paddingHorizontal: 14,
  paddingVertical: 9,
  borderWidth: 1,
  borderColor: '#D4E4CA',
 },
 bannerText: {
  fontSize: 12.5,
  color: C.green,
  fontWeight: '700',
  textAlign: 'center',
 },
 rideChip: {
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  borderWidth: 1,
  borderColor: '#DCE5D3',
 },
 rideChipText: {
  fontSize: 12,
  fontWeight: '800',
  color: C.ink,
 },
});
