import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Atmosphere } from '../game/game';
import { Developer, DeskCat } from './developer';
import Svg, { Circle, Ellipse, G, Path, Rect, Line } from 'react-native-svg';

export function Room({ working, celebrating = false, catOwned = false, owned, decorated, atmosphere = 'sunny' }: { working: boolean; celebrating?: boolean; catOwned?: boolean; owned: string[]; decorated: string[]; atmosphere?: Atmosphere }) {
 const reduced = useReducedMotion(); const ambient = useSharedValue(0);
 useEffect(() => {
  if (reduced) { ambient.set(0); return; }
  ambient.set(withRepeat(withSequence(withTiming(1, { duration: atmosphere === 'rainy' ? 850 : 4000, easing: Easing.linear }), withTiming(0, { duration: atmosphere === 'rainy' ? 0 : 4000, easing: Easing.linear })), -1));
  return () => { cancelAnimation(ambient); };
 }, [atmosphere, reduced, ambient]);
 const ambientStyle = useAnimatedStyle(() => ({ opacity: atmosphere === 'moonlit' ? .5 + ambient.get() * .5 : .8, transform: [{ translateY: atmosphere === 'rainy' ? ambient.get() * 9 : -ambient.get() * 4 }] }));
 const night = atmosphere === 'moonlit'; const rain = atmosphere === 'rainy';
 const wall = night ? '#C8D1DB' : rain ? '#D7E4E2' : '#E2EDE2';
 const stroke = '#4D5C55';
 return <View accessibilityLabel={`Your developer ${working ? 'is typing at the computer' : celebrating ? 'is celebrating a finished project' : 'is taking a quiet break'}${catOwned ? ', with your adopted desk cat napping beside the coffee' : ''} in the ${atmosphere} studio`} style={{ aspectRatio: 1.13, width: '100%', overflow: 'hidden', borderRadius: 32, backgroundColor: wall }}>
  <Svg viewBox="0 0 400 354" width="100%" height="100%">
   <Rect width="400" height="354" fill={wall} />
   <Path d="M0 259 Q200 242 400 259 V354 H0Z" fill={night ? '#B6A89F' : '#D5BC9E'} />
   <Path d="M0 259 Q200 242 400 259" stroke="#B5997F" strokeWidth="3" fill="none" />
   {[288, 320, 350].map(y => <Line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#C8AB8D" strokeWidth="2" />)}
   <Rect x="37" y="35" width="119" height="133" rx="54" fill="#FDF6DE" stroke={stroke} strokeWidth="4" />
   <Rect x="46" y="44" width="101" height="114" rx="46" fill={night ? '#596987' : rain ? '#9EB7C3' : '#AFD7E0'} />
   {night ? <Path d="M121 59 A17 17 0 1 0 129 86 A18 18 0 0 1 121 59" fill="#FAEAC5" /> : rain ? <G><Ellipse cx="110" cy="74" rx="24" ry="11" fill="#DCE6E9" /><Circle cx="102" cy="68" r="11" fill="#DCE6E9" /><Circle cx="118" cy="68" r="13" fill="#DCE6E9" /></G> : <Circle cx="115" cy="76" r="17" fill="#FFF2B7" />}
   <Path d="M48 129 Q72 100 97 128 Q121 111 145 137 V156 H48Z" fill={night ? '#6C8893' : rain ? '#7F9F9C' : '#8AB7A6'} />
   <Path d="M97 42 V160 M43 103 H151" stroke="#FDF6DE" strokeWidth="6" />
   <Rect x="28" y="160" width="138" height="12" rx="6" fill="#FDF6DE" stroke={stroke} strokeWidth="3" />
   <Path d="M270 52 H354 V64 H270Z" fill="#B8997B" stroke={stroke} strokeWidth="3" />
   <Rect x="282" y="22" width="13" height="30" rx="3" fill="#E69F82" stroke={stroke} strokeWidth="2" />
   <Rect x="297" y="17" width="13" height="35" rx="3" fill="#F8D37F" stroke={stroke} strokeWidth="2" />
   <Path d="M316 30 L325 26 L335 50 L326 54Z" fill="#91B8A6" stroke={stroke} strokeWidth="2" />
   {decorated.includes('poster') && <G><Rect x="198" y="33" width="53" height="70" rx="4" fill="#FDF6DE" stroke={stroke} strokeWidth="3" /><Rect x="204" y="39" width="41" height="58" fill="#777EA8" /><Path d="M229 49 A15 15 0 1 0 235 75 A17 17 0 0 1 229 49" fill="#F9DC9B" /><Circle cx="214" cy="49" r="2" fill="#FFF5D2" /></G>}
   {decorated.includes('rug') && <Ellipse cx="210" cy="311" rx="127" ry="29" fill="#E9A68E" stroke="#B87764" strokeWidth="3" />}
   <Ellipse cx="205" cy="306" rx="87" ry="17" fill="#9B806A" opacity=".2" />
   <Path d="M108 220 L101 303 M291 220 L299 303" stroke={stroke} strokeWidth="12" strokeLinecap="round" />
   <Path d="M108 220 L101 303 M291 220 L299 303" stroke="#BA9676" strokeWidth="7" strokeLinecap="round" />
   <Rect x="83" y="207" width="232" height="18" rx="8" fill="#D9AD85" stroke={stroke} strokeWidth="4" />
   <Rect x="228" y="127" width={owned.includes('monitor') ? 91 : 69} height="65" rx="8" fill={owned.includes('monitor') ? '#B7A6D8' : '#667D75'} stroke={stroke} strokeWidth="4" />
   <Rect x="235" y="134" width={owned.includes('monitor') ? 77 : 55} height="48" rx="3" fill="#D0E6C3" />
   <Path d="M246 147 L253 152 L246 157 M261 160 H275" fill="none" stroke="#658A6C" strokeWidth="3" strokeLinecap="round" />
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
   {decorated.includes('plant') && <G><Path d="M48 143 H74 L70 161 H52Z" fill="#EAA787" stroke={stroke} strokeWidth="2" /><Path d="M61 144 V117" stroke={stroke} strokeWidth="3" /><Ellipse cx="51" cy="125" rx="9" ry="5" fill="#749E70" transform="rotate(30 51 125)" /><Ellipse cx="70" cy="115" rx="10" ry="5" fill="#749E70" transform="rotate(-35 70 115)" /></G>}
   {celebrating && <Rect x="166" y="231" width="47" height="34" rx="13" fill="#A4BFAE" stroke={stroke} strokeWidth="4" />}
   <Rect x="162" y="265" width="62" height="10" rx="5" fill="#8AABA0" stroke={stroke} strokeWidth="4" />
   {celebrating ? <Path d="M191 274 V300 M191 300 L167 308 M191 300 L216 308" stroke={stroke} strokeWidth="5" strokeLinecap="round" /> : <G>
    <Path d="M182 275 V309 M182 309 L160 315 M182 309 L205 315" stroke="#788A83" strokeWidth="3.5" strokeLinecap="round" />
    <Circle cx="160" cy="315" r="3" fill="#788A83" /><Circle cx="205" cy="315" r="3" fill="#788A83" />
   </G>}
  </Svg>
  <View pointerEvents="none" style={{ position: 'absolute', left: '11.5%', top: '12.4%', width: '25.3%', height: '32.2%', borderRadius: 50, overflow: 'hidden' }}>
   <Animated.View style={[{ position: 'absolute', inset: 0 }, ambientStyle]}><Svg viewBox="0 0 101 114" width="100%" height="100%">
    {rain ? Array.from({ length: 15 }, (_, i) => <Path key={i} d={`M${8 + (i % 5) * 21} ${-8 + Math.floor(i / 5) * 39} l-4 12`} stroke="#E9F3F6" strokeWidth="1.5" strokeLinecap="round" />) : night ? <G>{[[16, 31], [41, 13], [76, 43], [29, 57], [87, 22]].map(([x, y], i) => <Path key={i} d={`M${x - 2} ${y} h4 M${x} ${y - 2} v4`} stroke="#FFF5D8" strokeWidth="1.3" strokeLinecap="round" />)}</G> : <G><Circle cx="24" cy="39" r="2" fill="#FFF8DE" /><Circle cx="72" cy="71" r="1.5" fill="#FFF8DE" /><Circle cx="42" cy="88" r="1.5" fill="#FFF8DE" /></G>}
   </Svg></Animated.View>
  </View>
  {catOwned && <DeskCat working={working} />}
  <Developer working={working} celebrating={celebrating} />
 </View>;
}
