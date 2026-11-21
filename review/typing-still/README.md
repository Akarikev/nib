# Seated typing still — review checkpoint, 2026-10-26

`desktop-source-render.png` (520px wide) and `mobile-source-render.png` (319px wide) are **direct SVG source renders, not browser screenshots**.

They were rendered from the actual `SeatedTypingStill` JSX in `src/components/developer.tsx`, the actual room SVG paths from `room.tsx`, and the existing desk-cat paths. Static review configuration: Moonlit room, all furniture, keyboard/monitor, cat present. This configuration does not read or change the user's save. Ambient movement is not included in these static illustrations.

The single still raises the shoulder line, joins shoulders/upper arms/elbows/forearms with closed sleeve silhouettes, and puts both palms at the room's keyboard height (y=200..207 in the shared 400×354 coordinate system). The further hand is foreshortened and partly occluded by the nearer forearm; inspect that relationship during review. The old arm rotation/translation and idle swing do not run in this pose. Idle also holds this neutral still pending review. Existing standing celebration remains separate and unchanged.

Browser capture limitation: existing Codex browser tabs display connection-error documents, one using an internal data URL rejected by the browser security protocol policy. Parent reopened localhost preview; the subsequent tab inventory still showed connection errors, so no bypass or repeated capture attempts were made. Local terminal HTTP checks for localhost and LAN Expo manifest succeed. Physical-phone appearance is also unverified.

**Pending user review before adding limb animation or rebuilding another pose.** Passing TypeScript/exports is not visual approval.
