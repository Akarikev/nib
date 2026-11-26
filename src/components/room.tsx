import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, ScrollView, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { DeveloperStyle, HomeId, ResolvedAtmosphere } from '../game/game';
import { Developer, DeskCat } from './developer';
import Svg, { Circle, Ellipse, G, Path, Rect, Line } from 'react-native-svg';

export function Room({
 working,
 celebrating = false,
 napping = false,
 catOwned = false,
 owned,
 decorated,
 atmosphere = 'sunny',
 developerStyle = 'curly',
 activeHome = 'bedroom',
 fullScreen = false,
 onPetCat,
 onOpenPhone,
 onToggleNap,
 onOpenGarage,
}: {
 working: boolean;
 celebrating?: boolean;
 napping?: boolean;
 catOwned?: boolean;
 owned: string[];
 decorated: string[];
 atmosphere?: ResolvedAtmosphere;
 developerStyle?: DeveloperStyle;
 activeHome?: HomeId;
 fullScreen?: boolean;
 onPetCat?: () => void;
 onOpenPhone?: () => void;
 onToggleNap?: () => void;
 onOpenGarage?: () => void;
}) {
 const reduced = useReducedMotion();
 const ambient = useSharedValue(0);
 const life = useSharedValue(0);
 const panRef = useRef<ScrollView>(null);
 const centeredOnceRef = useRef(false);
 const [box, setBox] = useState({ width: 0, height: 0 });
 const [screenMode, setScreenMode] = useState<'editor' | 'terminal' | 'wallpaper' | 'studio'>('editor');
 const [tvChannel, setTvChannel] = useState<'lofi' | 'pong' | 'matrix'>('lofi');

 useEffect(() => {
  if (!working) {
   setScreenMode('wallpaper');
   return;
  }
  const modes: ('editor' | 'terminal' | 'wallpaper' | 'studio')[] = ['editor', 'terminal', 'studio', 'wallpaper'];
  setScreenMode('editor');
  const timer = setInterval(() => {
   setScreenMode(prev => {
    const idx = modes.indexOf(prev);
    return modes[(idx + 1) % modes.length]!;
   });
  }, 6500);
  return () => clearInterval(timer);
 }, [working]);

 function cycleScreen() {
  const modes: ('editor' | 'terminal' | 'wallpaper' | 'studio')[] = ['editor', 'terminal', 'studio', 'wallpaper'];
  setScreenMode(prev => modes[(modes.indexOf(prev) + 1) % modes.length]!);
 }
 useEffect(() => {
  if (reduced) { ambient.set(0); life.set(0); return; }
  ambient.set(withRepeat(withSequence(withTiming(1, { duration: atmosphere === 'rainy' ? 850 : 4000, easing: Easing.linear }), withTiming(0, { duration: atmosphere === 'rainy' ? 0 : 4000, easing: Easing.linear })), -1));
  life.set(withRepeat(withSequence(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.sin) }), withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })), -1));
  return () => { cancelAnimation(ambient); cancelAnimation(life); };
 }, [atmosphere, reduced, ambient, life]);
 const ambientStyle = useAnimatedStyle(() => ({ opacity: atmosphere === 'moonlit' ? .5 + ambient.get() * .5 : .85, transform: [{ translateY: atmosphere === 'rainy' ? ambient.get() * 9 : -ambient.get() * 4 }] }));
 const steamStyle = useAnimatedStyle(() => ({
  opacity: 0.35 + life.get() * 0.5,
  transform: [{ translateY: -life.get() * 5 }, { translateX: (life.get() - 0.5) * 2.5 }],
 }));
 const fishStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: (life.get() - 0.5) * 5 }, { translateY: Math.sin(life.get() * Math.PI) * -1.5 }],
 }));
 const glowPulseStyle = useAnimatedStyle(() => ({
  opacity: 0.55 + life.get() * 0.45,
 }));
 const night = atmosphere === 'moonlit'; const rain = atmosphere === 'rainy';
 const homePalette = {
  bedroom: { wall: night ? '#C8D1DB' : rain ? '#D7E4E2' : '#E2EDE2', floor: night ? '#B6A89F' : '#D5BC9E', trim: '#FDF6DE' },
  loft: { wall: night ? '#B9AEAC' : rain ? '#D9CFC9' : '#EADBD0', floor: night ? '#8F7B70' : '#B4937A', trim: '#535A5E' },
  sf: { wall: night ? '#C5CFDC' : rain ? '#DAE5E8' : '#EEF2EC', floor: night ? '#B7ACA0' : '#E2CCA9', trim: '#FDF9EE' },
  tokyo: { wall: night ? '#B5BCCB' : rain ? '#CDD6DC' : '#DFDFD6', floor: night ? '#9E9382' : '#CBB994', trim: '#5C5752' },
  cabin: { wall: night ? '#BBA99B' : rain ? '#D3C1B0' : '#E5D1BA', floor: night ? '#998374' : '#B89878', trim: '#7D6049' },
 }[activeHome];
 const wall = homePalette.wall;
 const floor = homePalette.floor;
 const stroke = '#4D5C55';

 function onLayout(e: LayoutChangeEvent) {
  const { width, height } = e.nativeEvent.layout;
  if (width !== box.width || height !== box.height) setBox({ width, height });
 }

 // Compute exact 400:354 stage size that fills the available space while keeping all layered SVGs 1:1 aligned
 const ratio = 400 / 354;
 let stageWidth: number | '100%' = '100%';
 let stageHeight: number | '100%' = '100%';
 if (fullScreen && box.width > 0 && box.height > 0) {
  // Fit the biggest 400x354 canvas inside the full screen area (with slight cover zoom on tall portrait screens so the desk & developer are large)
  const fitWidth = box.width;
  const fitHeight = fitWidth / ratio;
  if (fitHeight <= box.height) {
   // Portrait / tall screen: scale up moderately (up to 1.32x width) so the studio fills more vertical space without clipping the character or desk
   const maxSafeWidth = box.width * 1.32;
   const targetHeight = Math.min(box.height * 0.88, maxSafeWidth / ratio);
   stageHeight = Math.max(fitHeight, targetHeight);
   stageWidth = stageHeight * ratio;
  } else {
   // Wide / landscape screen: fit full height and expand width proportionally
   stageHeight = box.height;
   stageWidth = stageHeight * ratio;
  }
 }

 const canvas = (
  <View
   style={
    fullScreen
     ? { width: stageWidth, height: stageHeight, position: 'relative' }
     : { aspectRatio: 1.13, width: '100%', overflow: 'hidden', borderRadius: 32, backgroundColor: wall }
   }
  >
   <Svg viewBox="0 0 400 354" width="100%" height="100%">
   <Rect width="400" height="354" fill={wall} />
   {/* Subtle home wall textures (Brooklyn loft brick / Swiss cabin timber) */}
   {activeHome === 'loft' && (
    <G opacity="0.22">
     {[48, 84, 120, 156, 192, 228].map(y => <Line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#A87E6B" strokeWidth="1.5" />)}
     <Line x1="180" y1="48" x2="180" y2="84" stroke="#A87E6B" strokeWidth="1.5" />
     <Line x1="250" y1="84" x2="250" y2="120" stroke="#A87E6B" strokeWidth="1.5" />
     <Line x1="330" y1="120" x2="330" y2="156" stroke="#A87E6B" strokeWidth="1.5" />
    </G>
   )}
   {activeHome === 'cabin' && (
    <G opacity="0.2">
     {[42, 82, 122, 162, 202, 240].map(y => <Line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#8B684E" strokeWidth="2" />)}
    </G>
   )}
   <Path d="M0 259 Q200 242 400 259 V354 H0Z" fill={floor} />
   <Path d="M0 259 Q200 242 400 259" stroke="#B5997F" strokeWidth="3" fill="none" />
   {[288, 320, 350].map(y => <Line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#C8AB8D" strokeWidth="2" opacity="0.7" />)}
   <Rect x="37" y="35" width="119" height="133" rx={activeHome === 'loft' || activeHome === 'tokyo' ? '14' : '54'} fill={homePalette.trim} stroke={stroke} strokeWidth="4" />
   <Rect x="46" y="44" width="101" height="114" rx={activeHome === 'loft' || activeHome === 'tokyo' ? '8' : '46'} fill={night ? '#596987' : rain ? '#9EB7C3' : '#AFD7E0'} />
   {night ? <Path d="M121 59 A17 17 0 1 0 129 86 A18 18 0 0 1 121 59" fill="#FAEAC5" /> : rain ? <G><Ellipse cx="110" cy="74" rx="24" ry="11" fill="#DCE6E9" /><Circle cx="102" cy="68" r="11" fill="#DCE6E9" /><Circle cx="118" cy="68" r="13" fill="#DCE6E9" /></G> : <Circle cx="115" cy="76" r="17" fill="#FFF2B7" />}
   {/* Scenic City / Landscape View Outside Window Based on Active Home */}
   {activeHome === 'sf' ? (
    <G>
     {/* San Francisco Bay water & Golden Gate Bridge */}
     <Rect x="48" y="133" width="97" height="23" fill={night ? '#4D6885' : '#7DB3C4'} />
     <Path d="M48 133 Q76 118 106 130 Q128 122 145 133Z" fill={night ? '#5F777E' : '#89B09E'} />
     <Line x1="48" y1="128" x2="145" y2="128" stroke="#D16450" strokeWidth="3" />
     <Line x1="74" y1="95" x2="74" y2="136" stroke="#D16450" strokeWidth="4" strokeLinecap="round" />
     <Line x1="121" y1="95" x2="121" y2="136" stroke="#D16450" strokeWidth="4" strokeLinecap="round" />
     <Line x1="70" y1="106" x2="78" y2="106" stroke="#D16450" strokeWidth="2.5" />
     <Line x1="117" y1="106" x2="125" y2="106" stroke="#D16450" strokeWidth="2.5" />
     <Path d="M48 124 Q62 118 74 98 Q97 126 121 98 Q133 118 145 124" fill="none" stroke="#D16450" strokeWidth="2" />
    </G>
   ) : activeHome === 'loft' ? (
    <G>
     {/* Brooklyn Brick Loft skyline */}
     <Rect x="50" y="114" width="22" height="42" fill={night ? '#516075' : '#8FA0A8'} />
     <Rect x="75" y="100" width="25" height="56" fill={night ? '#445266' : '#7B8E99'} />
     <Rect x="103" y="110" width="20" height="46" fill={night ? '#58677C' : '#96A6AE'} />
     <Rect x="125" y="120" width="20" height="36" fill={night ? '#4A596E' : '#8495A0'} />
     {[108, 118, 128, 138].map(wy => (
      <G key={wy}>
       <Rect x="80" y={wy} width="4" height="5" fill={night ? '#FCE59B' : '#DCE9EE'} />
       <Rect x="90" y={wy} width="4" height="5" fill={night ? '#FCE59B' : '#DCE9EE'} />
      </G>
     ))}
    </G>
   ) : activeHome === 'tokyo' ? (
    <G>
     {/* Tokyo Skyline + Tokyo Tower + Mt. Fuji */}
     <Path d="M48 140 L74 114 L100 140Z" fill={night ? '#697B94' : '#8BA4B8'} />
     <Path d="M68 120 L74 114 L80 120 L77 122 L74 120 L71 122Z" fill="#FDF9EE" />
     <Rect x="52" y="126" width="16" height="30" fill={night ? '#495670' : '#7A8C9C'} />
     <Rect x="112" y="116" width="26" height="40" fill={night ? '#434F69' : '#728496'} />
     <Path d="M96 90 L88 156 M96 90 L104 156 M91 124 H101 M89 140 H103" stroke="#E06D58" strokeWidth="2.5" strokeLinecap="round" />
     <Circle cx="120" cy="126" r="2" fill="#F6A5B8" />
     <Circle cx="129" cy="134" r="2" fill="#7AC993" />
    </G>
   ) : activeHome === 'cabin' ? (
    <G>
     {/* Swiss Alps snow-capped peaks & evergreen pines */}
     <Path d="M48 144 L76 98 L104 144Z" fill={night ? '#637888' : '#86A3B0'} />
     <Path d="M84 146 L116 92 L145 146Z" fill={night ? '#566A7A' : '#7895A3'} />
     <Path d="M68 111 L76 98 L84 111 L79 113 L76 110 L73 113Z" fill="#FDFDF8" />
     <Path d="M107 107 L116 92 L125 107 L120 109 L116 106 L112 109Z" fill="#FDFDF8" />
     <Path d="M48 142 H145 V156 H48Z" fill={night ? '#507065' : '#6F9884'} />
    </G>
   ) : (
    <Path d="M48 129 Q72 100 97 128 Q121 111 145 137 V156 H48Z" fill={night ? '#6C8893' : rain ? '#7F9F9C' : '#8AB7A6'} />
   )}
   <Path d="M97 42 V160 M43 103 H151" stroke={homePalette.trim} strokeWidth="6" />
   <Rect x="28" y="160" width="138" height="12" rx="6" fill={homePalette.trim} stroke={stroke} strokeWidth="3" />
   <Path d="M270 52 H354 V64 H270Z" fill="#B8997B" stroke={stroke} strokeWidth="3" />
   <Rect x="282" y="22" width="13" height="30" rx="3" fill="#E69F82" stroke={stroke} strokeWidth="2" />
   <Rect x="297" y="17" width="13" height="35" rx="3" fill="#F8D37F" stroke={stroke} strokeWidth="2" />
   <Path d="M316 30 L325 26 L335 50 L326 54Z" fill="#91B8A6" stroke={stroke} strokeWidth="2" />
   {decorated.includes('lights') && <G>
    <Path d="M12 14 Q96 36 185 18 Q280 36 388 12" fill="none" stroke={stroke} strokeWidth="2.2" />
    {[[46, 22], [94, 27], [142, 24], [218, 23], [268, 27], [322, 23], [364, 16]].map(([lx, ly], i) => (
     <G key={i}>
      <Circle cx={lx} cy={ly + 4} r="15" fill="#FFD97D" opacity={night || napping ? 0.32 : 0.16} />
      <Circle cx={lx} cy={ly + 4} r="8.5" fill="#FFEFA8" opacity={night || napping ? 0.65 : 0.38} />
      <Circle cx={lx} cy={ly + 4} r="3.4" fill="#FFFDF0" stroke="#D6A954" strokeWidth="1" />
     </G>
    ))}
   </G>}
   {/* Baseboard molding & warm diagonal window light shaft */}
   <Rect x="0" y="244" width="400" height="8" fill={homePalette.trim} opacity="0.7" />
   <Line x1="0" y1="244" x2="400" y2="244" stroke={stroke} strokeWidth="1.5" opacity="0.22" />
   {!rain && (
    <Path
     d="M46 164 L148 164 L232 296 L78 296 Z"
     fill={night ? '#C9D8F5' : '#FFF7D4'}
     opacity={night ? 0.14 : 0.24}
    />
   )}
   {/* Cozy round studio wall clock */}
   <G>
    <Circle cx="174" cy="70" r="14" fill="#FFFDF6" stroke={stroke} strokeWidth="2.8" />
    <Circle cx="174" cy="70" r="1.8" fill={stroke} />
    <Line x1="174" y1="70" x2="174" y2="62" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
    <Line x1="174" y1="70" x2="180" y2="73" stroke="#C87E62" strokeWidth="2" strokeLinecap="round" />
   </G>
   {decorated.includes('poster') && <G><Rect x="198" y="33" width="53" height="70" rx="4" fill="#FDF6DE" stroke={stroke} strokeWidth="3" /><Rect x="204" y="39" width="41" height="58" fill="#777EA8" /><Path d="M229 49 A15 15 0 1 0 235 75 A17 17 0 0 1 229 49" fill="#F9DC9B" /><Circle cx="214" cy="49" r="2" fill="#FFF5D2" /></G>}
   {decorated.includes('tv') && <G>
    {/* Wall-mounted Smart TV with brilliant tappable channels */}
    <Rect x="282" y="72" width="88" height="50" rx="7" fill="#1F2B28" stroke={stroke} strokeWidth="3" />
    {tvChannel === 'lofi' ? (
     <G>
      {/* Brilliant Synthwave / Lo-Fi Sunset over Water */}
      <Rect x="287" y="77" width="78" height="40" rx="3" fill="#463E6B" />
      <Rect x="287" y="91" width="78" height="14" fill="#A65E7E" opacity="0.8" />
      <Circle cx="326" cy="98" r="10" fill="#FFD37A" />
      <Rect x="287" y="102" width="78" height="15" fill="#2A3954" />
      <Line x1="312" y1="106" x2="340" y2="106" stroke="#FFD37A" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <Line x1="317" y1="110" x2="335" y2="110" stroke="#F4A582" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <Path d="M287 103 L301 94 L315 103 Z M339 103 L353 91 L365 103 Z" fill="#1E273B" />
     </G>
    ) : tvChannel === 'pong' ? (
     <G>
      {/* Retro Neon Space Invaders Arcade */}
      <Rect x="287" y="77" width="78" height="40" rx="3" fill="#151D26" />
      {[300, 316, 332, 348].map((ax, i) => (
       <G key={ax}>
        <Rect x={ax} y={84 + (i % 2) * 3} width="8" height="5" rx="1" fill={i % 2 === 0 ? '#7EE8A6' : '#F6C768'} />
        <Circle cx={ax + 2.2} cy={86 + (i % 2) * 3} r="0.9" fill="#151D26" />
        <Circle cx={ax + 5.8} cy={86 + (i % 2) * 3} r="0.9" fill="#151D26" />
       </G>
      ))}
      <Line x1="326" y1="96" x2="326" y2="104" stroke="#FF7B89" strokeWidth="2" strokeLinecap="round" />
      <Path d="M320 112 H332 L326 106 Z" fill="#8CD8FF" />
     </G>
    ) : (
     <G>
      {/* Glowing Code Matrix + Audio Visualizer Bars */}
      <Rect x="287" y="77" width="78" height="40" rx="3" fill="#101F1B" />
      {[294, 304, 314, 324, 334, 344, 354].map((mx, idx) => (
       <Rect
        key={mx}
        x={mx}
        y={109 - ((idx * 7 + 9) % 18)}
        width="5"
        height={6 + ((idx * 7 + 9) % 18)}
        rx="1.5"
        fill={idx % 2 === 0 ? '#69D48F' : '#8AD4C2'}
       />
      ))}
      <Line x1="293" y1="84" x2="322" y2="84" stroke="#9EF0B8" strokeWidth="2" strokeLinecap="round" />
      <Line x1="330" y1="84" x2="356" y2="84" stroke="#F6D488" strokeWidth="2" strokeLinecap="round" />
     </G>
    )}
    <Circle cx="362" cy="119" r="1.4" fill="#7AC993" />
   </G>}
   {/* Cozy floor potted plant on the left side of the studio */}
   <G>
    <Path d="M18 268 H44 L40 296 H22 Z" fill="#D99473" stroke={stroke} strokeWidth="2.6" strokeLinejoin="round" />
    <Rect x="15" y="263" width="32" height="6" rx="3" fill="#E6A484" stroke={stroke} strokeWidth="2.4" />
    <Path d="M31 263 Q26 244 16 239 Q24 235 31 248 Q38 232 48 238 Q39 246 31 263 Z" fill="#6F9D75" stroke={stroke} strokeWidth="2.2" strokeLinejoin="round" />
    <Path d="M31 258 V232" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" />
   </G>
   {decorated.includes('rug') && <Ellipse cx="205" cy="312" rx="138" ry="30" fill="#E9A68E" stroke="#B87764" strokeWidth="3" />}
   <Ellipse cx="202" cy="306" rx="108" ry="18" fill="#9B806A" opacity=".2" />
   {/* Bigger, richer studio desk (width 284) with sturdy legs & right-side 2-drawer cabinet */}
   <Path d="M84 222 L76 305 M326 222 L334 305" stroke={stroke} strokeWidth="13" strokeLinecap="round" />
   <Path d="M84 222 L76 305 M326 222 L334 305" stroke="#BA9676" strokeWidth="7.5" strokeLinecap="round" />
   {/* Right-side desk drawer cabinet */}
   <Rect x="292" y="224" width="42" height="72" rx="5" fill="#C99C76" stroke={stroke} strokeWidth="3.2" />
   <Line x1="294" y1="260" x2="332" y2="260" stroke={stroke} strokeWidth="2.5" />
   <Rect x="307" y="239" width="12" height="4" rx="2" fill="#F5DFB5" stroke={stroke} strokeWidth="1.5" />
   <Rect x="307" y="275" width="12" height="4" rx="2" fill="#F5DFB5" stroke={stroke} strokeWidth="1.5" />
   {/* Wide solid wood desk top with warm wood-grain highlight */}
   <Rect x="58" y="206" width="284" height="20" rx="9" fill="#D9AD85" stroke={stroke} strokeWidth="4" />
   <Line x1="72" y1="213" x2="328" y2="213" stroke="#EBC6A0" strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
   {/* Cute tappable Smartphone resting on the desk */}
   <G>
    <Rect x="163" y="196" width="14" height="10" rx="3" fill="#2F3F3A" stroke={stroke} strokeWidth="2" />
    <Rect x="165.5" y="198" width="9" height="6" rx="1.5" fill="#92D6B0" />
   </G>
   {owned.includes('oled') && (
    <Rect x="216" y="118" width="114" height="74" rx="14" fill={night ? '#7C98E8' : '#8AD3C4'} opacity={night ? 0.34 : 0.22} />
   )}
   <Rect
    x={owned.includes('oled') ? 222 : 228}
    y={owned.includes('oled') ? 123 : 127}
    width={owned.includes('oled') ? 102 : owned.includes('monitor') ? 91 : 69}
    height={owned.includes('oled') ? 68 : 65}
    rx="8"
    fill={owned.includes('oled') ? '#263430' : owned.includes('monitor') ? '#B7A6D8' : '#667D75'}
    stroke={stroke}
    strokeWidth="4"
   />
   {/* Dynamic Monitor Display: Code Editor / Terminal / Split Studio / Cozy Wallpaper */}
   {(() => {
    const sw = owned.includes('oled') ? 90 : owned.includes('monitor') ? 77 : 55;
    const sx = owned.includes('oled') ? 228 : 235;
    const sy = owned.includes('oled') ? 129 : 134;
    const sh = owned.includes('oled') ? 54 : 48;
    if (screenMode === 'editor') {
     return (
      <G>
       <Rect x={sx} y={sy} width={sw} height={sh} rx="3" fill="#23322E" />
       {/* Mini sidebar */}
       <Rect x={sx} y={sy} width="11" height={sh} rx="2" fill="#1B2824" />
       <Line x1={sx + 3} y1={sy + 8} x2={sx + 8} y2={sy + 8} stroke="#6E8E81" strokeWidth="1.5" strokeLinecap="round" />
       <Line x1={sx + 3} y1={sy + 14} x2={sx + 8} y2={sy + 14} stroke="#88B59B" strokeWidth="1.5" strokeLinecap="round" />
       <Line x1={sx + 3} y1={sy + 20} x2={sx + 7} y2={sy + 20} stroke="#6E8E81" strokeWidth="1.5" strokeLinecap="round" />
       {/* Active line highlight */}
       <Rect x={sx + 13} y={sy + 19} width={sw - 15} height="6" rx="1.5" fill="#314640" />
       {/* Syntax-highlighted code lines */}
       <Line x1={sx + 15} y1={sy + 9} x2={sx + 27} y2={sy + 9} stroke="#E9A4AA" strokeWidth="2" strokeLinecap="round" />
       <Line x1={sx + 31} y1={sy + 9} x2={sx + Math.min(sw - 6, 46)} y2={sy + 9} stroke="#9AD1AE" strokeWidth="2" strokeLinecap="round" />
       <Line x1={sx + 18} y1={sy + 15} x2={sx + 35} y2={sy + 15} stroke="#F6D488" strokeWidth="2" strokeLinecap="round" />
       <Line x1={sx + 18} y1={sy + 22} x2={sx + 32} y2={sy + 22} stroke="#C7B6E8" strokeWidth="2" strokeLinecap="round" />
       <Line x1={sx + 36} y1={sy + 22} x2={sx + Math.min(sw - 5, 49)} y2={sy + 22} stroke="#D5E8DC" strokeWidth="2" strokeLinecap="round" />
       <Line x1={sx + 18} y1={sy + 29} x2={sx + 40} y2={sy + 29} stroke="#9AD1AE" strokeWidth="2" strokeLinecap="round" />
       <Line x1={sx + 15} y1={sy + 36} x2={sx + 28} y2={sy + 36} stroke="#E9A4AA" strokeWidth="2" strokeLinecap="round" />
       <Line x1={sx + 15} y1={sy + 42} x2={sx + Math.min(sw - 8, 38)} y2={sy + 42} stroke="#6E8E81" strokeWidth="1.8" strokeLinecap="round" />
      </G>
     );
    }
    if (screenMode === 'terminal') {
     return (
      <G>
       <Rect x={sx} y={sy} width={sw} height={sh} rx="3" fill="#1A2824" />
       <Rect x={sx} y={sy} width={sw} height="8" rx="2" fill="#263833" />
       <Circle cx={sx + 5} cy={sy + 4} r="1.3" fill="#E37A6F" />
       <Circle cx={sx + 9} cy={sy + 4} r="1.3" fill="#E4BF64" />
       <Circle cx={sx + 13} cy={sy + 4} r="1.3" fill="#6FA882" />
       <Path d={`M${sx + 5} ${sy + 14} L${sx + 8} ${sy + 16} L${sx + 5} ${sy + 18}`} fill="none" stroke="#7AC993" strokeWidth="1.6" strokeLinecap="round" />
       <Line x1={sx + 11} y1={sy + 16} x2={sx + sw - 12} y2={sy + 16} stroke="#D4E6DC" strokeWidth="1.8" strokeLinecap="round" />
       <Line x1={sx + 6} y1={sy + 23} x2={sx + sw - 16} y2={sy + 23} stroke="#8AE0A4" strokeWidth="1.8" strokeLinecap="round" />
       <Line x1={sx + 6} y1={sy + 29} x2={sx + sw - 20} y2={sy + 29} stroke="#F6D98B" strokeWidth="1.8" strokeLinecap="round" />
       <Rect x={sx + 6} y={sy + 36} width={sw - 12} height="4" rx="2" fill="#2D423B" />
       <Rect x={sx + 6} y={sy + 36} width={(sw - 12) * 0.68} height="4" rx="2" fill="#7AC993" />
      </G>
     );
    }
    if (screenMode === 'studio') {
     const split = sx + Math.floor(sw * 0.5);
     return (
      <G>
       <Rect x={sx} y={sy} width={sw} height={sh} rx="3" fill="#23322E" />
       {/* Left code pane */}
       <Line x1={sx + 4} y1={sy + 10} x2={split - 6} y2={sy + 10} stroke="#E9A4AA" strokeWidth="1.8" strokeLinecap="round" />
       <Line x1={sx + 6} y1={sy + 17} x2={split - 4} y2={sy + 17} stroke="#9AD1AE" strokeWidth="1.8" strokeLinecap="round" />
       <Line x1={sx + 6} y1={sy + 24} x2={split - 8} y2={sy + 24} stroke="#F6D488" strokeWidth="1.8" strokeLinecap="round" />
       <Line x1={sx + 4} y1={sy + 31} x2={split - 6} y2={sy + 31} stroke="#C7B6E8" strokeWidth="1.8" strokeLinecap="round" />
       {/* Right live preview card */}
       <Rect x={split + 2} y={sy + 4} width={sw - (split - sx) - 5} height={sh - 8} rx="3" fill="#F8FAF2" />
       <Rect x={split + 5} y={sy + 8} width={sw - (split - sx) - 11} height="13" rx="2" fill="#D5E7CE" />
       <Line x1={split + 5} y1={sy + 26} x2={sx + sw - 7} y2={sy + 26} stroke="#8EA597" strokeWidth="2" strokeLinecap="round" />
       <Rect x={split + 5} y={sy + 31} width={sw - (split - sx) - 11} height="6" rx="2" fill="#5C8A74" />
      </G>
     );
    }
    // Cozy Wallpaper + floating clock + dock
    return (
     <G>
      <Rect x={sx} y={sy} width={sw} height={sh} rx="3" fill={night ? '#465475' : rain ? '#8EA8B5' : '#A9D3DE'} />
      {night ? (
       <Circle cx={sx + sw - 12} cy={sy + 12} r="5" fill="#FAEAC5" />
      ) : (
       <Circle cx={sx + sw - 13} cy={sy + 12} r="6" fill={rain ? '#DCE6E9' : '#FFF1B5'} />
      )}
      <Path
       d={`M${sx} ${sy + 35} Q${sx + sw * 0.35} ${sy + 20} ${sx + sw * 0.65} ${sy + 33} Q${sx + sw * 0.85} ${sy + 26} ${sx + sw} ${sy + 34} V${sy + sh} H${sx}Z`}
       fill={night ? '#597482' : rain ? '#71918E' : '#7EB09D'}
      />
      {/* Tiny desktop clock pill */}
      <Rect x={sx + 6} y={sy + 8} width="20" height="8" rx="3" fill="#FFFFFF" opacity="0.85" />
      <Line x1={sx + 10} y1={sy + 12} x2={sx + 22} y2={sy + 12} stroke="#4D5C55" strokeWidth="1.6" strokeLinecap="round" />
      {/* Mini app dock */}
      <Rect x={sx + sw / 2 - 14} y={sy + sh - 8} width="28" height="5" rx="2.5" fill="#FFFFFF" opacity="0.75" />
      <Circle cx={sx + sw / 2 - 8} cy={sy + sh - 5.5} r="1.4" fill="#E69F82" />
      <Circle cx={sx + sw / 2 - 2.5} cy={sy + sh - 5.5} r="1.4" fill="#7AC993" />
      <Circle cx={sx + sw / 2 + 3} cy={sy + sh - 5.5} r="1.4" fill="#F8D37F" />
      <Circle cx={sx + sw / 2 + 8.5} cy={sy + sh - 5.5} r="1.4" fill="#8EA8D8" />
     </G>
    );
   })()}
   <Path d="M263 193 V204 M250 205 H278" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
   <Rect x="211" y="200" width="69" height="7" rx="3" fill={owned.includes('keyboard') ? '#E9A4AA' : '#71867D'} stroke={stroke} strokeWidth="2" />
   {decorated.includes('lamp') && <G>
    <Ellipse cx="182" cy="187" rx="22" ry="13" fill="#FFF3B8" opacity={night ? .45 : .28} />
    <Path d="M180 205 H196 M188 205 V186 L181 174" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M170 175 Q179 164 189 175Z" fill="#F6C376" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
    <Circle cx="179" cy="176" r="3" fill="#FFF7D6" />
   </G>}
   <Rect x="137" y="187" width="20" height="20" rx="5" fill="#FFF4D9" stroke={stroke} strokeWidth="3" />
   <Path d="M157 190 Q167 191 158 201" fill="none" stroke={stroke} strokeWidth="3" />
   <Path d="M144 178 Q139 173 146 167" fill="none" stroke="#8C9D8B" strokeWidth="2" strokeLinecap="round" />
   {owned.includes('espresso') && <G>
    <Rect x="87" y="172" width="24" height="34" rx="5" fill="#7FA692" stroke={stroke} strokeWidth="2.8" />
    <Rect x="91" y="177" width="16" height="8" rx="2" fill="#FDF6DE" stroke={stroke} strokeWidth="1.8" />
    <Circle cx="96" cy="181" r="1.5" fill="#D97A64" />
    <Circle cx="102" cy="181" r="1.5" fill="#658A6C" />
    <Rect x="93" y="191" width="12" height="12" rx="2" fill="#4D5C55" />
    <Rect x="95" y="196" width="8" height="7" rx="2" fill="#FFF4D9" />
   </G>}
   {owned.includes('headphones') && <G>
    <Path d="M291 196 A10 10 0 0 1 309 196" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    <Rect x="287" y="194" width="6" height="11" rx="3" fill="#E69F82" stroke={stroke} strokeWidth="2" />
    <Rect x="307" y="194" width="6" height="11" rx="3" fill="#E69F82" stroke={stroke} strokeWidth="2" />
   </G>}
   {decorated.includes('goldfish') && <G>
    {/* Cute Desk Goldfish Bowl (fish animated in overlay layer) */}
    <Circle cx="122" cy="193" r="13" fill="#DDF2F6" stroke={stroke} strokeWidth="2.5" />
    <Path d="M110 194 Q122 190 134 194 A12 12 0 0 1 110 194Z" fill="#9FD6E5" />
    <Circle cx="116" cy="189" r="1.2" fill="#FFFFFF" opacity="0.85" />
    <Rect x="115" y="180" width="14" height="3" rx="1.5" fill="#FFFFFF" stroke={stroke} strokeWidth="1.5" />
   </G>}
   {decorated.includes('plant') && <G><Path d="M48 143 H74 L70 161 H52Z" fill="#EAA787" stroke={stroke} strokeWidth="2" /><Path d="M61 144 V117" stroke={stroke} strokeWidth="3" /><Ellipse cx="51" cy="125" rx="9" ry="5" fill="#749E70" transform="rotate(30 51 125)" /><Ellipse cx="70" cy="115" rx="10" ry="5" fill="#749E70" transform="rotate(-35 70 115)" /></G>}
   {/* Ergonomic studio chair: softly reclined backrest hugging the developer's back, seat directly under hips, casters clear of shoes */}
   <Path d="M148 212 Q146 202 156 202 Q164 202 165 212 L168 250 Q168 258 159 258 Q151 258 150 250 Z" fill="#A4BFAE" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
   <Rect x="152" y="253" width="58" height="11" rx="5.5" fill="#8AABA0" stroke={stroke} strokeWidth="3.5" />
   <G>
    <Path d="M179 264 V303 M179 303 L158 311 M179 303 L198 311 M179 303 V313" stroke="#6F827B" strokeWidth="3.5" strokeLinecap="round" />
    <Circle cx="158" cy="311" r="3" fill="#52645E" />
    <Circle cx="179" cy="313" r="3" fill="#52645E" />
    <Circle cx="198" cy="311" r="3" fill="#52645E" />
   </G>
  </Svg>
  <View pointerEvents="none" style={{ position: 'absolute', left: '11.5%', top: '12.4%', width: '25.3%', height: '32.2%', borderRadius: 50, overflow: 'hidden' }}>
   <Animated.View style={[{ position: 'absolute', inset: 0 }, ambientStyle]}><Svg viewBox="0 0 101 114" width="100%" height="100%">
    {rain ? Array.from({ length: 15 }, (_, i) => <Path key={i} d={`M${8 + (i % 5) * 21} ${-8 + Math.floor(i / 5) * 39} l-4 12`} stroke="#E9F3F6" strokeWidth="1.5" strokeLinecap="round" />) : night ? <G>{[[16, 31], [41, 13], [76, 43], [29, 57], [87, 22]].map(([x, y], i) => <Path key={i} d={`M${x - 2} ${y} h4 M${x} ${y - 2} v4`} stroke="#FFF5D8" strokeWidth="1.3" strokeLinecap="round" />)}</G> : <G><Ellipse cx="26" cy="24" rx="12" ry="5" fill="#FFFFFF" opacity="0.72" /><Ellipse cx="34" cy="22" rx="8" ry="4" fill="#FFFFFF" opacity="0.72" /><Circle cx="24" cy="39" r="2" fill="#FFF8DE" /><Circle cx="72" cy="71" r="1.5" fill="#FFF8DE" /><Circle cx="42" cy="88" r="1.5" fill="#FFF8DE" /></G>}
   </Svg></Animated.View>
  </View>
  {/* Animated room life: rising coffee steam, swimming goldfish, twinkling lights & live cursor */}
  <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0 }, steamStyle]}>
   <Svg viewBox="0 0 400 354" width="100%" height="100%">
    <Path d="M144 176 Q139 170 146 164 M150 179 Q146 173 151 168" fill="none" stroke="#8C9D8B" strokeWidth="2" strokeLinecap="round" />
   </Svg>
  </Animated.View>
  {decorated.includes('goldfish') && (
   <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0 }, fishStyle]}>
    <Svg viewBox="0 0 400 354" width="100%" height="100%">
     <Ellipse cx="121" cy="196" rx="4.2" ry="2.6" fill="#F28C4B" />
     <Path d="M125 196 L128 193.5 V198.5Z" fill="#F28C4B" />
     <Circle cx="119.5" cy="195.5" r="0.8" fill={stroke} />
    </Svg>
   </Animated.View>
  )}
  {(working || decorated.includes('lights') || decorated.includes('lamp')) && (
   <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0 }, glowPulseStyle]}>
    <Svg viewBox="0 0 400 354" width="100%" height="100%">
     {working && <Rect x={owned.includes('oled') ? 278 : 268} y="154" width="3" height="7" rx="1" fill="#8AE0A4" />}
     {decorated.includes('lamp') && <Ellipse cx="182" cy="187" rx="26" ry="16" fill="#FFF3B8" opacity={night ? 0.25 : 0.14} />}
     {decorated.includes('lights') && [[46, 25], [142, 27], [268, 30], [364, 20]].map(([lx, ly], i) => (
      <Circle key={i} cx={lx} cy={ly} r="10" fill="#FFEAA7" opacity={night ? 0.35 : 0.18} />
     ))}
    </Svg>
   </Animated.View>
  )}
   {catOwned && <DeskCat working={working} />}
   {!(napping && !working && fullScreen) && (
    <Developer working={working} celebrating={celebrating} napping={napping} style={developerStyle} />
   )}
   {/* Tap the computer monitor to cycle between Code Editor, Terminal, Split Studio & Wallpaper */}
   <Pressable
    accessibilityRole="button"
    accessibilityLabel="Switch monitor screen display"
    onPress={cycleScreen}
    style={{
     position: 'absolute',
     left: '57%',
     top: '35%',
     width: owned.includes('oled') ? '26%' : owned.includes('monitor') ? '23%' : '18%',
     height: '19%',
     borderRadius: 8,
    }}
   />
   {decorated.includes('tv') && (
    <Pressable
     accessibilityRole="button"
     accessibilityLabel="Switch Smart TV channel"
     onPress={() => {
      const channels: ('lofi' | 'pong' | 'matrix')[] = ['lofi', 'pong', 'matrix'];
      setTvChannel(prev => channels[(channels.indexOf(prev) + 1) % channels.length]!);
     }}
     style={{
      position: 'absolute',
      left: '70%',
      top: '20%',
      width: '22%',
      height: '15%',
      borderRadius: 8,
     }}
    />
   )}
   {onOpenGarage && (
    <Pressable
     accessibilityRole="button"
     accessibilityLabel="Look outside window to visit garage"
     onPress={onOpenGarage}
     style={{
      position: 'absolute',
      left: '11%',
      top: '12%',
      width: '26%',
      height: '33%',
      borderRadius: 12,
     }}
    />
   )}
   {onOpenPhone && (
    <Pressable
     accessibilityRole="button"
     accessibilityLabel="Pick up your desk smartphone"
     onPress={onOpenPhone}
     style={{
      position: 'absolute',
      left: '39%',
      top: '53%',
      width: '8%',
      height: '8%',
      borderRadius: 8,
     }}
    />
   )}
   {catOwned && onPetCat && (
    <Pressable
     accessibilityRole="button"
     accessibilityLabel="Pet your desk cat"
     onPress={onPetCat}
     style={{
      position: 'absolute',
      left: '20%',
      top: '46%',
      width: '17%',
      height: '16%',
      borderRadius: 20,
     }}
    />
   )}
  </View>
 );

 if (!fullScreen) {
  return (
   <View
    accessibilityLabel={`Your developer ${
     working ? 'is typing at the computer' : celebrating ? 'is celebrating a finished project' : 'is taking a quiet break'
    }${catOwned ? ', with your adopted desk cat napping beside the coffee' : ''} in the ${atmosphere} studio`}
    style={{ width: '100%' }}
   >
    {canvas}
   </View>
  );
 }

 const numericH = typeof stageHeight === 'number' ? stageHeight : 354;
 const numericW = typeof stageWidth === 'number' ? stageWidth : 400;
 const leftWingW = Math.round(numericH * (230 / 354));
 const rightWingW = Math.round(numericH * (210 / 354));
 const totalPanW = leftWingW + numericW + rightWingW;

 // Smooth, finite apartment pan: center on Coding Desk on launch, pan smoothly to Bedroom when napping!
 useEffect(() => {
  if (!fullScreen || box.width <= 0) return;
  const deskCenterX = Math.max(0, leftWingW + (numericW - box.width) / 2);
  if (!centeredOnceRef.current) {
   centeredOnceRef.current = true;
   setTimeout(() => panRef.current?.scrollTo({ x: deskCenterX, animated: false }), 20);
   return;
  }
  if (napping && !working) {
   const bedX = Math.max(0, totalPanW - box.width);
   panRef.current?.scrollTo({ x: bedX, animated: !reduced });
  } else if (working) {
   panRef.current?.scrollTo({ x: deskCenterX, animated: !reduced });
  }
 }, [fullScreen, box.width, leftWingW, numericW, totalPanW, napping, working, reduced]);

 const sleepHair =
  developerStyle === 'straight' ? '#5E3B2B' : developerStyle === 'bob' ? '#704431' : '#3C2D27';
 const sleepSkin =
  developerStyle === 'straight' ? '#E4B18D' : developerStyle === 'cap' ? '#B97856' : developerStyle === 'bob' ? '#EDC1A1' : '#C68763';

 const leftWing = (
  <View style={{ width: leftWingW, height: stageHeight, position: 'relative' }}>
   <Svg viewBox="0 0 230 354" width="100%" height="100%">
    <Rect width="230" height="354" fill={wall} />
    <Rect y="250" width="230" height="104" fill={floor} />
    <Rect y="244" width="230" height="8" fill={homePalette.trim} opacity="0.7" />
    <Line x1="0" y1="244" x2="230" y2="244" stroke={stroke} strokeWidth="1.5" opacity="0.22" />
    {[275, 299, 323].map(y => (
     <Line key={y} x1="0" y1={y} x2="230" y2={y} stroke="#4D5C5515" strokeWidth="2" />
    ))}
    {/* Cozy Entrance Door to the Garage / Outside (tappable!) */}
    <Rect x="16" y="74" width="76" height="176" rx="8" fill={homePalette.trim} stroke={stroke} strokeWidth="3.4" />
    <Rect x="22" y="80" width="64" height="170" rx="5" fill="#C49A74" stroke={stroke} strokeWidth="2.8" />
    {/* Upper frosted door window */}
    <Rect x="32" y="92" width="44" height="52" rx="4" fill={night ? '#3B4B61' : rain ? '#9AB4BC' : '#CBE6EB'} stroke={stroke} strokeWidth="2.4" />
    <Line x1="54" y1="92" x2="54" y2="144" stroke={stroke} strokeWidth="2" />
    <Line x1="32" y1="118" x2="76" y2="118" stroke={stroke} strokeWidth="2" />
    {/* Lower wood panel + brass doorknob */}
    <Rect x="32" y="160" width="44" height="72" rx="4" fill="#B58963" stroke={stroke} strokeWidth="2" />
    <Circle cx="78" cy="176" r="4.2" fill="#F2C864" stroke={stroke} strokeWidth="2" />
    {/* Welcome mat in front of entrance door */}
    <Path d="M18 260 H90 L98 278 H10 Z" fill="#D59A73" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" />
    <Line x1="34" y1="269" x2="74" y2="269" stroke="#F8E7CE" strokeWidth="2.4" strokeLinecap="round" />

    {/* Vinyl Credenza + Record Player */}
    <Rect x="108" y="196" width="56" height="58" rx="6" fill="#C99C76" stroke={stroke} strokeWidth="3" />
    <Line x1="136" y1="198" x2="136" y2="252" stroke={stroke} strokeWidth="2.2" />
    <Circle cx="130" cy="224" r="2.2" fill="#F5DFB5" />
    <Circle cx="142" cy="224" r="2.2" fill="#F5DFB5" />
    <Rect x="114" y="182" width="42" height="14" rx="3" fill="#52655E" stroke={stroke} strokeWidth="2.4" />
    <Ellipse cx="133" cy="182" rx="13" ry="3.8" fill="#222E2A" stroke={stroke} strokeWidth="1.6" />
    <Circle cx="133" cy="182" r="2" fill="#E69F82" />
    {/* Framed botanical art above credenza */}
    <Rect x="114" y="88" width="46" height="58" rx="5" fill="#FDF8E8" stroke={stroke} strokeWidth="2.8" />
    <Rect x="120" y="94" width="34" height="46" rx="2" fill="#E3EEDB" />
    <Path d="M137 134 V106 M137 125 Q128 119 126 112 Q134 113 137 120 M137 118 Q146 113 148 105 Q140 107 137 114" fill="#6F9D75" stroke={stroke} strokeWidth="1.7" strokeLinejoin="round" />
    {/* Cozy Mustard Reading Armchair */}
    <Rect x="172" y="218" width="50" height="44" rx="13" fill="#E2B26B" stroke={stroke} strokeWidth="3" />
    <Rect x="168" y="242" width="58" height="28" rx="10" fill="#E8BE7D" stroke={stroke} strokeWidth="3" />
    <Rect x="178" y="230" width="20" height="15" rx="6" fill="#FDF6DE" stroke={stroke} strokeWidth="2" />
   </Svg>
   {onOpenGarage && (
    <Pressable
     accessibilityRole="button"
     accessibilityLabel="Open studio entrance door to visit your garage"
     onPress={onOpenGarage}
     style={{
      position: 'absolute',
      left: '6%',
      top: '20%',
      width: '36%',
      height: '58%',
      borderRadius: 10,
     }}
    />
   )}
  </View>
 );

 const rightWing = (
  <View style={{ width: rightWingW, height: stageHeight, position: 'relative' }}>
   <Svg viewBox="0 0 210 354" width="100%" height="100%">
    <Rect width="210" height="354" fill={wall} />
    <Rect y="250" width="210" height="104" fill={floor} />
    <Rect y="244" width="210" height="8" fill={homePalette.trim} opacity="0.7" />
    <Line x1="0" y1="244" x2="210" y2="244" stroke={stroke} strokeWidth="1.5" opacity="0.22" />
    {[275, 299, 323].map(y => (
     <Line key={y} x1="0" y1={y} x2="210" y2={y} stroke="#4D5C5515" strokeWidth="2" />
    ))}
    {/* Floating trophy & succulent shelf */}
    <Rect x="42" y="88" width="112" height="10" rx="4" fill="#B8997B" stroke={stroke} strokeWidth="2.6" />
    <Path d="M62 88 V76 M56 76 H68 L66 64 H58 Z" fill="#F2C864" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
    <Rect x="84" y="64" width="11" height="24" rx="2.5" fill="#91B8A6" stroke={stroke} strokeWidth="2" />
    <Rect x="97" y="68" width="11" height="20" rx="2.5" fill="#E69F82" stroke={stroke} strokeWidth="2" />
    <Path d="M126 88 H142 L139 76 H129 Z" fill="#EAA787" stroke={stroke} strokeWidth="2" />
    <Circle cx="134" cy="71" r="6" fill="#749E70" stroke={stroke} strokeWidth="1.8" />
    {/* Bedside Nightstand + Glowing Nightlight */}
    <Rect x="14" y="222" width="38" height="48" rx="5" fill="#C99C76" stroke={stroke} strokeWidth="3" />
    <Rect x="25" y="236" width="16" height="3.5" rx="1.5" fill="#F5DFB5" />
    <Circle cx="33" cy="204" r="20" fill="#FFEAA7" opacity={night || napping ? 0.42 : 0.16} />
    <Path d="M26 222 H40 M33 222 V210" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" />
    <Path d="M23 210 Q33 196 43 210 Z" fill="#F8D37F" stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" />
    {/* Single Full Cozy Bed in Bedroom Wing */}
    <Rect x="60" y="198" width="132" height="58" rx="10" fill={decorated.includes('bed') ? '#C89E7A' : '#D5B89B'} stroke={stroke} strokeWidth="3.2" />
    <Rect x="64" y="236" width="124" height="42" rx="8" fill="#FAF4E6" stroke={stroke} strokeWidth="3.2" />
    {/* Soft plush white pillow */}
    <Rect x="70" y="222" width="38" height="17" rx="8" fill="#FFFFFF" stroke={stroke} strokeWidth="2.5" />
    {/* Natural horizontal sleeping mascot tucked cozily under the duvet! */}
    {napping && !working && (
     <G>
      <Ellipse cx="88" cy="224" rx="14" ry="12.5" fill={sleepHair} stroke={stroke} strokeWidth="2.6" />
      <Path d="M88 214 Q102 216 101 226 Q98 235 87 233 Q83 226 88 214 Z" fill={sleepSkin} stroke={stroke} strokeWidth="2.4" strokeLinejoin="round" />
      <Path d="M92 223 Q95 225.5 98 223" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
      <Ellipse cx="94" cy="228" rx="3" ry="1.6" fill="#DBA086" />
      <Path d="M100 232 Q136 216 174 232 L187 236 V278 H100 Q95 256 100 232 Z" fill={decorated.includes('bed') ? '#87AD94' : '#9BBAA6'} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <Circle cx="102" cy="234" r="5" fill={sleepSkin} stroke={stroke} strokeWidth="2.2" />
     </G>
    )}
    {!(napping && !working) && (
     <G>
      <Path d="M104 235 H187 V278 H104 Q98 256 104 235 Z" fill={decorated.includes('bed') ? '#87AD94' : '#9BBAA6'} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      <Line x1="126" y1="237" x2="126" y2="276" stroke="#70967E" strokeWidth="2.2" />
     </G>
    )}
    <Line x1="70" y1="278" x2="70" y2="296" stroke={stroke} strokeWidth="5.5" strokeLinecap="round" />
    <Line x1="182" y1="278" x2="182" y2="296" stroke={stroke} strokeWidth="5.5" strokeLinecap="round" />
   </Svg>
   {napping && !working && (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', inset: 0 }, steamStyle]}>
     <Svg viewBox="0 0 210 354" width="100%" height="100%">
      <Path d="M108 194 H117 L108 203 H117" fill="none" stroke="#DCECE4" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M121 180 H128 L121 187 H128" fill="none" stroke="#DCECE4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
     </Svg>
    </Animated.View>
   )}
   {onToggleNap && !working && (
    <Pressable
     accessibilityRole="button"
     accessibilityLabel={napping ? 'Wake up from bed' : 'Take a nap in bed'}
     onPress={onToggleNap}
     style={{
      position: 'absolute',
      left: '26%',
      top: '54%',
      width: '66%',
      height: '32%',
      borderRadius: 12,
     }}
    />
   )}
  </View>
 );

 return (
  <View
   onLayout={onLayout}
   accessibilityLabel={`Your developer ${
    working ? 'is typing at the computer' : celebrating ? 'is celebrating a finished project' : napping ? 'is napping in bed' : 'is taking a quiet break'
   }${catOwned ? ', with your adopted desk cat napping beside the coffee' : ''} in the ${atmosphere} studio. Swipe left to see the entrance door and lounge, or right to see the bedroom.`}
   style={{
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: wall,
   }}
  >
   <View
    pointerEvents="none"
    style={{
     position: 'absolute',
     left: 0,
     right: 0,
     bottom: 0,
     height: '34%',
     backgroundColor: floor,
     borderTopWidth: 3,
     borderTopColor: '#B5997F',
    }}
   />
   <ScrollView
    ref={panRef}
    horizontal
    bounces={false}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{
     width: totalPanW,
     height: '100%',
     flexDirection: 'row',
     alignItems: 'center',
    }}
   >
    {leftWing}
    {canvas}
    {rightWing}
   </ScrollView>
   {/* Soft lights-off dim overlay when the mascot is sleeping in bed */}
   {napping && !working && (
    <View
     pointerEvents="none"
     style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: '#121E2B',
      opacity: 0.34,
     }}
    />
   )}
  </View>
 );
}
