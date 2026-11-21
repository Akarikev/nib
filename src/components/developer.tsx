import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

const ink = '#4D5C55';
const skin = '#C98E6B';
const hair = '#4B403A';
const ease = Easing.bezier(.77, 0, .175, 1);
// Explicit edges work identically in native Yoga and browser layout. Every SVG shares this coordinate space.
const layer = { position: 'absolute' as const, top: 0, right: 0, bottom: 0, left: 0 };
function Canvas({ children }: { children: React.ReactNode }) { return <Svg viewBox="0 0 400 354" width="100%" height="100%" style={layer}>{children}</Svg>; }

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Approved complete pose: shoulders, sleeves and palms never move independently.
// Keyboard is at x=211..280, y=200..207 in the room's shared 400×354 space.
function SeatedTypingStill({ working }: { working: boolean }) {
 const reduced = useReducedMotion();
 const tap = useSharedValue(0); const blink = useSharedValue(0);
 useEffect(() => {
  cancelAnimation(tap); cancelAnimation(blink); tap.set(0); blink.set(0);
  if (!reduced) {
   // Two short pairs of key contacts, then a pause. No hand or arm translation.
   if (working) tap.set(withRepeat(withSequence(
    withTiming(1, { duration: 120, easing: ease }), withTiming(0, { duration: 120, easing: ease }),
    withTiming(1, { duration: 120, easing: ease }), withTiming(0, { duration: 120, easing: ease }),
    withDelay(750, withTiming(0, { duration: 0 }))
   ), -1));
   blink.set(withRepeat(withSequence(withDelay(4800, withTiming(1, { duration: 80, easing: ease })), withTiming(0, { duration: 120, easing: ease })), -1));
  }
  return () => { cancelAnimation(tap); cancelAnimation(blink); };
 }, [working, reduced, tap, blink]);
 const farFinger = useAnimatedProps(() => ({ opacity: working && !reduced ? 1 - tap.get() * .55 : 1 }));
 const nearFinger = useAnimatedProps(() => ({ opacity: working && !reduced ? .45 + tap.get() * .55 : 1 }));
 const farKey = useAnimatedProps(() => ({ opacity: working && !reduced ? tap.get() * .65 : 0 }));
 const nearKey = useAnimatedProps(() => ({ opacity: working && !reduced ? (1 - tap.get()) * .65 : 0 }));
 const eye = useAnimatedProps(() => ({ opacity: 1 - blink.get() * .85 }));
 return <View pointerEvents="none" style={layer}><Canvas>
  {/* Lower body: continuous thighs from the hips, knees ahead of the seat. */}
  <Path d="M175 247 Q180 260 198 263 Q205 264 205 272 L201 295 Q196 298 191 294 L194 272 Q172 270 168 257Z" fill="#927568" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
  <Path d="M195 247 Q207 249 224 257 Q231 260 230 270 L226 295 Q220 298 216 294 L218 270 Q201 268 190 260Z" fill="#AA8978" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
  <Path d="M191 293 L190 300 Q201 304 212 300 Q211 295 201 293Z M216 293 L215 300 Q226 304 237 300 Q236 295 226 293Z" fill="#F6E7CF" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
  {/* Far sleeve belongs behind the torso; its elbow turns into a level forearm. */}
  <Path d="M194 190 Q202 187 208 196 L216 207 L231 198 L238 205 L219 217 Q212 221 206 213 L191 201Z" fill="#7FA58F" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
  <Path d="M230 199 Q234 196 240 197 L247 199 Q250 201 247 203 L238 203 L235 206Z" fill={skin} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
  <AnimatedPath animatedProps={farFinger} d="M239 199 L246 200" stroke="#A86F52" strokeWidth="1.4" strokeLinecap="round" />
  {/* Back and shoulders are a single hoodie silhouette, not a sleeve across the neck. */}
  <Path d="M162 250 Q160 218 167 201 Q173 190 187 191 L204 191 Q216 194 220 207 L222 252 Q194 261 162 250Z" fill="#91B5A0" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
  <Path d="M183 184 V197 Q191 204 201 198 V183" fill={skin} stroke={ink} strokeWidth="3" />
  <Path d="M173 196 Q188 211 205 196 Q202 211 190 212 Q177 211 173 196Z" fill="#A8C5AF" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
  <Path d="M174 240 Q191 245 209 241" fill="none" stroke="#6E9583" strokeWidth="2.5" strokeLinecap="round" />
  {/* Near shoulder → upper arm → bent elbow → forearm → palm on keyboard. */}
  <Path d="M208 192 Q218 189 223 199 L232 210 L251 199 L258 207 L236 220 Q228 225 220 216 L205 203 Q201 196 208 192Z" fill="#91B5A0" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
  <Path d="M249 200 L255 208" stroke="#6E9583" strokeWidth="2" strokeLinecap="round" />
  <Path d="M252 199 Q257 196 262 198 L269 201 Q271 204 267 205 L259 205 L256 208Z" fill={skin} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
  <AnimatedPath animatedProps={nearFinger} d="M261 200 L267 202" stroke="#A86F52" strokeWidth="1.4" strokeLinecap="round" />
  {/* Contact marks sit on the keys, beneath the fixed fingertips. */}
  <AnimatedPath animatedProps={farKey} d="M240 204 H246" stroke="#FFF1BF" strokeWidth="1.5" strokeLinecap="round" />
  <AnimatedPath animatedProps={nearKey} d="M261 206 H267" stroke="#FFF1BF" strokeWidth="1.5" strokeLinecap="round" />
  {/* Chair back overlaps the seated hips only, far from elbows and hands. */}
  <Rect x="166" y="231" width="47" height="34" rx="13" fill="#A4BFAE" stroke={ink} strokeWidth="4" />
  {/* Same curly-haired developer, lowered chin toward the screen, raised shoulder line. */}
  <Path d="M158 165 Q147 156 153 141 Q149 131 160 127 Q159 115 175 118 Q185 107 196 116 Q211 112 218 125 Q229 128 225 143 L223 166 Q220 187 201 193 Q170 198 158 176Z" fill={hair} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
  <Path d="M214 141 Q225 145 225 161 L234 166 Q237 170 229 173 L226 179 Q221 189 207 189 L206 177 Q213 168 210 159Z" fill={skin} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
  <Ellipse cx="208" cy="167" rx="6" ry="8" fill={skin} stroke={ink} strokeWidth="2.5" />
  <Path d="M207 165 Q211 163 210 169 M222 179 L226 178" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
  <AnimatedPath animatedProps={eye} d="M221 164 L225 164" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
  <Ellipse cx="221" cy="173" rx="4" ry="2.5" fill="#DBA086" />
 </Canvas></View>;
}

