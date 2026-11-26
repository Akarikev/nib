import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = join(process.cwd(), 'assets', 'sounds');
mkdirSync(OUT_DIR, { recursive: true });

function writeWav(filename: string, samples: Float32Array, sampleRate = 22050) {
 const numSamples = samples.length;
 const buffer = new ArrayBuffer(44 + numSamples * 2);
 const view = new DataView(buffer);

 const writeStr = (offset: number, s: string) => {
  for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
 };

 writeStr(0, 'RIFF');
 view.setUint32(4, 36 + numSamples * 2, true);
 writeStr(8, 'WAVE');
 writeStr(12, 'fmt ');
 view.setUint32(16, 16, true); // PCM
 view.setUint16(20, 1, true); // PCM format
 view.setUint16(22, 1, true); // mono
 view.setUint32(24, sampleRate, true);
 view.setUint32(28, sampleRate * 2, true);
 view.setUint16(32, 2, true);
 view.setUint16(34, 16, true);
 writeStr(36, 'data');
 view.setUint32(40, numSamples * 2, true);

 for (let i = 0; i < numSamples; i++) {
  const clamped = Math.max(-1, Math.min(1, samples[i]));
  view.setInt16(44 + i * 2, Math.round(clamped * 32767), true);
 }

 const path = join(OUT_DIR, filename);
 writeFileSync(path, Buffer.from(buffer));
 console.log(`Generated ${filename} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
}

// 1. Soft warm rain loop (2.4s seamless pink-ish filtered noise + tiny droplet pops)
{
 const sr = 16000;
 const dur = 2.4;
 const n = Math.floor(sr * dur);
 const raw = new Float32Array(n);
 let b0 = 0, b1 = 0, b2 = 0;
 let seed = 4219;
 const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
 };
 for (let i = 0; i < n; i++) {
  const white = rand();
  b0 = 0.99 * b0 + white * 0.06;
  b1 = 0.95 * b1 + white * 0.08;
  b2 = 0.78 * b2 + white * 0.12;
  let sample = (b0 + b1 + b2) * 0.24;
  // Occasional soft raindrop tap
  if (i % 1900 === 400 || i % 2750 === 900) {
   sample += 0.08;
  }
  raw[i] = sample;
 }
 // Crossfade ends for a completely seamless loop
 const fade = Math.floor(sr * 0.18);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  if (i < fade) {
   const t = i / fade;
   out[i] = raw[i] * t + raw[n - fade + i] * (1 - t);
  } else {
   out[i] = raw[i];
  }
 }
 writeWav('rain-loop.wav', out, sr);
}

// 2. Crisp natural mechanical keyboard click (16ms — light tactile switch snap, zero drum thump)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.016);
 const out = new Float32Array(n);
 let seed = 1337;
 const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
 };
 let prev = 0;
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  // High-pass filtered crisp plastic switch snap (removes low drum boom)
  const w = rand();
  const hp = w - prev * 0.82;
  prev = w;
  const env = Math.exp(-t * 360);
  const ping = Math.sin(2 * Math.PI * 2650 * t) * Math.exp(-t * 480) * 0.25;
  out[i] = (hp * 0.45 + ping) * env * 0.65;
 }
 writeWav('key-click.wav', out, sr);
}

// 3. Warm two-note coin chime (C6 -> E6 marimba/bell)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.34);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const note1 = t < 0.22 ? (Math.sin(2 * Math.PI * 1046.5 * t) * 0.65 + Math.sin(2 * Math.PI * 2093 * t) * 0.18) * Math.exp(-t * 14) : 0;
  const t2 = t - 0.085;
  const note2 = t2 >= 0 ? (Math.sin(2 * Math.PI * 1318.5 * t2) * 0.72 + Math.sin(2 * Math.PI * 2637 * t2) * 0.15) * Math.exp(-t2 * 11) : 0;
  out[i] = (note1 + note2) * 0.45;
 }
 writeWav('coin-chime.wav', out, sr);
}

// 4. Cheerful bug-fix pop (G5 -> C6)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.22);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const freq = t < 0.07 ? 784 : 1046.5;
  const localT = t < 0.07 ? t : t - 0.07;
  const env = Math.exp(-localT * 18);
  out[i] = (Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(2 * Math.PI * freq * 2 * t) * 0.15) * env * 0.45;
 }
 writeWav('bug-fix.wav', out, sr);
}

// 5. Gentle cozy cat purr (650ms warm low purr)
{
 const sr = 16000;
 const n = Math.floor(sr * 0.65);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const fade = Math.sin(Math.PI * Math.min(1, t / 0.65));
  const rumble = Math.sin(2 * Math.PI * 26 * t) * 0.5 + 0.5;
  const carrier = Math.sin(2 * Math.PI * 115 * t) * 0.55 + Math.sin(2 * Math.PI * 172 * t) * 0.25;
  out[i] = carrier * rumble * fade * 0.45;
 }
 writeWav('cat-purr.wav', out, sr);
}

// 6. Crisp warm woody UI tap (42ms — audible and tactile)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.042);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const env = Math.exp(-t * 95);
  const body = Math.sin(2 * Math.PI * (520 - t * 3400) * t) * 0.65;
  const click = Math.sin(2 * Math.PI * 1450 * t) * Math.exp(-t * 240) * 0.35;
  out[i] = (body + click) * env * 0.72;
 }
 writeWav('ui-tap.wav', out, sr);
}

// 7. Gentle email notification ding (260ms warm soft two-tone)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.28);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const n1 = Math.sin(2 * Math.PI * 880 * t) * Math.exp(-t * 16) * 0.5;
  const t2 = t - 0.065;
  const n2 = t2 >= 0 ? Math.sin(2 * Math.PI * 1174.66 * t2) * Math.exp(-t2 * 13) * 0.55 : 0;
  out[i] = (n1 + n2) * 0.55;
 }
 writeWav('mail-ding.wav', out, sr);
}

// 8. Warm purchase chime (340ms ascending cozy triad C5 -> E5 -> G5)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.36);
 const out = new Float32Array(n);
 const notes = [
  { f: 523.25, start: 0 },
  { f: 659.25, start: 0.065 },
  { f: 783.99, start: 0.13 },
 ];
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  let s = 0;
  for (const nt of notes) {
   const lt = t - nt.start;
   if (lt >= 0) {
    s += (Math.sin(2 * Math.PI * nt.f * lt) * 0.7 + Math.sin(2 * Math.PI * nt.f * 2 * lt) * 0.15) * Math.exp(-lt * 11);
   }
  }
  out[i] = s * 0.36;
 }
 writeWav('buy-chime.wav', out, sr);
}

// 9. Cozy 75 BPM Lo-Fi Rhodes + soft beat loop (6.4s seamless 2-bar chord progression)
{
 const sr = 16000;
 const bpm = 75;
 const beatSec = 60 / bpm; // 0.8s per beat
 const bars = 2;
 const totalBeats = bars * 4; // 8 beats = 6.4s
 const dur = totalBeats * beatSec;
 const n = Math.floor(sr * dur);
 const raw = new Float32Array(n);

 // Warm Rhodes chords (Fmaj7 -> Em7 -> Dm7 -> Cmaj7), 2 beats each
 const chords = [
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [164.81, 196.0, 246.94, 293.66], // Em7
  [146.83, 174.61, 220.0, 261.63], // Dm7
  [130.81, 164.81, 196.0, 246.94], // Cmaj7
 ];

 let seed = 9001;
 const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
 };
 let vinyl = 0;

 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const beatPos = t / beatSec; // 0..8
  const chordIdx = Math.min(3, Math.floor(beatPos / 2));
  const chordLocalT = (beatPos - chordIdx * 2) * beatSec;

  // Rhodes electric piano warm pad with gentle attack & decay
  const chordEnv = Math.min(1, chordLocalT / 0.04) * Math.exp(-chordLocalT * 1.15);
  let pad = 0;
  for (const f of chords[chordIdx]!) {
   pad += Math.sin(2 * Math.PI * f * t) * 0.14 + Math.sin(2 * Math.PI * f * 2 * t) * 0.025;
  }
  pad *= chordEnv;

  // Soft lo-fi kick on beats 0, 2.5, 4, 6.5
  let drum = 0;
  for (const kb of [0, 2.5, 4, 6.5]) {
   const dt = t - kb * beatSec;
   if (dt >= 0 && dt < 0.14) {
    drum += Math.sin(2 * Math.PI * (92 * Math.exp(-dt * 24) + 38) * dt) * Math.exp(-dt * 26) * 0.24;
   }
  }
  // Soft brushed snare on beats 1, 3, 5, 7
  for (const sb of [1, 3, 5, 7]) {
   const dt = t - sb * beatSec;
   if (dt >= 0 && dt < 0.09) {
    drum += rand() * Math.exp(-dt * 42) * 0.09;
   }
  }
  // Subtle hi-hat ticks on every half beat
  const halfPhase = (beatPos * 2) % 1;
  const ht = (halfPhase * beatSec) / 2;
  if (ht < 0.025) {
   drum += rand() * Math.exp(-ht * 140) * 0.032;
  }

  // Ultra-soft vinyl warmth
  vinyl = vinyl * 0.85 + rand() * 0.15;
  raw[i] = Math.tanh((pad + drum + vinyl * 0.008) * 1.1) * 0.55;
 }

 // Seamless crossfade
 const fade = Math.floor(sr * 0.08);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  if (i < fade) {
   const mix = i / fade;
   out[i] = raw[i] * mix + raw[n - fade + i] * (1 - mix);
  } else {
   out[i] = raw[i];
  }
 }
 writeWav('lofi-loop.wav', out, sr);
}

// 10. Joyful project-complete victory fanfare (580ms warm C5-E5-G5-C6 arpeggio)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.6);
 const out = new Float32Array(n);
 const notes = [
  { f: 523.25, start: 0 },
  { f: 659.25, start: 0.085 },
  { f: 783.99, start: 0.17 },
  { f: 1046.5, start: 0.255 },
 ];
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  let s = 0;
  for (const nt of notes) {
   const lt = t - nt.start;
   if (lt >= 0) {
    s += (Math.sin(2 * Math.PI * nt.f * lt) * 0.65 + Math.sin(2 * Math.PI * nt.f * 2 * lt) * 0.18) * Math.exp(-lt * 7.5);
   }
  }
  out[i] = Math.tanh(s * 0.45) * 0.85;
 }
 writeWav('victory-fanfare.wav', out, sr);
}

// 11. Cozy smartphone ringtone chime (420ms gentle marimba trill)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.44);
 const out = new Float32Array(n);
 const notes = [
  { f: 698.46, start: 0 },
  { f: 880.0, start: 0.09 },
  { f: 1046.5, start: 0.18 },
 ];
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  let s = 0;
  for (const nt of notes) {
   const lt = t - nt.start;
   if (lt >= 0) {
    s += Math.sin(2 * Math.PI * nt.f * lt) * Math.exp(-lt * 10) * 0.5;
   }
  }
  out[i] = s * 0.65;
 }
 writeWav('phone-ring.wav', out, sr);
}

// 12. Very soft, distant warm morning songbirds (6.0s gentle background ambiance)
{
 const sr = 16000;
 const dur = 6.0;
 const n = Math.floor(sr * dur);
 const out = new Float32Array(n);
 const chirps = [
  { start: 0.7, len: 0.13, f0: 1850, f1: 2350, amp: 0.08 },
  { start: 0.92, len: 0.11, f0: 2050, f1: 2450, amp: 0.07 },
  { start: 2.8, len: 0.16, f0: 2200, f1: 1750, amp: 0.065 },
  { start: 4.5, len: 0.14, f0: 1950, f1: 2400, amp: 0.075 },
  { start: 4.72, len: 0.12, f0: 2150, f1: 1850, amp: 0.06 },
 ];
 for (const c of chirps) {
  const sIdx = Math.floor(c.start * sr);
  const lenSamples = Math.floor(c.len * sr);
  for (let j = 0; j < lenSamples && sIdx + j < n; j++) {
   const u = j / lenSamples;
   const env = Math.pow(Math.sin(Math.PI * u), 2.2);
   const freq = c.f0 + (c.f1 - c.f0) * u;
   const t = j / sr;
   out[sIdx + j] += Math.sin(2 * Math.PI * freq * t) * env * c.amp;
  }
 }
 writeWav('birds-loop.wav', out, sr);
}

// 13. Soft distant city traffic / cars passing by loop (5.2s seamless for city homes: NY, SF, Tokyo)
{
 const sr = 16000;
 const dur = 5.2;
 const n = Math.floor(sr * dur);
 const raw = new Float32Array(n);
 let seed = 7711;
 const rand = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed / 2147483647) * 2 - 1;
 };
 let lp1 = 0, lp2 = 0;
 // Two soft passing car whooshes peaking at 1.4s and 3.8s
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const w = rand();
  lp1 = lp1 * 0.94 + w * 0.06;
  lp2 = lp2 * 0.88 + lp1 * 0.12;
  const car1 = Math.exp(-Math.pow((t - 1.4) / 0.55, 2));
  const car2 = Math.exp(-Math.pow((t - 3.85) / 0.65, 2));
  const hum = Math.sin(2 * Math.PI * (78 - car1 * 12) * t) * car1 * 0.06 + Math.sin(2 * Math.PI * (68 - car2 * 10) * t) * car2 * 0.05;
  raw[i] = lp2 * (0.14 + car1 * 0.42 + car2 * 0.36) + hum;
 }
 const fade = Math.floor(sr * 0.2);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  if (i < fade) {
   const m = i / fade;
   out[i] = raw[i] * m + raw[n - fade + i] * (1 - m);
  } else {
   out[i] = raw[i];
  }
 }
 writeWav('city-loop.wav', out, sr);
}

// 14. Playful double-beep garage horn (280ms friendly cozy horn)
{
 const sr = 22050;
 const n = Math.floor(sr * 0.32);
 const out = new Float32Array(n);
 for (let i = 0; i < n; i++) {
  const t = i / sr;
  const inBeep1 = t >= 0 && t < 0.1;
  const inBeep2 = t >= 0.15 && t < 0.27;
  if (inBeep1 || inBeep2) {
   const lt = inBeep1 ? t : t - 0.15;
   const dur = inBeep1 ? 0.1 : 0.12;
   const env = Math.sin(Math.PI * (lt / dur));
   const tone = Math.sin(2 * Math.PI * 440 * t) * 0.5 + Math.sin(2 * Math.PI * 554.37 * t) * 0.4;
   out[i] = Math.tanh(tone * 1.2) * env * 0.42;
  }
 }
 writeWav('horn-beep.wav', out, sr);
}
