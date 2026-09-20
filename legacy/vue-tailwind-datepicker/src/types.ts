import type { Dayjs } from 'dayjs'

export type LengthArray<
  T,
  N extends number,
  R extends T[] = [],
> = number extends N
  ? T[]
  : R['length'] extends N
    ? R
    : LengthArray<T, N, [T, ...R]>

export interface DatePickerDay extends Dayjs {
  today: boolean
  active: boolean
  off: boolean
  sunday: boolean
  disabled: boolean
  inRange: boolean | undefined
  hovered: boolean
  duration: boolean
}
