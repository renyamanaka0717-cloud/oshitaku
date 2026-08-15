import holidayJp from '@holiday-jp/holiday_jp';

// Wraps @holiday-jp/holiday_jp (offline, precomputed Japanese public
// holiday table) so the rest of the app never imports it directly.
export function isJapaneseHoliday(date: Date): boolean {
  return holidayJp.isHoliday(date);
}
