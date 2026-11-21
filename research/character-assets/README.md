# Nib character asset investigation — 2026-10-26

Current direction (later user decision, 2026-10-26): **Keep our own soft-cartoon character. External replacement abandoned.** The findings below are retained as research history.

Original investigation decision: **No candidate qualified for automatic integration.** Keep the current character and room until the user chooses the next tradeoff. No gameplay code, dependencies, saves or runtime assets changed during this investigation.

Requirement: soft cartoon, coherent whole-body frames, seated typing, idle and celebration, free download and clear commercial-game permission. No fake sitting assembled from unrelated walk/run frames, and no anatomical stretching. Pixel room redesign, paid purchases and new rigged/3D runtime remain unapproved.

## Kenney — Toon Characters

- Creator: https://kenney.nl/assets/toon-characters
- Official ZIP: https://kenney.nl/media/pages/assets/toon-characters/4e8a6e4e53-1774770819/kenney_toon-characters.zip
- Downloaded/extracted to `/tmp/nib-asset-audit/kenney/` for inspection.
- ZIP SHA-256: `d4c0eb31f9d9af074315af251a53e8c74925dec84fbd53703c91c9ed4a4cace9`.
- Bundled original license preserved in `kenney-toon/License.txt`: CC0, explicitly permits personal, educational and commercial projects; credit optional. Credit retained: **Kenney / kenney.nl**.
- Inspected all 45 Male Person full-body PNG poses, names and artwork. Review image `kenney-toon/all-45-poses.png` is a labeled contact sheet of the original poses, not new animation.
- Idle and cheer0/cheer1 exist. There is no seated chair/typing animation. Duck, drag and interact do not solve that gap.
- **Reject as a complete drop-in.** Good cartoon starting art only if the user authorizes genuinely new matching seated typing frames, ideally drawn/animated as full-body frames. Do not warp current poses to invent sitting.

## Dev Typer — AI Spritesheet Maker gallery

- Publisher page: https://www.aispritesheetmaker.com/gallery/ceb2c6ca-ad6f-4dd4-b276-1e0439396310
- Public preview inspected and retained in `dev-typer/public-preview.webp`.
- Page states: “Free for personal and commercial use.” This is publisher-stated permission, not a verified license file from the complete archive.
- Page lists six frames, 259×457 cells, 8 FPS, AI-generated. Preview contains six side-facing seated developer/chair images with hands at typing height. Different frames vary hair/face/pose slightly; full resolution, alpha and loop playback were not verified.
- Full sheet/frames/ZIP download requires account sign-up/sign-in. No account created and no download gate bypassed.
- No matching standing celebration/idle set identified on the listing. The preview is research only, not installed into the app.
- **Reject as a verified complete drop-in.** Even account access would not supply the missing celebration based on the published listing.

## RhosGFX — Vector RPG Character Template

- Creator: https://rhosgfx.itch.io/character-template
- Primary listing checked: two characters; four directions; idle, walk/run, sit, crouch, jump, interact, hurt, surprise. Creator explicitly says walking has three frames and essentially everything else one.
- Commercial/noncommercial use and modification allowed; redistribution/resale restricted; commission use has a separate-license restriction. Do not assume that all uses have unrestricted permission.
- **Listing reviewed only; archive and frames NOT downloaded/verified.** Image CDN fetch did not succeed.
- **Reject as a complete animation set:** no listed typing loop or dedicated celebration, mostly single poses, top-down RPG direction rather than this room's camera. Do not call its sit pose animated typing.

## LimeZu — Modern Interiors

- Main listing: https://limezu.itch.io/moderninteriors
- Free-version terms: https://limezu.itch.io/moderninteriors/devlog/244045/free-version-overview-18042021-update
- Creator's free-version overview explicitly limits use to noncommercial purposes. Main listing describes commercial permission for a paid complete version with required credit.
- **Reject free version for a commercial game.** Also pixel art. No archive downloaded or animation coverage claimed.

## Klimmos — Isometric Modular Male Character Kit 2.0

- Creator: https://klimmos.itch.io/cozy-assets-male-isometric-modular-character-kit-version-2
- Primary listing checked 2026-10-26: currently $7.50 on sale, normal $10; pixel art; 64×80 PNG sheets; 8-frame wave/run/type in four isometric directions, chair/table/laptop extras.
- Commercial/noncommercial permission stated, no standalone redistribution/resale; credit appreciated. Creator confirms V1 and V2 are separate. V1 supplies idle/walk/sit; V2 supplies wave/run/type. Do not claim one kit includes all states or a dedicated celebration.
- **Listing only: paid archive not purchased or inspected.** No payment authorized or made.
- Potential fallback only after the user accepts paid pixel art, room/perspective changes and verifies preview/archives. A wave as reward response would also be an explicit behavior decision, not silently labeled celebration.

## Choices requiring user direction

1. Preserve soft-cartoon room: source or create matching full-body typing/idle/celebration frames for a chosen cartoon base. Kenney offers the clearest free base rights, but the missing animations are real art work, not a coding adaptation.
2. Relax complete-character celebration: inspect a single ready-made typing illustration and approve a different reward treatment. This changes requested behavior; not implemented.
3. Choose a pixel-art fallback and budget first, then vet purchased/free archives and plan a consistent room. Klimmos is a relevant paid lead, not a qualified free replacement.

No native export or desktop/phone integration test performed: no asset was integrated and there is no changed runtime to test. Current browser and LAN Expo manifests were rechecked HTTP 200 at end of investigation. Expo Go: `exp://192.168.12.108:8081`.
