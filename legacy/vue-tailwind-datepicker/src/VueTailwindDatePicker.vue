<script setup lang="ts">
import {
  Popover,
  PopoverButton,
  PopoverOverlay,
  PopoverPanel,
} from '@headlessui/vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isToday from 'dayjs/plugin/isToday'
import isBetween from 'dayjs/plugin/isBetween'
import duration from 'dayjs/plugin/duration'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import type { Ref } from 'vue'
import {
  computed,
  isProxy,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch,
  provide,
  reactive,
  ref,
  unref,
  watch,
  watchEffect,
} from 'vue'
import { localesMap } from './utils'
import VtdHeader from './components/Header.vue'
import VtdShortcut from './components/Shortcut.vue'
import VtdCalendar from './components/Calendar.vue'
import VtdYear from './components/Year.vue'
import VtdWeek from './components/Week.vue'
import VtdMonth from './components/Month.vue'
import useDate from './composables/date'
import useDom from './composables/dom'
import type { DatePickerDay } from './types'
import {
  atMouseOverKey,
  betweenRangeClassesKey,
  datepickerClassesKey,
  isBetweenRangeKey,
  setToCustomShortcutKey,
  setToLastDayKey,
  setToLastMonthKey,
  setToThisMonthKey,
  setToTodayKey,
  setToYesterdayKey,
} from './keys'

export interface Props {
  noInput?: boolean
  overlay?: boolean
  /**
   * Controls how the datepicker resolves its dark/light appearance.
   * - 'auto' (default): follows the nearest ancestor `.dark` class, same
   *   as the consumer's own Tailwind dark-mode toggle.
   * - 'light' / 'dark': forces the appearance regardless of any ancestor
   *   `.dark` class or the OS `prefers-color-scheme`.
   */
  colorMode?: 'auto' | 'light' | 'dark'
  asSingle?: boolean
  useRange?: boolean
  placeholder?: string
  i18n?: string
  inputClasses?: string
  disabled?: boolean
  disableInRange?: boolean
  disableDate?: boolean | ((date: Date) => boolean)
  autoApply?: boolean
  shortcuts?: boolean | (() => { label: string; atClick: () => Date[] }[])
  separator?: string
  formatter?: {
    date: string
    month: string
  }
  startFrom?: Date
  weekdaysSize?: string
  weekNumber?: boolean
  options?: {
    shortcuts: {
      today: string
      yesterday: string
      past: (period: number) => string
      currentMonth: string
      pastMonth: string
    }
    footer: {
      apply: string
      cancel: string
    }
  }
  modelValue:
  | Array<Date | string | Dayjs>
  | { start: Date | string; end: Date | string }
  | {
    startDate: Date | string
    endDate: Date | string
  }
  | string
}

const props = withDefaults(defineProps<Props>(), {
  colorMode: 'auto',
  placeholder: '',
  i18n: 'en',
  inputClasses: '',
  disabled: false,
  disableInRange: false,
  disableDate: false,
  autoApply: true,
  shortcuts: true,
  separator: ' ~ ',
  formatter: () => ({
    date: 'YYYY-MM-DD HH:mm:ss',
    month: 'MMM',
  }),
  startFrom: () => new Date(),
  weekdaysSize: 'short',
  weekNumber: false,
  options: () => ({
    shortcuts: {
      today: 'Today',
      yesterday: 'Yesterday',
      past: period => `Last ${period} Days`,
      currentMonth: 'This Month',
      pastMonth: 'Last Month',
    },
    footer: {
      apply: 'Apply',
      cancel: 'Cancel',
    },
  }),
  modelValue: () => [new Date(), new Date()],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Array<string> | Array<Dayjs> | string | Record<string, string>): void;
  (e: 'selectMonth', value: Dayjs): void;
  (e: 'selectYear', value: Dayjs): void;
  (e: 'selectRightMonth', value: Dayjs): void;
  (e: 'selectRightYear', value: Dayjs): void;
  (e: 'clickPrev', value: Dayjs): void;
  (e: 'clickNext', value: Dayjs): void;
  (e: 'clickRightPrev', value: Dayjs): void;
  (e: 'clickRightNext', value: Dayjs): void;
}>()

const {
  useCurrentDate,
  useDisableDate,
  useBetweenRange,
  useNextDate,
  usePreviousDate,
  useToValueFromArray,
  useToValueFromString,
} = useDate()

const { useVisibleViewport } = useDom()

dayjs.extend(localeData)
dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(isToday)
dayjs.extend(isBetween)
dayjs.extend(duration)
dayjs.extend(weekOfYear)

const VtdRef = ref(null)
const VtdInputRef = ref<HTMLInputElement | null>(null)
const VtdRootRef = ref<HTMLElement | { $el: HTMLElement } | null>(null)

// Template refs resolve to a raw HTMLElement for plain tags (the noInput
// branch) but to a component instance (with `.$el`) for the <Popover>
// wrapper - normalize both to the actual DOM node.
const getRootEl = (): HTMLElement | null => {
  const root = VtdRootRef.value
  if (!root) return null
  return '$el' in root ? root.$el : root
}

// colorMode resolution: 'light'/'dark' force the appearance; 'auto' tracks
// the nearest ancestor `.dark` class (mirrors the consumer's own Tailwind
// dark-mode toggle instead of Tailwind v4's default prefers-color-scheme
// media variant, which ignores any class-based toggle entirely).
const ancestorIsDark = ref(false)
const systemPrefersDark = ref(false)
const colorModeObservers: MutationObserver[] = []
let colorSchemeMedia: MediaQueryList | null = null

