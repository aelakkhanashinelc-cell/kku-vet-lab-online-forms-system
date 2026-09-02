/**
 * Signature Helper
 * Generates clean handwritten cursive signature from typed text
 * Strictly renders only the user's handwritten name without any digital stamps or badges
 */

export function generateTypedSignatureDataUrl(name: string): string {
  if (typeof document === 'undefined') return '';

  const cleanName = (name || '').trim();
  if (!cleanName || cleanName === '-' || cleanName.startsWith('.')) return '';

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 380;
    canvas.height = 90;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw stylish cursive Thai / English handwritten signature
    ctx.fillStyle = '#1e3a8a'; // Deep Navy Blue
    ctx.font = 'italic bold 28px "Brush Script MT", "Segoe Script", "TH Sarabun New", "Sarabun", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cleanName, 190, 40);

    // 2. Natural organic signature pen stroke underline
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(30, 58, 138, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.moveTo(55, 58);
    ctx.quadraticCurveTo(190, 68, 325, 56);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate typed signature dataUrl', err);
    return '';
  }
}

// Alias for backwards compatibility, strictly returns clean typed signature without badges
export function generateElectronicSignatureDataUrl(
  name: string,
  _roleTitle = '',
  _dateStr = ''
): string {
  return generateTypedSignatureDataUrl(name);
}
