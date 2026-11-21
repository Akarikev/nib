# Approved pose — subtle typing/idle motion, 2026-10-26

The user approved both still renders: “I think they look good now”. The approved geometry is frozen.

Implementation in `src/components/developer.tsx`:

- Working: alternating finger-crease opacity and tiny key-contact marks; two pairs of 120ms contacts followed by a 750ms pause. All shoulders, sleeves, elbows, palms, torso and legs remain fixed in the same SVG.
- Working and idle: an 80ms/120ms eye-line blink after a 4.8-second hold. No idle swinging arm and no body movement that could lift hands off the keys.
- Reduced motion: shared values reset; key marks hidden, both finger creases fully shown, eye line unchanged. No loops start. Cleanup cancels both shared-value animations on state changes and unmount.
- Existing separate standing celebration unchanged. Returning mounts the approved seated geometry; no cross-pose limb interpolation.
- Reanimated animated SVG opacity props run on the UI thread; no per-frame React state, new dependencies or layout animation.

## Evidence and limits

`tap-a.png`, `tap-b.png`, `blink.png`, `idle.png` are direct renders of the actual SVG JSX paths at selected animated opacity values. `typing-contact-preview.gif` is an illustrative stepped source-render preview of the contact cycle, not an actual browser/native recording and not an exact rendering of the continuous easing curve. The room props are fixed for illustration and do not read/write saved gameplay.

Pixel comparison: `idle.png` versus the user-approved `../typing-still/desktop-source-render.png` has **0 changed channels of 956800**. This validates the static geometry/render, not native playback.

Checks: TypeScript PASS, Android Hermes 2.8MB export PASS, web 1.4MB export PASS, git diff --check PASS. Source inspection confirms working/idle effect restart, cancellation on transition/unmount, and static reduced-motion branch. No actual runtime transition or device reduced-motion setting was exercised.

Browser inventory still contains connection-error tabs (one data URL previously rejected by the protocol gate). No bypass or further failed captures attempted. Local server HTML and LAN Expo manifest return HTTP 200. Actual browser/mobile-width runtime playback and physical-phone feel remain unverified. Expo Go: `exp://192.168.12.108:8081`.