const updateSystemPrefersDark = () => {
  if (typeof window === 'undefined' || !window.matchMedia)
    return

  systemPrefersDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

const updateAncestorIsDark = () => {
  ancestorIsDark.value = !!getRootEl()?.closest('.dark')
}

const isDark = computed(() => {
  if (props.colorMode === 'light') return false
  if (props.colorMode === 'dark') return true
  return ancestorIsDark.value || systemPrefersDark.value
})

onMounted(() => {
  updateSystemPrefersDark()
  updateAncestorIsDark()

  if (window.matchMedia) {
    colorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
    colorSchemeMedia.addEventListener('change', updateSystemPrefersDark)
  }

  // Watch every ancestor's class attribute: .dark can be toggled anywhere
  // up the tree, not just on <html>/<body>.
  let el: HTMLElement | null = getRootEl()?.parentElement ?? null
  while (el) {
    const observer = new MutationObserver(updateAncestorIsDark)
    observer.observe(el, { attributes: true, attributeFilter: ['class'] })
    colorModeObservers.push(observer)
    el = el.parentElement
  }
})

onBeforeUnmount(() => {
  if (colorSchemeMedia) {
    colorSchemeMedia.removeEventListener('change', updateSystemPrefersDark)
    colorSchemeMedia = null
  }

  colorModeObservers.forEach(observer => observer.disconnect())
  colorModeObservers.length = 0
})
const placement = ref<boolean | null>(null)
const givenPlaceholder = ref('')
const selection = ref<Dayjs | null>(null)
const pickerValue = ref('')
const hoverValue = ref<Dayjs[]>([])
const applyValue = ref<Dayjs[]>([])
const previous = ref<Dayjs | null>(null)
const next = ref<Dayjs | null>(null)
const panel = reactive({
  previous: {
    calendar: true,
    month: false,
    year: false,
  },
  next: {
    calendar: true,
    month: false,
    year: false,
  },
})
const datepicker = ref({
  previous: dayjs(),
  next: dayjs().add(1, 'month'),
  year: {
    previous: dayjs().year(),
    next: dayjs().year(),
  },
  weeks:
    props.weekdaysSize === 'min' ? dayjs.weekdaysMin() : dayjs.weekdaysShort(),
  months:
    props.formatter.month === 'MMM' ? dayjs.monthsShort() : dayjs.months(),
})
const weeks = computed(() => datepicker.value.weeks)
const months = computed(() => datepicker.value.months)
const calendar = computed(() => {
  const { previous, next, year } = unref(datepicker)
  return {
    previous: {
      date: () => {
        return usePreviousDate(previous)
          .concat(useCurrentDate(previous))
          .concat(useNextDate(previous))
          .map((v) => {
            Object.assign(v, {
              today: v.isToday(),
              active: previous.month() === v.month(),
              off: previous.month() !== v.month(),
              sunday: v.day() === 0,
              disabled: useDisableDate(v, props) && !inRangeDate(v),
              inRange: () => {
                if (props.asSingle && !props.useRange)
                  return previous.month() !== v.month()
              },
              hovered: () => {
                if (!asRange())
                  return false
                if (hoverValue.value.length > 1) {
                  return (
                    (v.isBetween(
                      hoverValue.value[0],
                      hoverValue.value[1],
                      'date',
                      '()',
                    )
                      || v.isBetween(
                        hoverValue.value[1],
                        hoverValue.value[0],
                        'date',
                        '(]',
                      ))
                    && previous.month() === v.month()
                  )
                }
                return false
              },
              duration: () => {
                return false
              },
            })

            return v as DatePickerDay
          })
      },
      month: previous && previous.format(props.formatter.month),
      year: previous && previous.year(),
      years: () => {
        return Array.from(
          {
            length: 12,
          },
          (v, k) => year.previous + k,
        )
      },
      onPrevious: () => {
        datepicker.value.previous = previous.subtract(1, 'month')
        emit('clickPrev', datepicker.value.previous)
      },
      onNext: () => {
        datepicker.value.previous = previous.add(1, 'month')
        if (previous.diff(next, 'month') === -1)
          datepicker.value.next = next.add(1, 'month')

        emit('clickNext', datepicker.value.previous)
      },
      onPreviousYear: () => {
        datepicker.value.year.previous = datepicker.value.year.previous - 12
      },
      onNextYear: () => {
        datepicker.value.year.previous = datepicker.value.year.previous + 12
      },
      openMonth: () => {
        panel.previous.month = !panel.previous.month
        panel.previous.year = false
        panel.previous.calendar = !panel.previous.month
      },
      setMonth: ($event: number) => {
        datepicker.value.previous = previous.month($event)
        panel.previous.month = !panel.previous.month
        panel.previous.year = false
        panel.previous.calendar = !panel.previous.month
        emit('selectMonth', datepicker.value.previous)
        nextTick(() => {
          if (
            datepicker.value.next.isSame(datepicker.value.previous, 'month')
            || datepicker.value.next.isBefore(datepicker.value.previous)
          )
            datepicker.value.next = datepicker.value.previous.add(1, 'month')

          datepicker.value.year.next = datepicker.value.next.year()
        })
      },
      openYear: () => {
        panel.previous.year = !panel.previous.year
        panel.previous.month = false
        panel.previous.calendar = !panel.previous.year
      },
      setYear: ($event: number) => {
        datepicker.value.previous = previous.year($event)
        panel.previous.year = !panel.previous.year
        panel.previous.calendar = !panel.previous.year
        emit('selectYear', datepicker.value.previous)
        nextTick(() => {
          if (
            datepicker.value.next.isSame(datepicker.value.previous, 'month')
            || datepicker.value.next.isBefore(datepicker.value.previous)
          )
            datepicker.value.next = datepicker.value.previous.add(1, 'month')

          datepicker.value.year.previous = datepicker.value.previous.year()
          datepicker.value.year.next = datepicker.value.next.year()
        })
      },
    },
    next: {
      date: () => {
        return usePreviousDate(next)
          .concat(useCurrentDate(next))
          .concat(useNextDate(next))
          .map((v) => {
            Object.assign(v, {
              today: v.isToday(),
              active: next.month() === v.month(),
              off: next.month() !== v.month(),
              sunday: v.day() === 0,
              disabled: useDisableDate(v, props) && !inRangeDate(v),
              inRange: () => {
                if (props.asSingle && !props.useRange)
                  return next.month() !== v.month()
              },
              hovered: () => {
                if (hoverValue.value.length > 1) {
                  return (
                    (v.isBetween(
                      hoverValue.value[0],
                      hoverValue.value[1],
                      'date',
                      '()',
                    )
                      || v.isBetween(
                        hoverValue.value[1],
                        hoverValue.value[0],
                        'date',
                        '(]',
                      ))
                    && next.month() === v.month()
                  )
                }
                return false
              },
              duration: () => {
                return false
              },
            })

            return v as DatePickerDay
          })
      },
      month: next && next.format(props.formatter.month),
      year: next && next.year(),
      years: () => {
        return Array.from(
          {
            length: 12,
          },
          (v, k) => year.next + k,
        )
      },
      onPrevious: () => {
        datepicker.value.next = next.subtract(1, 'month')
        if (next.diff(previous, 'month') === 1)
          datepicker.value.previous = previous.subtract(1, 'month')

        emit('clickRightPrev', datepicker.value.next)
      },
      onNext: () => {
        datepicker.value.next = next.add(1, 'month')
        emit('clickRightNext', datepicker.value.next)
      },
      onPreviousYear: () => {
        datepicker.value.year.next = datepicker.value.year.next - 12
      },
      onNextYear: () => {
        datepicker.value.year.next = datepicker.value.year.next + 12
      },
      openMonth: () => {
        panel.next.month = !panel.next.month
        panel.next.year = false
        panel.next.calendar = !panel.next.month
      },
      setMonth: ($event: number) => {
        datepicker.value.next = next.month($event)
        panel.next.month = !panel.next.month
        panel.next.year = false
        panel.next.calendar = !panel.next.month
        emit('selectRightMonth', datepicker.value.next)
        nextTick(() => {
          if (
            datepicker.value.previous.isSame(datepicker.value.next, 'month')
            || datepicker.value.previous.isAfter(datepicker.value.next)
          ) {
            datepicker.value.previous = datepicker.value.next.subtract(
              1,
              'month',
            )
          }

          datepicker.value.year.previous = datepicker.value.previous.year()
        })
      },
      openYear: () => {
        panel.next.year = !panel.next.year
        panel.next.month = false
        panel.next.calendar = !panel.next.year
      },
      setYear: ($event: number) => {
        datepicker.value.next = next.year($event)
        panel.next.year = !panel.next.year
        panel.next.month = false
        panel.next.calendar = !panel.next.year
        emit('selectRightYear', datepicker.value.next)
        nextTick(() => {
          if (
            datepicker.value.previous.isSame(datepicker.value.next, 'month')
            || datepicker.value.previous.isAfter(datepicker.value.next)
          ) {
            datepicker.value.previous = datepicker.value.next.subtract(
              1,
              'month',
            )
          }

          datepicker.value.year.previous = datepicker.value.previous.year()
          datepicker.value.year.next = datepicker.value.next.year()
        })
      },
    },
  }
})

const displayDatepicker = ref(false)

setTimeout(() => {
  displayDatepicker.value = true
}, 250)

function isFirstMonday() {
  return dayjs().localeData().firstDayOfWeek()
}

function shuffleWeekdays(days: dayjs.WeekdayNames): dayjs.WeekdayNames {
  const daysArr = [...days]
  const lastDay = daysArr.shift()
  return [...daysArr, lastDay] as unknown as dayjs.WeekdayNames
}

function asRange() {
  if (!props.useRange && !props.asSingle)
    return true
  else if (!props.useRange && props.asSingle)
    return false
  else if (props.useRange && !props.asSingle)
    return true
  else return !!(props.useRange && props.asSingle)
}

function inRangeDate(date: Dayjs) {
  if (props.disableInRange || typeof props.disableDate === 'function')
    return false
  if (pickerValue.value === '')
    return false
  let s, e
  if (Array.isArray(props.modelValue)) {
    const [start, end] = props.modelValue
    s = start
    e = end
  }
  else if (typeof props.modelValue === 'object') {
    if (props.modelValue) {
      const [start, end] = Object.values(props.modelValue)
      s = start
      e = end
    }
  }
  else {
    const [start, end] = props.modelValue.split(props.separator)
    s = start
    e = end
  }

  return date.isBetween(
    dayjs(s, props.formatter.date, true),
    dayjs(e, props.formatter.date, true),
    'date',
    '[]',
  )
}

function force() {
  previous.value = null
  next.value = null
  hoverValue.value = []
  selection.value = null
}

function clearPicker() {
  pickerValue.value = ''
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', [])
  }
  else if (typeof props.modelValue === 'object') {
    const obj: Record<string, string> = {}
    const [start, end] = Object.keys(props.modelValue)
    obj[start] = ''
    obj[end] = ''
    emit('update:modelValue', obj)
  }
  else {
    emit('update:modelValue', '')
  }
  applyValue.value = []
  VtdInputRef.value && VtdInputRef.value.focus()
}
defineExpose({ clearPicker })

