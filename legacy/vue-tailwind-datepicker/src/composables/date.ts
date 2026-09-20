import type { Dayjs } from 'dayjs'
import type { DatePickerDay } from '~/types'

export default function useDate() {
  const usePreviousDate = (date: Dayjs) => {
    const display = []
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const firstDay = date.localeData().firstDayOfWeek()
    for (let i = 0; i <= date.date(0 - firstDay).day(); i++)
      display.push(date.date(0).subtract(i, 'day'))

    return display.sort((a, b) => a.date() - b.date())
  }

  const useCurrentDate = (date: Dayjs) => {
    return Array.from(
      {
        length: date.daysInMonth(),
      },
      (v, k) => date.date(k + 1),
    )
  }

  const useNextDate = (date: Dayjs) => {
    const display = []
    for (
      let i = 1;
      i <= 42 - (usePreviousDate(date).length + date.daysInMonth());
      i++
    )
      display.push(date.date(i).month(date.month()).add(1, 'month'))

    return display
  }

  const useDisableDate = (
    date: Dayjs,
    { disableDate }: { disableDate: boolean | ((date: Date) => boolean) },
  ) => {
    if (typeof disableDate === 'function')
      return disableDate(date.toDate())
    else return false
  }

  const useBetweenRange = (
    date: DatePickerDay,
    { previous, next }: { previous: Dayjs; next: Dayjs },
  ) => {
    const pattern = previous.isAfter(next, 'date') ? '(]' : '[)'

    return !!(date.isBetween(previous, next, 'date', pattern) && !date.off)
  }

  const useToValueFromString = (
    date: Dayjs,
    { formatter }: { formatter: { date: string; month: string } },
  ) => {
    return date.format(formatter.date)
  }

  const useToValueFromArray = (
    { previous, next }: { previous: Dayjs; next: Dayjs },
    {
      formatter,
      separator,
    }: { formatter: { date: string; month: string }; separator: string },
  ) => {
    return `${previous.format(formatter.date)}${separator}${next.format(
      formatter.date,
    )}`
  }
  return {
    usePreviousDate,
    useCurrentDate,
    useNextDate,
    useDisableDate,
    useBetweenRange,
    useToValueFromString,
    useToValueFromArray,
  }
}
