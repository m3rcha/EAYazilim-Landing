const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');

async function generateFavicons() {
    console.log('Generating favicons from logo-square.svg...');
    try {
        const image = await loadImage('./logo-square.svg');
        
        // 1. apple-touch-icon.png (180x180) - iOS
        const canvas180 = createCanvas(180, 180);
        const ctx180 = canvas180.getContext('2d');
        // Add white background for iOS
        ctx180.fillStyle = '#ffffff';
        ctx180.fillRect(0, 0, 180, 180);
        
        // Draw image centered with some padding (10% padding = 18px)
        const padding = 18;
        const size = 180 - (padding * 2);
        ctx180.drawImage(image, padding, padding, size, size);
        
        const buffer180 = canvas180.toBuffer('image/png');
        fs.writeFileSync('./apple-touch-icon.png', buffer180);
        console.log('Created apple-touch-icon.png (180x180)');

        // 2. favicon-32x32.png
        const canvas32 = createCanvas(32, 32);
        const ctx32 = canvas32.getContext('2d');
        ctx32.drawImage(image, 0, 0, 32, 32);
        
        const buffer32 = canvas32.toBuffer('image/png');
        fs.writeFileSync('./favicon-32x32.png', buffer32);
        console.log('Created favicon-32x32.png (32x32)');

        console.log('All favicons generated successfully.');
    } catch (err) {
        console.error('Error generating favicons:', err.message);
        // Provide a fallback instruction if canvas SVG parsing fails
        if (err.message.includes('format')) {
            console.error('Canvas might not support SVG without librsvg on this OS. As a fallback, we will just use the SVG.');
        }
    }
}

generateFavicons();
