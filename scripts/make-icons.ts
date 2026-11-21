import sharp from 'sharp';
await sharp('assets/cat-icon.svg').png().toFile('assets/icon.png');
await sharp('assets/cat-icon.svg').resize(192, 192).png().toFile('assets/favicon.png');