export function Developer({ working, celebrating }: { working: boolean; celebrating: boolean }) {
 // Approved pose stays connected in working and idle; only finger/key cues and blink animate.
 return celebrating ? <LegacyCelebration working={working} celebrating={celebrating} /> : <SeatedTypingStill working={working} />;
}

// All movement uses transforms on transparent SVG layers, driven on the UI thread.
function LegacyCelebration({ working, celebrating }: { working: boolean; celebrating: boolean }) {
 const reduced = useReducedMotion(); const lift = useSharedValue(0); const typing = useSharedValue(0); const breath = useSharedValue(0); const jump = useSharedValue(0);
 useEffect(() => {
  cancelAnimation(lift); cancelAnimation(typing); cancelAnimation(breath); cancelAnimation(jump);
  typing.set(0); breath.set(0); jump.set(0);
  if (reduced) { lift.set(celebrating ? 1 : 0); return; }
  if (celebrating) {
   lift.set(withTiming(1, { duration: 250, easing: Easing.bezier(.23, 1, .32, 1) }));
   jump.set(withSequence(withTiming(-5, { duration: 200, easing: ease }), withTiming(0, { duration: 250, easing: ease })));
  } else if (working) {
   lift.set(withTiming(0, { duration: 200, easing: ease }));
   typing.set(withRepeat(withSequence(withTiming(1, { duration: 350, easing: ease }), withTiming(0, { duration: 350, easing: ease })), -1));
  } else {
   lift.set(withRepeat(withSequence(withTiming(0, { duration: 200, easing: ease }), withDelay(8000, withTiming(1, { duration: 700, easing: ease })), withDelay(1000, withTiming(0, { duration: 700, easing: ease }))), -1));
  }
  if (!celebrating) breath.set(withRepeat(withSequence(withTiming(1, { duration: 1800, easing: ease }), withTiming(0, { duration: 1800, easing: ease })), -1));
  return () => { [lift, typing, breath, jump].forEach(cancelAnimation); };
 }, [working, celebrating, reduced, lift, typing, breath, jump]);
 const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateX: celebrating ? 46 : 0 }, { translateY: jump.get() - breath.get() * .8 }] }));
 const leftStyle = useAnimatedStyle(() => ({ transformOrigin: '41.5% 61%', transform: [{ translateY: working ? typing.get() * 1.3 : 0 }, { rotate: `${lift.get() * 150}deg` }] }));
 const rightStyle = useAnimatedStyle(() => ({ transformOrigin: '53.5% 61%', transform: [{ translateY: working ? -typing.get() * 1.3 : 0 }, { rotate: `${-lift.get() * 150}deg` }] }));
 return <Animated.View pointerEvents="none" style={[layer, bodyStyle]}>
  <Canvas>
   {celebrating ? <>
    {/* A dedicated standing pelvis and legs, not the seated legs behind the chair. */}
    <Path d="M166 246 Q190 242 215 246 L213 295 Q207 300 200 295 L195 270 H187 L182 295 Q175 300 168 295Z" fill="#9B7C70" stroke={ink} strokeWidth="4" strokeLinejoin="round" />
    <Path d="M168 293 L164 302 Q174 307 185 302 L182 294 M200 294 L199 302 Q213 307 223 301 Q221 296 212 293" fill="#F6E7CF" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
   </> : <>
   {/* Thighs turn toward the desk; knees and shins sit beyond the chair stem. */}
   <Path d="M175 247 Q180 260 198 263 Q205 264 205 272 L201 295 Q196 298 191 294 L194 272 Q172 270 168 257Z" fill="#927568" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
   <Path d="M195 247 Q207 249 224 257 Q231 260 230 270 L226 295 Q220 298 216 294 L218 270 Q201 268 190 260Z" fill="#AA8978" stroke={ink} strokeWidth="3.5" strokeLinejoin="round" />
   <Path d="M191 293 L190 300 Q201 304 212 300 Q211 295 201 293Z M216 293 L215 300 Q226 304 237 300 Q236 295 226 293Z" fill="#F6E7CF" stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />
   </>}
   <Path d="M157 247 Q157 216 171 208 Q189 201 210 209 Q222 219 221 249 Q193 260 157 247Z" fill="#91B5A0" stroke={ink} strokeWidth="4" />
   <Path d="M176 213 Q190 224 206 213 M177 242 Q191 247 204 241" fill="none" stroke="#6E9583" strokeWidth="2.5" strokeLinecap="round" />
   {!celebrating && <Rect x="166" y="231" width="47" height="34" rx="13" fill="#A4BFAE" stroke={ink} strokeWidth="4" />}
   <Path d="M184 204 V215 Q192 219 199 214 V203" fill={skin} stroke={ink} strokeWidth="3" />
  </Canvas>
  <Animated.View style={[layer, leftStyle]}><Canvas>
   <Path d={!celebrating ? 'M166 216 Q182 224 204 208 L220 201' : 'M166 216 Q156 230 170 237'} stroke={ink} strokeWidth="16" fill="none" strokeLinecap="round" />
   <Path d={!celebrating ? 'M166 216 Q182 224 204 208 L214 204' : 'M166 216 Q156 230 166 235'} stroke="#91B5A0" strokeWidth="11" fill="none" strokeLinecap="round" />
   <Ellipse cx={!celebrating ? 221 : 171} cy={!celebrating ? 201 : 238} rx="7" ry="5" fill={skin} stroke={ink} strokeWidth="2.5" />
  </Canvas></Animated.View>
  <Animated.View style={[layer, rightStyle]}><Canvas>
   <Path d={!celebrating ? 'M214 216 Q234 220 247 201' : 'M214 216 Q228 230 215 238'} stroke={ink} strokeWidth="16" fill="none" strokeLinecap="round" />
   <Path d={!celebrating ? 'M214 216 Q234 220 244 205' : 'M214 216 Q228 230 220 235'} stroke="#91B5A0" strokeWidth="11" fill="none" strokeLinecap="round" />
   <Ellipse cx={!celebrating ? 249 : 214} cy={!celebrating ? 201 : 239} rx="7" ry="5" fill={skin} stroke={ink} strokeWidth="2.5" />
  </Canvas></Animated.View>
  <Canvas>
   {!celebrating ? <>
    {/* Rear three-quarter silhouette: a single hair mass, with a clean skin profile facing the screen. */}
    <Path d="M158 181 Q147 172 153 157 Q149 147 160 143 Q159 131 175 134 Q185 123 196 132 Q211 128 218 141 Q229 144 225 159 L223 182 Q220 203 201 209 Q170 214 158 192Z" fill={hair} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    <Path d="M214 157 Q225 161 225 177 L234 182 Q237 186 229 189 L226 195 Q221 205 207 205 L206 193 Q213 184 210 175Z" fill={skin} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    <Ellipse cx="208" cy="183" rx="6" ry="8" fill={skin} stroke={ink} strokeWidth="2.5" />
    <Path d="M207 181 Q211 179 210 185 M221 180 L225 180 M222 195 L226 194" fill="none" stroke={ink} strokeWidth="2" strokeLinecap="round" />
    <Ellipse cx="221" cy="189" rx="4" ry="2.5" fill="#DBA086" />
   </> : <>
    <Ellipse cx="157" cy="179" rx="7" ry="9" fill={skin} stroke={ink} strokeWidth="3" /><Ellipse cx="225" cy="179" rx="6" ry="8" fill={skin} stroke={ink} strokeWidth="3" />
    <Path d="M157 166 Q157 137 190 136 Q223 137 225 169 L223 187 Q219 211 191 213 Q160 211 158 187Z" fill={skin} stroke={ink} strokeWidth="4" />
    <Path d="M155 175 Q148 168 153 155 Q148 145 161 141 Q160 129 176 134 Q186 123 198 133 Q213 128 219 142 Q230 145 226 160 L224 172 Q216 167 211 155 Q202 165 190 157 Q177 170 165 163 L162 176Z" fill={hair} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
    <Circle cx="176" cy="180" r="11" fill="#E5CCAF" fillOpacity=".22" stroke={ink} strokeWidth="2.5" /><Circle cx="207" cy="180" r="11" fill="#E5CCAF" fillOpacity=".22" stroke={ink} strokeWidth="2.5" /><Path d="M187 179 H196 M165 178 L158 176 M218 178 L224 176" stroke={ink} strokeWidth="2" />
    {celebrating ? <Path d="M172 181 Q176 177 180 181 M203 181 Q207 177 211 181 M183 194 Q192 207 202 194Z" fill={ink} stroke={ink} strokeWidth="2" strokeLinecap="round" /> : <><Circle cx="176" cy="181" r="2.5" fill={ink} /><Circle cx="207" cy="181" r="2.5" fill={ink} /><Path d="M185 196 Q192 201 200 195" fill="none" stroke={ink} strokeWidth="2.5" strokeLinecap="round" /></>}
    <Path d="M191 185 L189 190 H193" fill="none" stroke="#AE7255" strokeWidth="2" strokeLinecap="round" /><Ellipse cx="170" cy="192" rx="6" ry="3" fill="#DBA086" /><Ellipse cx="214" cy="192" rx="6" ry="3" fill="#DBA086" />
   </>}
  </Canvas>
 </Animated.View>;
}