/**
 * keyUp event
 * @since v1.0.5
 */
function keyUp() {
  if (asRange()) {
    const [s, e] = pickerValue.value.split(props.separator)
    const [sd, ed] = [
      dayjs(s, props.formatter.date, true),
      dayjs(e, props.formatter.date, true),
    ]
    if (sd.isValid() && ed.isValid()) {
      setDate(sd)
      setDate(ed)
      if (Array.isArray(props.modelValue)) {
        emit('update:modelValue', [s, e])
      }
      else if (typeof props.modelValue === 'object') {
        const obj: Record<string, string> = {}
        const [start, end] = Object.keys(props.modelValue)
        obj[start] = s
        obj[end] = e
        emit('update:modelValue', obj)
      }
      else {
        emit(
          'update:modelValue',
          useToValueFromArray(
            {
              previous: sd,
              next: ed,
            },
            props,
          ),
        )
      }
    }
  }
  else {
    const d = dayjs(pickerValue.value, props.formatter.date, true)
    if (d.isValid()) {
      setDate(d)
      if (Array.isArray(props.modelValue)) {
        emit('update:modelValue', [pickerValue.value])
      }
      else if (typeof props.modelValue === 'object') {
        const obj: Record<string, string> = {}
        const [start] = Object.keys(props.modelValue)
        obj[start] = pickerValue.value
        emit('update:modelValue', obj)
      }
      else {
        emit('update:modelValue', pickerValue.value)
      }
    }
  }
}

function setDate(date: Dayjs, close?: (ref?: Ref | HTMLElement) => void) {
  if (asRange()) {
    if (previous.value) {
      next.value = date
      if (props.autoApply) {
        if (date.isBefore(previous.value)) {
          pickerValue.value = useToValueFromArray(
            {
              previous: date,
              next: previous.value,
            },
            props,
          )
        }
        else {
          pickerValue.value = useToValueFromArray(
            {
              previous: previous.value,
              next: date,
            },
            props,
          )
        }
        const [s, e] = pickerValue.value.split(props.separator)

        if (Array.isArray(props.modelValue)) {
          emit('update:modelValue', [
            dayjs(s, props.formatter.date, true).format(props.formatter.date),
            dayjs(e, props.formatter.date, true).format(props.formatter.date),
          ])
        }
        else if (typeof props.modelValue === 'object') {
          const obj: Record<string, string> = {}
          const [start, end] = Object.keys(props.modelValue)
          obj[start] = s
          obj[end] = e
          emit('update:modelValue', obj)
        }
        else {
          emit(
            'update:modelValue',
            useToValueFromArray(
              {
                previous: dayjs(s, props.formatter.date, true),
                next: dayjs(e, props.formatter.date, true),
              },
              props,
            ),
          )
        }
        if (close)
          close()

        applyValue.value = []
        if (
          !dayjs(s, props.formatter.date, true).isSame(
            dayjs(e, props.formatter.date, true),
            'month',
          )
        ) {
          datepicker.value.previous = dayjs(s, props.formatter.date, true)
          datepicker.value.next = dayjs(e, props.formatter.date, true)
        }
        force()
      }
      else {
        if (previous.value.isAfter(date, 'month'))
          applyValue.value = [date, previous.value]
        else applyValue.value = [previous.value, date]

        const [s, e] = applyValue.value

        if (!s.isSame(e, 'month')) {
          datepicker.value.previous = s
          datepicker.value.next = e
        }
        force()
      }
    }
    else {
      applyValue.value = []
      previous.value = date
      selection.value = date
      hoverValue.value.push(date)
      applyValue.value.push(date)
      datepicker.value.previous = date
      if (datepicker.value.next.isSame(date, 'month')) {
        datepicker.value.previous = datepicker.value.next
        datepicker.value.next = date.add(1, 'month')
      }
    }
  }
  else {
    if (props.autoApply) {
      pickerValue.value = useToValueFromString(date, props)
      if (Array.isArray(props.modelValue)) {
        emit('update:modelValue', [pickerValue.value])
      }
      else if (typeof props.modelValue === 'object') {
        const obj: Record<string, string> = {}
        const [start] = Object.keys(props.modelValue)
        obj[start] = pickerValue.value
        emit('update:modelValue', obj)
      }
      else {
        emit('update:modelValue', pickerValue.value)
      }
      if (close)
        close()

      applyValue.value = []
      force()
    }
    else {
      applyValue.value = [date]
      force()
    }
  }
}

