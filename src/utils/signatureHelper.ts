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
    canvas.width = 460;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Clear transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw stylish cursive Thai / English handwritten signature - clean, large, bold, centered, without underline
    ctx.fillStyle = '#172554'; // Deep Navy Blue
    ctx.font = 'italic bold 38px "Brush Script MT", "Segoe Script", "TH Sarabun New", "Sarabun", cursive, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cleanName, canvas.width / 2, canvas.height / 2);

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
