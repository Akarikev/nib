# Nib

A tiny offline developer game. Pick a project, let your little developer code, collect coins, and build a cozy studio. Android first, with a browser preview.

## Play locally

```sh
cd /home/elorm/Desktop/projects/nib
bun install
bun run start
```

Scan the QR code with the SDK 57-compatible Expo Go Android app. For a browser preview run `bun run web`. `bun run android` opens an available Android emulator/device through Expo Go. No cloud build or account is needed for local development.

The live LAN URL is printed by Expo CLI. Keep the phone and computer on the same Wi-Fi. To generate a shareable QR from that URL: `bun run qr exp://YOUR_LAN_IP:8081`. After adding animation dependencies, restart Metro with `bunx expo start --lan --clear` and reload Expo Go; hot reload alone cannot rebuild Babel plugin configuration.

## Checks

```sh
bun run typecheck
bun run test
bunx expo install --check
bun run export
```

Exports land in `dist/` (Android Hermes bundle plus web assets). This is not an installable APK. Android APK building needs a local Android SDK/JDK toolchain; no paid cloud build has been requested or started.

## First session

Start **Hello, world** (15 seconds). Close/reopen the app, then collect 20 coins. Repeat or choose a longer project. The keyboard costs 60 coins and increases future project rewards by 25%; the monitor adds another 50%. Tap **Upgrades** below the room to open the shop. Purchased decorations can be placed or put away there. Sunny, Rainy, and Moonlit room moods are free and saved locally. Projects already running keep their original quoted reward.

All fonts and illustration assets ship with the app. Saves are local to this installation/browser origin. No network, background worker, notification permission, or account is used for gameplay. Progress uses the device clock; changing it can advance a project. Uninstalling or clearing app/browser data loses the save. An unreadable save is retained, with a retry screen, rather than silently reset.

## Where to work

- `src/game/game.ts`: catalog, pricing, progress, rewards, and save validation.
- `src/components/room.tsx`: original SVG room and furniture; developer.tsx contains the seated human and adoptable cat, furniture states, reduced-motion-aware animation.
- `App.tsx`: playable screen and serialized persistence actions.
- `src/components/ui.tsx`, `toast.tsx`, `shop.tsx`: rounded Lucide SVG icons, warm coin-style top notifications, and animated upgrades sheet.
- `src/config.json`: app display name shared with Expo config.
- `AGENTS.md` and `continual-learning.json`: durable instructions and latest development checkpoint.

The current version has four projects, two equipment upgrades, and three decorations. It has no store release configuration or publishing workflow. Google Play testing/review requirements still apply to any future release; acceptance is not guaranteed.

Polish verification: 14 Bun tests, TypeScript, Android/web exports, and mobile-width browser tests for purchases, badges, toast dismissal, persisted furniture/moods, and working/idle poses. Expo Go phone connection was confirmed by the user; final native spacing and motion feel still need device confirmation.

Adopt a desk cat for 100 earned coins in Upgrades. Energy holds up to 3 charges and refills one every 30 minutes, including offline time. Spend one charge once per running project to remove 25% of its remaining time without changing the reward. Existing saves remain compatible.