function applyDate(close?: (ref?: Ref | HTMLElement) => void) {
  if (applyValue.value.length < 1)
    return false
  let date
  if (asRange()) {
    const [s, e] = applyValue.value
    if (e.isBefore(s)) {
      date = useToValueFromArray(
        {
          previous: e,
          next: s,
        },
        props,
      )
    }
    else {
      date = useToValueFromArray(
        {
          previous: s,
          next: e,
        },
        props,
      )
    }
  }
  else {
    const [s] = applyValue.value
    date = s
  }
  if (asRange()) {
    const [s, e] = (date as string).split(props.separator)

    if (Array.isArray(props.modelValue)) {
      emit('update:modelValue', [
        dayjs(s, props.formatter.date, true).format(props.formatter.date),
        dayjs(e, props.formatter.date, true).format(props.formatter.date),
      ])
    }
    else if (typeof props.modelValue === 'object') {
      const obj: Record<string, string> = {}
      const [start, end] = Object.keys(props.modelValue)
      obj[start] = s
      obj[end] = e
      emit('update:modelValue', obj)
    }
    else {
      emit(
        'update:modelValue',
        useToValueFromArray(
          {
            previous: dayjs(s, props.formatter.date, true),
            next: dayjs(e, props.formatter.date, true),
          },
          props,
        ),
      )
    }
    pickerValue.value = date as string
  }
  else {
    pickerValue.value = (date as Dayjs).format(props.formatter.date)
    if (Array.isArray(props.modelValue)) {
      emit('update:modelValue', [pickerValue.value])
    }
    else if (typeof props.modelValue === 'object') {
      const obj: Record<string, string> = {}
      const [start] = Object.keys(props.modelValue)
      obj[start] = pickerValue.value
      emit('update:modelValue', obj)
    }
    else {
      emit('update:modelValue', pickerValue.value)
    }
  }
  if (close)
    close()
}

function atMouseOver(date: Dayjs) {
  if (!asRange())
    return false
  if (previous.value) {
    hoverValue.value = [previous.value, date]
  }
  else {
    hoverValue.value = []
    return false
  }
}