export function DeskCat({ working }: { working: boolean }) {
 const reduced = useReducedMotion(); const nap = useSharedValue(0); const paw = useSharedValue(0);
 useEffect(() => {
  if (reduced) { nap.set(0); paw.set(0); return; }
  nap.set(withRepeat(withSequence(withTiming(1, { duration: 1800, easing: ease }), withTiming(0, { duration: 1800, easing: ease })), -1));
  if (working) paw.set(withRepeat(withSequence(withDelay(5000, withTiming(1, { duration: 700, easing: ease })), withTiming(0, { duration: 700, easing: ease })), -1));
  else paw.set(withTiming(0, { duration: 200 }));
  return () => { cancelAnimation(nap); cancelAnimation(paw); };
 }, [working, reduced, nap, paw]);
 const napStyle = useAnimatedStyle(() => ({ transformOrigin: '27% 57%', transform: [{ scaleY: 1 + nap.get() * .025 }] }));
 const pawStyle = useAnimatedStyle(() => ({ transformOrigin: '30% 56%', transform: [{ rotate: `${-paw.get() * 13}deg` }] }));
 return <View pointerEvents="none" style={layer}>
  <Animated.View style={[layer, napStyle]}><Canvas>
   <Ellipse cx="112" cy="205" rx="27" ry="4" fill="#8E755C" opacity=".18" />
   <Path d="M93 198 Q91 179 116 181 Q138 180 137 198 Q135 207 112 206Z" fill="#EFBA88" stroke={ink} strokeWidth="3" />
   <Path d="M93 198 Q78 207 90 211 Q109 216 119 204" fill="#E4A06B" stroke={ink} strokeWidth="3" strokeLinecap="round" />
   <Path d="M91 185 L89 169 Q90 166 99 176 Q107 172 114 177 L123 169 L123 188 Q123 201 108 202 Q92 202 91 185Z" fill="#EFBA88" stroke={ink} strokeWidth="3" strokeLinejoin="round" />
   <Path d="M94 175 L95 183 L101 179 M118 176 L113 180 L120 183" fill="#D58E77" />
   <Path d="M98 190 Q101 193 104 190 M111 190 Q114 193 117 190 M105 196 Q108 198 111 195" fill="none" stroke={ink} strokeWidth="1.7" strokeLinecap="round" />
   <Path d="M107 177 V182 M114 179 L113 183 M126 186 L124 190" stroke="#CC8B5E" strokeWidth="2.5" strokeLinecap="round" />
   <Path d="M106 193 H110 L108 195Z" fill="#B47C6B" />
  </Canvas></Animated.View>
  <Animated.View style={[layer, pawStyle]}><Canvas><Path d="M123 198 Q135 203 140 198" stroke={ink} strokeWidth="8" fill="none" strokeLinecap="round" /><Path d="M123 198 Q135 203 140 198" stroke="#EFBA88" strokeWidth="5" fill="none" strokeLinecap="round" /></Canvas></Animated.View>
 </View>;
}
