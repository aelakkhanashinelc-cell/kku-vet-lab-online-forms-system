/**
 * Digital Signature Helper
 * Generates official electronic signatures with cursive script and KKU e-Signature verification badge
 */

export function generateElectronicSignatureDataUrl(
  name: string,
  roleTitle = 'ผู้ลงนาม',
  dateStr = ''
): string {
  if (typeof document === 'undefined') return '';

  const cleanName = (name || '').trim();
  if (!cleanName || cleanName === '-' || cleanName.startsWith('.')) return '';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 110;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw stylish organic cursive signature line (representing electronic pen stroke)
    ctx.strokeStyle = '#1e3a8a'; // Deep Navy Blue
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    // Signature flourish curve under/around the name
    ctx.moveTo(35, 55);
    ctx.bezierCurveTo(70, 20, 140, 65, 200, 35);
    ctx.bezierCurveTo(240, 15, 280, 50, 345, 40);
    ctx.stroke();

    // 2. Draw cursive Thai / English handwritten text
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic bold 26px "Brush Script MT", "TH Sarabun New", "Sarabun", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cleanName, 190, 42);

    // Decorative underline loop
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.moveTo(60, 60);
    ctx.quadraticCurveTo(190, 72, 320, 58);
    ctx.stroke();

    // 3. Official Digital Seal Badge
    // Badge pill box
    const badgeX = 55;
    const badgeY = 74;
    const badgeW = 270;
    const badgeH = 26;
    const radius = 6;

    ctx.fillStyle = 'rgba(238, 242, 255, 0.95)'; // Indigo-50
    ctx.strokeStyle = '#818cf8'; // Indigo-400
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(badgeX, badgeY, badgeW, badgeH, radius) : ctx.rect(badgeX, badgeY, badgeW, badgeH);
    ctx.fill();
    ctx.stroke();

    // Checkmark icon & Certified text
    ctx.fillStyle = '#4338ca'; // Indigo-700
    ctx.font = 'bold 10.5px "Sarabun", -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const sealText = `✓ ลงนามดิจิทัล • KKU e-Signature • ${dateStr || new Date().toLocaleDateString('th-TH')}`;
    ctx.fillText(sealText, 190, badgeY + badgeH / 2);

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate electronic signature dataUrl', err);
    return '';
  }
}
