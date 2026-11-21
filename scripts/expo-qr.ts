import QRCode from 'qrcode';
const url = process.argv[2];
if (!url?.startsWith('exp://')) throw new Error('Pass the Expo Go URL printed by Expo CLI: bun run qr exp://YOUR_LAN_IP:8081');
await QRCode.toFile('expo-go-qr.png', url, { width: 512, margin: 3, color: { dark: '#354F47', light: '#F8FAF2' } });
console.log('QR saved to expo-go-qr.png');
