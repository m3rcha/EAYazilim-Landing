const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const width = 1200;
const height = 630;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background gradient (koyu lacivert → koyu gri)
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#0f172a');
gradient.addColorStop(0.5, '#1e293b');
gradient.addColorStop(1, '#0f172a');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Subtle grid pattern (arkaplan detayı)
ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
ctx.lineWidth = 1;
for (let i = 0; i < width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
}
for (let i = 0; i < height; i += 40) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
}

// Sol üst köşe mavi accent (subtle glow)
const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
ctx.fillStyle = glowGradient;
ctx.fillRect(0, 0, 400, 300);

// Sağ alt köşe mavi accent
const glowGradient2 = ctx.createRadialGradient(width, height, 0, width, height, 400);
glowGradient2.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
glowGradient2.addColorStop(1, 'rgba(59, 130, 246, 0)');
ctx.fillStyle = glowGradient2;
ctx.fillRect(width - 400, height - 300, 400, 300);

// Ortada dikey ayırıcı çizgi (sol tarafta)
const centerX = 100;
ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(centerX, 180);
ctx.lineTo(centerX, 450);
ctx.stroke();

// "EA YAZILIM" başlığı (büyük, beyaz, bold)
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 72px Arial, Helvetica, sans-serif';
ctx.textAlign = 'left';
ctx.textBaseline = 'middle';

// EA ve YAZILIM arasında renk farkı
ctx.fillStyle = '#ffffff';
ctx.fillText('EA', centerX + 40, 280);

ctx.fillStyle = '#94a3b8';
ctx.fillText('YAZILIM', centerX + 130, 280);

// Slogan
ctx.fillStyle = '#cbd5e1';
ctx.font = '300 26px Arial, Helvetica, sans-serif';
ctx.fillText('Profesyonel Web Tasarım ve Dijital Çözümler', centerX + 40, 340);

// Alt çizgi (mavi accent)
const lineY = 380;
const lineWidth = 80;
const lineGradient = ctx.createLinearGradient(centerX + 40, 0, centerX + 40 + lineWidth, 0);
lineGradient.addColorStop(0, '#3b82f6');
lineGradient.addColorStop(1, '#2563eb');
ctx.fillStyle = lineGradient;
ctx.fillRect(centerX + 40, lineY, lineWidth, 3);

// Alt bilgi (sağ alt köşe)
ctx.fillStyle = '#64748b';
ctx.font = '20px Arial, Helvetica, sans-serif';
ctx.textAlign = 'right';
ctx.fillText('eayazilim.tr', width - 60, height - 50);

// Sağ alt köşe küçük mavi nokta
ctx.fillStyle = '#3b82f6';
ctx.beginPath();
ctx.arc(width - 60, height - 30, 4, 0, Math.PI * 2);
ctx.fill();

// Sol alt köşe - iletişim bilgisi
ctx.fillStyle = '#64748b';
ctx.font = '18px Arial, Helvetica, sans-serif';
ctx.textAlign = 'left';
ctx.fillText('+90 541 554 75 47', 60, height - 50);

// Save
const outputPath = path.join(__dirname, 'og-image.png');
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(outputPath, buffer);

console.log(`OG image saved to: ${outputPath}`);
console.log(`Dimensions: ${width}x${height}`);
console.log(`File size: ${(buffer.length / 1024).toFixed(1)} KB`);