function isBetweenRange(date: DatePickerDay) {
  if (previous.value && props.autoApply)
    return false
  let s, e
  if (hoverValue.value.length > 1) {
    const [start, end] = hoverValue.value
    s = dayjs(start, props.formatter.date, true)
    e = dayjs(end, props.formatter.date, true)
  }
  else {
    if (Array.isArray(props.modelValue)) {
      if (props.autoApply) {
        const [start, end] = props.modelValue
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
      else {
        const [start, end] = applyValue.value
        s = dayjs(start, props.formatter.date, true)
        e = dayjs(end, props.formatter.date, true)
      }
    }
    else if (typeof props.modelValue === 'object') {
      if (props.autoApply) {
        if (props.modelValue) {
          const [start, end] = Object.values(props.modelValue)
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
      }
      else {
        const [start, end] = applyValue.value
        s = dayjs(start, props.formatter.date, true)
        e = dayjs(end, props.formatter.date, true)
      }
    }
    else {
      if (props.autoApply) {
        const [start, end] = props.modelValue
          ? props.modelValue.split(props.separator)
          : [null, null]
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
      else {
        const [start, end] = applyValue.value
        s = dayjs(start, props.formatter.date, true)
        e = dayjs(end, props.formatter.date, true)
      }
    }
  }
  if (s && e) {
    return useBetweenRange(date, {
      previous: s,
      next: e,
    })
  }
  return false
}

function datepickerClasses(date: DatePickerDay) {
  const { today, active, off, disabled } = date
  let classes, s, e
  if (asRange()) {
    if (Array.isArray(props.modelValue)) {
      if (selection.value) {
        const [start, end] = hoverValue.value
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
      else {
        if (props.autoApply) {
          const [start, end] = props.modelValue
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
        else {
          const [start, end] = applyValue.value
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
      }
    }
    else if (typeof props.modelValue === 'object') {
      if (selection.value) {
        const [start, end] = hoverValue.value
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
      else {
        if (props.autoApply) {
          const [start, end] = props.modelValue
            ? Object.values(props.modelValue)
            : [null, null]
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
        else {
          const [start, end] = applyValue.value
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
      }
    }
    else {
      if (selection.value) {
        const [start, end] = hoverValue.value
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
      else {
        if (props.autoApply) {
          const [start, end] = props.modelValue
            ? props.modelValue.split(props.separator)
            : [null, null]
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
        else {
          const [start, end] = applyValue.value
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
      }
    }
  }
  else {
    if (Array.isArray(props.modelValue)) {
      if (props.autoApply) {
        if (props.modelValue.length > 0) {
          const [start] = props.modelValue
          s = dayjs(start, props.formatter.date, true)
        }
      }
      else {
        const [start] = applyValue.value
        s = start && dayjs(start, props.formatter.date, true)
      }
    }
    else if (typeof props.modelValue === 'object') {
      if (props.autoApply) {
        if (props.modelValue) {
          const [start] = Object.values(props.modelValue)
          s = dayjs(start, props.formatter.date, true)
        }
      }
      else {
        const [start] = applyValue.value
        s = start && dayjs(start, props.formatter.date, true)
      }
    }
    else {
      if (props.autoApply) {
        if (props.modelValue) {
          const [start] = props.modelValue.split(props.separator)
          s = dayjs(start, props.formatter.date, true)
        }
      }
      else {
        const [start] = applyValue.value
        s = start && dayjs(start, props.formatter.date, true)
      }
    }
  }
  if (active) {
    classes = today
      ? 'text-vtd-primary-500 font-semibold dark:text-vtd-primary-400 rounded-full focus:bg-vtd-primary-50 focus:text-vtd-secondary-900 focus:border-vtd-primary-300 focus:ring focus:ring-vtd-primary-500 focus:ring-opacity-10 focus:outline-none dark:bg-vtd-secondary-800 dark:text-vtd-secondary-300 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-secondary-300 dark:focus:bg-vtd-secondary-600 dark:focus:text-vtd-secondary-100 dark:focus:border-vtd-primary-500 dark:focus:ring-opacity-25 dark:focus:bg-opacity-50'
      : disabled
        ? 'text-vtd-secondary-600 font-normal disabled:text-vtd-secondary-500 disabled:cursor-not-allowed rounded-full'
        : date.isBetween(s as Dayjs, e as Dayjs, 'date', '()')
          ? 'text-vtd-secondary-700 font-medium dark:text-vtd-secondary-100 rounded-full'
          : 'text-vtd-secondary-600 font-medium dark:text-vtd-secondary-200 rounded-full'
  }
  if (off)
    classes = 'text-vtd-secondary-400 font-light disabled:cursor-not-allowed'

  if (s && e && !off) {
    if (date.isSame(s, 'date')) {
      classes = e.isAfter(s, 'date')
        ? 'bg-vtd-primary-500 text-white font-bold rounded-l-full disabled:cursor-not-allowed'
        : 'bg-vtd-primary-500 text-white font-bold rounded-r-full disabled:cursor-not-allowed'
      if (s.isSame(e, 'date')) {
        classes
          = 'bg-vtd-primary-500 text-white font-bold rounded-full disabled:cursor-not-allowed'
      }
    }
    if (date.isSame(e, 'date')) {
      classes = e.isAfter(s, 'date')
        ? 'bg-vtd-primary-500 text-white font-bold rounded-r-full disabled:cursor-not-allowed'
        : 'bg-vtd-primary-500 text-white font-bold rounded-l-full disabled:cursor-not-allowed'
      if (s.isSame(e, 'date')) {
        classes
          = 'bg-vtd-primary-500 text-white font-bold rounded-full disabled:cursor-not-allowed'
      }
    }
  }
  else if (s) {
    if (date.isSame(s, 'date') && !off) {
      classes
        = 'bg-vtd-primary-500 text-white font-bold rounded-full disabled:cursor-not-allowed'
    }
  }

  return classes
}

function betweenRangeClasses(date: Dayjs) {
  let classes, s, e
  classes = ''
  if (!asRange())
    return classes
  if (Array.isArray(props.modelValue)) {
    if (hoverValue.value.length > 1) {
      const [start, end] = hoverValue.value
      s = start && dayjs(start, props.formatter.date, true)
      e = end && dayjs(end, props.formatter.date, true)
    }
    else {
      if (props.autoApply) {
        const [start, end] = props.modelValue
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
      else {
        const [start, end] = applyValue.value
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
    }
  }
  else if (typeof props.modelValue === 'object') {
    if (hoverValue.value.length > 1) {
      const [start, end] = hoverValue.value
      s = start && dayjs(start, props.formatter.date, true)
      e = end && dayjs(end, props.formatter.date, true)
    }
    else {
      if (props.autoApply) {
        if (props.modelValue) {
          const [start, end] = Object.values(props.modelValue)
          s = start && dayjs(start, props.formatter.date, true)
          e = end && dayjs(end, props.formatter.date, true)
        }
      }
      else {
        const [start, end] = applyValue.value
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
    }
  }
  else {
    if (hoverValue.value.length > 1) {
      const [start, end] = hoverValue.value
      s = start && dayjs(start, props.formatter.date, true)
      e = end && dayjs(end, props.formatter.date, true)
    }
    else {
      if (props.autoApply) {
        const [start, end] = props.modelValue
          ? props.modelValue.split(props.separator)
          : [null, null]
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
      else {
        const [start, end] = applyValue.value
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
    }
  }

  if (s && e) {
    if (date.isSame(s, 'date')) {
      if (e.isBefore(s))
        classes += ' rounded-r-full inset-0'

      if (s.isBefore(e))
        classes += ' rounded-l-full inset-0'
    }
    else if (date.isSame(e, 'date')) {
      if (e.isBefore(s))
        classes += ' rounded-l-full inset-0'

      if (s.isBefore(e))
        classes += ' rounded-r-full inset-0'
    }
    else {
      classes += ' inset-0'
    }
  }
  return classes
}

function forceEmit(s: string, e: string) {
  datepicker.value.previous = dayjs(s, props.formatter.date, true)
  datepicker.value.next = dayjs(e, props.formatter.date, true)

  if (
    dayjs
      .duration(datepicker.value.next.diff(datepicker.value.previous))
      .get('months') === 2
    || (dayjs
      .duration(datepicker.value.next.diff(datepicker.value.previous))
      .get('months') === 1
      && dayjs
        .duration(datepicker.value.next.diff(datepicker.value.previous))
        .get('days') === 7)
  )
    datepicker.value.next = datepicker.value.next.subtract(1, 'month')

  if (
    datepicker.value.next.isSame(datepicker.value.previous, 'month')
    || datepicker.value.next.isBefore(datepicker.value.previous)
  )
    datepicker.value.next = datepicker.value.previous.add(1, 'month')
}

function emitShortcut(s: string, e: string) {
  if (asRange()) {
    if (props.autoApply) {
      if (Array.isArray(props.modelValue)) {
        emit('update:modelValue', [s, e])
      }
      else if (typeof props.modelValue === 'object') {
        const obj: Record<string, string> = {}
        const [start, end] = Object.keys(props.modelValue)
        obj[start] = s
        obj[end] = e
        emit('update:modelValue', obj)
      }
      else {
        emit(
          'update:modelValue',
          useToValueFromArray(
            {
              previous: dayjs(s, props.formatter.date, true),
              next: dayjs(e, props.formatter.date, true),
            },
            props,
          ),
        )
      }
      pickerValue.value = `${s}${props.separator}${e}`
    }
    else {
      applyValue.value = [
        dayjs(s, props.formatter.date, true),
        dayjs(e, props.formatter.date, true),
      ]
    }
  }
  else {
    if (props.autoApply) {
      if (Array.isArray(props.modelValue)) {
        emit('update:modelValue', [s])
      }
      else if (typeof props.modelValue === 'object') {
        const obj: Record<string, string> = {}
        const [start] = Object.keys(props.modelValue)
        obj[start] = s
        emit('update:modelValue', obj)
      }
      else {
        emit('update:modelValue', s)
      }
      pickerValue.value = s
    }
    else {
      applyValue.value = [
        dayjs(s, props.formatter.date, true),
        dayjs(e, props.formatter.date, true),
      ]
    }
  }
  forceEmit(s, e)
}

function setToToday(close?: (ref?: Ref | HTMLElement) => void) {
  const s = dayjs().format(props.formatter.date)
  const e = dayjs().format(props.formatter.date)

  emitShortcut(s, e)
  if (close)
    close()
}

function setToYesterday(close?: (ref?: Ref | HTMLElement) => void) {
  const s = dayjs().subtract(1, 'day').format(props.formatter.date)
  const e = dayjs().subtract(1, 'day').format(props.formatter.date)

  emitShortcut(s, e)
  if (close)
    close()
}

function setToLastDay(day: number, close?: (ref?: Ref | HTMLElement) => void) {
  const s = dayjs()
    .subtract(day - 1, 'day')
    .format(props.formatter.date)
  const e = dayjs().format(props.formatter.date)

  emitShortcut(s, e)
  if (close)
    close()
}

function setToThisMonth(close?: (ref?: Ref | HTMLElement) => void) {
  const s = dayjs().date(1).format(props.formatter.date)
  const e = dayjs().date(dayjs().daysInMonth()).format(props.formatter.date)

  emitShortcut(s, e)
  if (close)
    close()
}

function setToLastMonth(close?: (ref?: Ref | HTMLElement) => void) {
  const s = dayjs().date(1).subtract(1, 'month').format(props.formatter.date)
  const e = dayjs().date(0).format(props.formatter.date)

  emitShortcut(s, e)
  if (close)
    close()
}

function setToCustomShortcut(
  item: { label: string; atClick: () => Date[] },
  close?: (ref?: Ref | HTMLElement) => void,
): void {
  const [d, dd] = item.atClick()
  const s = dayjs(d).format(props.formatter.date)
  const e = dayjs(dd).format(props.formatter.date)

  emitShortcut(s, e)
  if (close)
    close()
}

watch(
  () => applyValue.value,
  (newValue) => {
    if (newValue.length > 0) {
      panel.previous.calendar = true
      panel.previous.month = false
      panel.previous.year = false

      panel.next.calendar = true
      panel.next.month = false
      panel.next.year = false
    }
  },
)

watchEffect(() => {
  if (!props.placeholder) {
    if (asRange())
      givenPlaceholder.value = `${props.formatter.date}${props.separator}${props.formatter.date}`
    else givenPlaceholder.value = props.formatter.date
  }
  else {
    givenPlaceholder.value = props.placeholder
  }
})

dayjs.locale(props.i18n)
watch(() => props.i18n, () => dayjs.locale(props.i18n))

async function updateFromModel(locale: string, modelValueCloned: Props['modelValue']) {
  if (locale in localesMap) {
    const localeData = await localesMap[locale]()
    dayjs.locale(localeData, undefined, true)
    dayjs.locale(locale)
  }

  let s, e
  if (asRange()) {
    if (Array.isArray(modelValueCloned)) {
      if (modelValueCloned.length > 0) {
        const [start, end] = modelValueCloned
        s = dayjs(start, props.formatter.date, true)
        e = dayjs(end, props.formatter.date, true)
      }
    }
    else if (typeof modelValueCloned === 'object') {
      if (!isProxy(modelValueCloned)) {
        try {
          Object.keys(modelValueCloned)
        }
        catch (e) {
          console.warn(
            '[Vue Tailwind Datepicker]: It looks like you want to use Object as the argument %cv-model',
            'font-style: italic; color: #42b883;',
            ', but you pass it undefined or null.',
          )
          console.warn(
            '[Vue Tailwind Datepicker]: We has replace with %c{ startDate: \'\', endDate: \'\' }',
            'font-style: italic; color: #42b883;',
            ', but you can replace manually.',
          )
          emit('update:modelValue', {
            startDate: '',
            endDate: '',
          })
        }
      }
      if (modelValueCloned) {
        const [start, end] = Object.values(modelValueCloned)
        s = start && dayjs(start, props.formatter.date, true)
        e = end && dayjs(end, props.formatter.date, true)
      }
    }
    else {
      if (modelValueCloned) {
        const [start, end] = modelValueCloned.split(props.separator)
        s = dayjs(start, props.formatter.date, true)
        e = dayjs(end, props.formatter.date, true)
      }
    }

    if (s && e) {
      pickerValue.value = useToValueFromArray(
        {
          previous: s,
          next: e,
        },
        props,
      )
      if (e.isBefore(s, 'month')) {
        datepicker.value.previous = e
        datepicker.value.next = s
        datepicker.value.year.previous = e.year()
        datepicker.value.year.next = s.year()
      }
      else if (e.isSame(s, 'month')) {
        datepicker.value.previous = s
        datepicker.value.next = e.add(1, 'month')
        datepicker.value.year.previous = s.year()
        datepicker.value.year.next = s.add(1, 'year').year()
      }
      else {
        datepicker.value.previous = s
        datepicker.value.next = e
        datepicker.value.year.previous = s.year()
        datepicker.value.year.next = e.year()
      }
      if (!props.autoApply)
        applyValue.value = [s, e]
    }
    else {
      datepicker.value.previous = dayjs(props.startFrom)
      datepicker.value.next = dayjs(props.startFrom).add(1, 'month')
      datepicker.value.year.previous = datepicker.value.previous.year()
      datepicker.value.year.next = datepicker.value.next.year()
    }
  }
  else {
    if (Array.isArray(modelValueCloned)) {
      if (modelValueCloned.length > 0) {
        const [start] = modelValueCloned
        s = dayjs(start, props.formatter.date, true)
      }
    }
    else if (typeof modelValueCloned === 'object') {
      if (modelValueCloned) {
        const [start] = Object.values(modelValueCloned)
        s = dayjs(start, props.formatter.date, true)
      }
    }
    else {
      if (modelValueCloned.length) {
        const [start] = modelValueCloned.split(props.separator)
        s = dayjs(start, props.formatter.date, true)
      }
    }

    if (s && s.isValid()) {
      pickerValue.value = useToValueFromString(s, props)
      datepicker.value.previous = s
      datepicker.value.next = s.add(1, 'month')
      datepicker.value.year.previous = s.year()
      datepicker.value.year.next = s.add(1, 'year').year()
      if (!props.autoApply)
        applyValue.value = [s]
    }
    else {
      datepicker.value.previous = dayjs(props.startFrom)
      datepicker.value.next = dayjs(props.startFrom).add(1, 'month')
      datepicker.value.year.previous = datepicker.value.previous.year()
      datepicker.value.year.next = datepicker.value.next.year()
    }
  }
  const days
    = props.weekdaysSize === 'min'
      ? dayjs.weekdaysMin()
      : dayjs.weekdaysShort()
  datepicker.value.weeks = isFirstMonday() ? shuffleWeekdays(days) : days
  datepicker.value.months
    = props.formatter.month === 'MMM' ? dayjs.monthsShort() : dayjs.months()
}

// Await translations and model initialization before server rendering completes.
onServerPrefetch(() => updateFromModel(props.i18n, props.modelValue))

watchEffect(() => {
  const locale = props.i18n
  const modelValue = props.modelValue
  if (typeof window !== 'undefined')
    void nextTick(() => updateFromModel(locale, modelValue))
})

function getAbsoluteClass(open: boolean) {
  if (open && placement.value === null)
    placement.value = useVisibleViewport(VtdRef.value)

  if (open && placement.value)
    return 'place-right'

  return 'place-left'
}

function getAbsoluteParentClass(open: boolean) {
  if (open && placement.value === null)
    placement.value = useVisibleViewport(VtdRef.value)

  if (placement.value)
    return 'left-auto right-0'

  return 'left-0 right-auto'
}

provide(isBetweenRangeKey, isBetweenRange)
provide(betweenRangeClassesKey, betweenRangeClasses)
provide(datepickerClassesKey, datepickerClasses)
provide(atMouseOverKey, atMouseOver)
provide(setToTodayKey, setToToday)
provide(setToYesterdayKey, setToYesterday)
provide(setToLastDayKey, setToLastDay)
provide(setToThisMonthKey, setToThisMonth)
provide(setToLastMonthKey, setToLastMonth)
provide(setToCustomShortcutKey, setToCustomShortcut)
</script>

<template>
  <Popover v-if="!props.noInput" ref="VtdRootRef" id="vtd" v-slot="{ open }: { open: boolean }" as="div"
    class="relative w-full" :class="{ 'vtd-dark': isDark }">
    <PopoverOverlay v-if="props.overlay && !props.disabled" class="fixed inset-0 bg-black opacity-30" />

    <PopoverButton as="label" class="relative block">
      <slot :value="pickerValue" :placeholder="givenPlaceholder" :clear="clearPicker">
        <input ref="VtdInputRef" v-bind="$attrs" v-model="pickerValue" type="text" class="relative block w-full"
          :disabled="props.disabled" :class="[
            props.disabled ? 'cursor-default opacity-50' : 'opacity-100',
            inputClasses
            || 'pl-3 pr-12 py-2.5 rounded-lg overflow-hidden border-solid text-sm text-vtd-secondary-700 placeholder-vtd-secondary-400 transition-colors bg-white border border-vtd-secondary-300 focus:border-vtd-primary-300 focus:ring focus:ring-vtd-primary-500 focus:ring-opacity-10 focus:outline-none dark:bg-vtd-secondary-800 dark:border-vtd-secondary-700 dark:text-vtd-secondary-100 dark:placeholder-vtd-secondary-500 dark:focus:border-vtd-primary-500 dark:focus:ring-opacity-20',
          ]" autocomplete="off" data-lpignore="true" data-form-type="other" :placeholder="givenPlaceholder"
          @keyup.stop="keyUp" @keydown.stop>
        <div class="absolute inset-y-0 right-0 inline-flex items-center rounded-md overflow-hidden">
          <button type="button" :disabled="props.disabled" :class="props.disabled ? 'cursor-default opacity-50' : 'opacity-100'
            " class="px-2 py-1 mr-1 focus:outline-none text-vtd-secondary-400 dark:text-opacity-70 rounded-md" @click="
    props.disabled
      ? false
      : pickerValue
        ? clearPicker()
        : VtdInputRef?.focus()
    ">
            <slot name="inputIcon" :value="pickerValue">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path v-if="pickerValue" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M6 18L18 6M6 6l12 12" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </slot>
          </button>
        </div>
      </slot>
    </PopoverButton>

    <transition enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0"
      enter-active-class="transform transition ease-out duration-200"
      leave-active-class="transform transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-3">
      <PopoverPanel v-if="!props.disabled" v-slot="{ close }: { close: (ref?: Ref | HTMLElement) => void }" as="div"
        class="relative z-50">
        <div class="absolute z-50 top-full sm:mt-2.5" :class="getAbsoluteParentClass(open)">
          <div ref="VtdRef"
            class="fixed inset-0 z-50 overflow-y-auto sm:overflow-visible sm:static sm:z-auto bg-white dark:bg-vtd-secondary-800 sm:rounded-lg shadow-sm">
            <div
              class="vtd-datepicker static sm:relative w-full bg-white sm:rounded-lg sm:shadow-sm border-0 sm:border border-black/[.1] px-3 py-3 sm:px-4 sm:py-4 dark:bg-vtd-secondary-800 dark:border-vtd-secondary-700/[1]"
              :class="getAbsoluteClass(open)">
              <div class="flex flex-wrap lg:flex-nowrap">
                <VtdShortcut v-if="props.shortcuts" :shortcuts="props.shortcuts" :as-range="asRange()"
                  :as-single="props.asSingle" :i18n="props.options.shortcuts" :close="close" />
                <div class="relative flex flex-wrap sm:flex-nowrap p-1 w-full">
                  <div v-if="asRange() && !props.asSingle"
                    class="hidden h-full absolute inset-0 sm:flex justify-center items-center">
                    <div class="h-full border-r border-black/[.1] dark:border-vtd-secondary-700/[1]" />
                  </div>
                  <div class="relative" :class="{
                    'mb-3 sm:mb-0 sm:mr-2 w-full md:w-1/2 lg:w-80':
                      asRange() && !props.asSingle,
                    'w-full': !asRange() && props.asSingle,
                  }">
                    <VtdHeader :panel="panel.previous" :calendar="calendar.previous" />
                    <div class="px-0.5 sm:px-2">
                      <VtdMonth v-show="panel.previous.month" :months="months"
                        @update-month="calendar.previous.setMonth" />
                      <VtdYear v-show="panel.previous.year" :years="calendar.previous.years()"
                        @update-year="calendar.previous.setYear" />
                      <div v-show="panel.previous.calendar">
                        <VtdWeek :weeks="weeks" />
                        <VtdCalendar :calendar="calendar.previous" :weeks="weeks" :as-range="asRange()"
                          :week-number="weekNumber" @update-date="(date) => setDate(date, close)" />
                      </div>
                    </div>
                  </div>

                  <div v-if="asRange() && !props.asSingle"
                    class="relative w-full md:w-1/2 lg:w-80 overflow-hidden mt-3 sm:mt-0 sm:ml-2">
                    <VtdHeader as-prev-or-next :panel="panel.next" :calendar="calendar.next" />
                    <div class="px-0.5 sm:px-2">
                      <VtdMonth v-show="panel.next.month" :months="months" @update-month="calendar.next.setMonth" />
                      <VtdYear v-show="panel.next.year" as-prev-or-next :years="calendar.next.years()"
                        @update-year="calendar.next.setYear" />
                      <div v-show="panel.next.calendar">
                        <VtdWeek :weeks="weeks" />
                        <VtdCalendar as-prev-or-next :calendar="calendar.next" :weeks="weeks" :as-range="asRange()"
                          :week-number="weekNumber" @update-date="(date) => setDate(date, close)" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-if="!props.autoApply">
                <div class="mt-2 mx-2 py-1.5 border-t border-black/[.1] dark:border-vtd-secondary-700/[1]">
                  <div class="mt-1.5 sm:flex sm:flex-row-reverse">
                    <button type="button"
                      class="away-apply-picker w-full transition ease-out duration-300 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-vtd-primary-600 text-base font-medium text-white hover:bg-vtd-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vtd-primary-500 sm:ml-3 sm:w-auto sm:text-sm dark:ring-offset-vtd-secondary-800 disabled:cursor-not-allowed"
                      :disabled="props.asSingle
                        ? applyValue.length < 1
                        : applyValue.length < 2
                        " @click="applyDate(close)" v-text="props.options.footer.apply" />
                    <button type="button"
                      class="mt-3 away-cancel-picker w-full transition ease-out duration-300 inline-flex justify-center rounded-md border border-vtd-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-vtd-secondary-700 hover:bg-vtd-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vtd-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:ring-offset-vtd-secondary-800"
                      @click="close()" v-text="props.options.footer.cancel" />
                  </div>
                </div>
              </div>
              <div v-else class="sm:hidden">
                <div class="mt-2 mx-2 py-1.5 border-t border-black/[.1] dark:border-vtd-secondary-700/[1]">
                  <div class="mt-1.5 sm:flex sm:flex-row-reverse">
                    <button type="button"
                      class="away-cancel-picker w-full transition ease-out duration-300 inline-flex justify-center rounded-md border border-vtd-secondary-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-vtd-secondary-700 hover:bg-vtd-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vtd-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:ring-offset-vtd-secondary-800"
                      @click="close()" v-text="props.options.footer.cancel" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
  <div v-else-if="displayDatepicker" ref="VtdRootRef" class="flex" :class="{ 'vtd-dark': isDark }">
    <div
      class="bg-white rounded-lg shadow-sm border border-black/[.1] px-3 py-3 sm:px-4 sm:py-4 dark:bg-vtd-secondary-800 dark:border-vtd-secondary-700/[1]">
      <div class="flex flex-wrap lg:flex-nowrap">
        <VtdShortcut v-if="props.shortcuts" :shortcuts="props.shortcuts" :as-range="asRange()" :as-single="props.asSingle"
          :i18n="props.options.shortcuts" />
        <div class="relative flex flex-wrap sm:flex-nowrap p-1 w-full">
          <div v-if="asRange() && !props.asSingle"
            class="hidden h-full absolute inset-0 sm:flex justify-center items-center">
            <div class="h-full border-r border-black/[.1] dark:border-vtd-secondary-700/[1]" />
          </div>
          <div class="relative w-full lg:w-80" :class="{
            'mb-3 sm:mb-0 sm:mr-2 md:w-1/2': asRange() && !props.asSingle,
          }">
            <VtdHeader :panel="panel.previous" :calendar="calendar.previous" />
            <div class="px-0.5 sm:px-2">
              <VtdMonth v-show="panel.previous.month" :months="months" @update-month="calendar.previous.setMonth" />
              <VtdYear v-show="panel.previous.year" :years="calendar.previous.years()"
                @update-year="calendar.previous.setYear" />
              <div v-show="panel.previous.calendar">
                <VtdWeek :weeks="weeks" />
                <VtdCalendar :calendar="calendar.previous" :weeks="weeks" :as-range="asRange()" :week-number="weekNumber"
                  @update-date="(date) => setDate(date)" />
              </div>
            </div>
          </div>

          <div v-if="asRange() && !props.asSingle"
            class="relative w-full md:w-1/2 lg:w-80 overflow-hidden mt-3 sm:mt-0 sm:ml-2">
            <VtdHeader as-prev-or-next :panel="panel.next" :calendar="calendar.next" />
            <div class="px-0.5 sm:px-2">
              <VtdMonth v-show="panel.next.month" :months="months" @update-month="calendar.next.setMonth" />
              <VtdYear v-show="panel.next.year" as-prev-or-next :years="calendar.next.years()"
                @update-year="calendar.next.setYear" />
              <div v-show="panel.next.calendar">
                <VtdWeek :weeks="weeks" />
                <VtdCalendar as-prev-or-next :calendar="calendar.next" :weeks="weeks" :as-range="asRange()"
                  :week-number="weekNumber" @update-date="(date) => setDate(date)" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="!props.autoApply">
        <div class="mt-2 mx-2 py-1.5 border-t border-black/[.1] dark:border-vtd-secondary-700/[1]">
          <div class="mt-1.5 sm:flex sm:flex-row-reverse">
            <button type="button"
              class="away-apply-picker w-full transition ease-out duration-300 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-vtd-primary-600 text-base font-medium text-white hover:bg-vtd-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vtd-primary-500 sm:ml-3 sm:w-auto sm:text-sm dark:ring-offset-vtd-secondary-800 disabled:cursor-not-allowed"
              :disabled="props.asSingle ? applyValue.length < 1 : applyValue.length < 2
                " @click="applyDate()" v-text="props.options.footer.apply" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import "tailwindcss";
@import "./index.css";

.vtd-datepicker-overlay.open::before {
  @apply block opacity-50;
}

.vtd-datepicker::before {
  --vtd-datepicker: 0px;
  content: "";
  @apply absolute top-0 w-4 h-4 bg-white shadow border border-black/[.1];
  transform: translate(50%, -50%) rotate(-45deg);
  clip-path: polygon(calc(var(--vtd-datepicker) * -1) calc(var(--vtd-datepicker) * -1),
      calc(100% + var(--vtd-datepicker)) calc(var(--vtd-datepicker) * -1),
      calc(100% + var(--vtd-datepicker)) calc(100% + var(--vtd-datepicker)));
}

.vtd-datepicker.place-left::before {
  @apply left-1;
}

.vtd-datepicker.place-right::before {
  @apply right-5;
}

.vtd-dark .vtd-datepicker::before {
  @apply bg-vtd-secondary-800 border-vtd-secondary-700;
}
</style>
