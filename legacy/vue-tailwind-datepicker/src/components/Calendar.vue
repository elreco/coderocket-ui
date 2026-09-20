<script setup lang="ts">
import { injectStrict } from '../utils'
import {
  atMouseOverKey,
  betweenRangeClassesKey,
  datepickerClassesKey,
  isBetweenRangeKey,
} from '../keys'

defineProps<{
  calendar: {
    date: () => any[]
    month: string
    year: number
    years: () => number[]
    onPrevious: () => void
    onNext: () => void
    onPreviousYear: () => void
    onNextYear: () => void
    openMonth: () => void
    setMonth: ($event: number) => void
    openYear: () => void
    setYear: ($event: number) => void
  }
  weeks: string[]
  weekNumber: boolean
  asRange: boolean
}>()

const emit = defineEmits<{
  (e: 'updateDate', event: any): void
}>()

const isBetweenRange = injectStrict(isBetweenRangeKey)
const betweenRangeClasses = injectStrict(betweenRangeClassesKey)
const datepickerClasses = injectStrict(datepickerClassesKey)
const atMouseOver = injectStrict(atMouseOverKey)
</script>

<template>
  <div class="grid grid-cols-7 gap-y-0.5 my-1">
    <transition-group
      enter-from-class="opacity-0" enter-to-class="opacity-100"
      enter-active-class="transition-opacity ease-out duration-300"
      leave-active-class="transition-opacity ease-in duration-200" leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <template v-for="(date, keyDate) in calendar.date()" :key="keyDate">
        <div v-if="keyDate % 7 === 0 && weekNumber" class="col-span-7 border-b relative dark:border-vtd-secondary-600">
          <span class="absolute -left-2 top-1/2 -translate-y-2/4 bg-white dark:bg-vtd-secondary-800 text-[8px] pr-2 text-vtd-secondary-400">{{ date.week() }}</span>
        </div>
        <div class="relative" :class="{ 'vtd-tooltip': asRange && date.duration() }" :data-tooltip="`${date.duration()}`">
          <transition
            enter-from-class="opacity-0" enter-to-class="opacity-100"
            enter-active-class="transition-opacity ease-out duration-200"
            leave-active-class="transition-opacity ease-in duration-150" leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <span
              v-if="isBetweenRange(date) || date.hovered()"
              class="absolute bg-vtd-primary-100 bg-opacity-60 dark:bg-vtd-secondary-700/50"
              :class="betweenRangeClasses(date)"
            />
          </transition>
          <button
            type="button"
            class="vtd-datepicker-date relative w-[2.7rem] h-[2.7rem] lg:w-10 lg:h-10 flex justify-center items-center text-xs 2xl:text-sm"
            :class="[
              datepickerClasses(date),
              asRange ? 'transition-all' : 'transition-colors',
            ]" :disabled="date.disabled || date.inRange()" :data-date="date.toDate()" @click="emit('updateDate', date)"
            @mouseenter="atMouseOver(date)" @focusin="atMouseOver(date)" v-text="date.date()"
          />
        </div>
      </template>
    </transition-group>
  </div>
</template>
