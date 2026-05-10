const sharp = require('sharp');
const path = require('path');

sharp(path.join(__dirname, 'og-image.svg'))
  .png()
  .toFile(path.join(__dirname, '../public/og-image.png'))
  .then(() => console.log('✓ og-image.png generated at public/og-image.png'))
  .catch(err => console.error('Error:', err));
