const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

export function formatThaiDate(dateInput: string | Date | undefined, isShort = false): string {
  if (!dateInput) return '-';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = d.getDate();
  const monthIdx = d.getMonth();
  const yearBe = d.getFullYear() + 543;
  const monthStr = isShort ? THAI_MONTHS_SHORT[monthIdx] : THAI_MONTHS[monthIdx];
  return `${day} ${monthStr} ${yearBe}`;
}

export function getCurrentThaiDateParts(): { day: number; month: string; yearBe: number; fullStr: string } {
  const d = new Date();
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const yearBe = d.getFullYear() + 543;
  return {
    day,
    month,
    yearBe,
    fullStr: `${day} ${month} พ.ศ. ${yearBe}`,
  };
}

export function calculateDaysBetween(startDateStr?: string, endDateStr?: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}
