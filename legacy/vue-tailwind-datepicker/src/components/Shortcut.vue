<script setup lang="ts">
import type { Ref } from 'vue'
import { computed } from 'vue'
import { injectStrict } from '../utils'
import {
  setToCustomShortcutKey,
  setToLastDayKey,
  setToLastMonthKey,
  setToThisMonthKey,
  setToTodayKey,
  setToYesterdayKey,
} from '../keys'

const props = defineProps<{
  shortcuts: boolean | (() => { label: string; atClick: () => Date[] }[])
  close?: (ref?: Ref | HTMLElement) => void
  asRange: boolean
  asSingle: boolean
  i18n: {
    today: string
    yesterday: string
    past: (period: number) => string
    currentMonth: string
    pastMonth: string
  }
}>()

const setToToday = injectStrict(setToTodayKey)
const setToYesterday = injectStrict(setToYesterdayKey)
const setToLastDay = injectStrict(setToLastDayKey)
const setToThisMonth = injectStrict(setToThisMonthKey)
const setToLastMonth = injectStrict(setToLastMonthKey)
const setToCustomShortcut = injectStrict(setToCustomShortcutKey)

const withShortcut = computed(() => {
  return typeof props.shortcuts === 'function' ? props.shortcuts() : false
})
</script>

<template>
  <div
    v-if="(props.asRange && props.asSingle) || (props.asRange && !props.asSingle)
    "
    class="relative w-full border-t border-b-0 sm:border-t-0 sm:border-b lg:border-b-0 lg:border-r border-black/10 order-last sm:order-0 dark:border-vtd-secondary-700 sm:mt-1 lg:mr-1 sm:mb-1 lg:mb-0 sm:mx-1 lg:mx-0 sm:w-auto"
  >
    <ol
      v-if="withShortcut"
      class="grid grid-cols-2 sm:grid-cols-3 gap-1 lg:block w-full pr-5 sm:pr-6 mt-1.5 sm:mt-0 sm:mb-1.5 lg:mb-0"
    >
      <li v-for="(item, i) in withShortcut" :key="i">
        <a
          href="#"
          class="vtd-shortcuts block text-sm lg:text-xs px-2 py-2 sm:leading-4 whitespace-nowrap font-medium rounded-sm text-vtd-primary-600 hover:text-vtd-primary-700 transition-colors hover:bg-vtd-secondary-100 focus:bg-vtd-secondary-100 focus:text-vtd-primary-600 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-primary-300 dark:text-vtd-primary-400 dark:focus:bg-vtd-secondary-700 dark:focus:text-vtd-primary-300"
          @click.prevent="setToCustomShortcut(item, close)" v-text="item.label"
        />
      </li>
    </ol>
    <ol
      v-else
      class="grid grid-cols-2 sm:grid-cols-3 gap-1 lg:block w-full pr-5 sm:pr-6 mt-1.5 sm:mt-0 sm:mb-1.5 lg:mb-0"
    >
      <li>
        <a
          href="#"
          class="vtd-shortcuts block text-sm lg:text-xs px-2 py-2 sm:leading-4 whitespace-nowrap font-medium rounded-sm text-vtd-primary-600 hover:text-vtd-primary-700 transition-colors hover:bg-vtd-secondary-100 focus:bg-vtd-secondary-100 focus:text-vtd-primary-600 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-primary-300 dark:text-vtd-primary-400 dark:focus:bg-vtd-secondary-700 dark:focus:text-vtd-primary-300"
          @click.prevent="setToToday(close)"
        >
          {{ props.i18n.today }}
        </a>
      </li>
      <li>
        <a
          href="#"
          class="vtd-shortcuts block text-sm lg:text-xs px-2 py-2 sm:leading-4 whitespace-nowrap font-medium rounded-sm text-vtd-primary-600 hover:text-vtd-primary-700 transition-colors hover:bg-vtd-secondary-100 focus:bg-vtd-secondary-100 focus:text-vtd-primary-600 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-primary-300 dark:text-vtd-primary-400 dark:focus:bg-vtd-secondary-700 dark:focus:text-vtd-primary-300"
          @click.prevent="setToYesterday(close)"
        >
          {{ props.i18n.yesterday }}
        </a>
      </li>
      <li>
        <a
          href="#"
          class="vtd-shortcuts block text-sm lg:text-xs px-2 py-2 sm:leading-4 whitespace-nowrap font-medium rounded-sm text-vtd-primary-600 hover:text-vtd-primary-700 transition-colors hover:bg-vtd-secondary-100 focus:bg-vtd-secondary-100 focus:text-vtd-primary-600 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-primary-300 dark:text-vtd-primary-400 dark:focus:bg-vtd-secondary-700 dark:focus:text-vtd-primary-300"
          @click.prevent="setToLastDay(7, close)"
        >
          {{ props.i18n.past(7) }}
        </a>
      </li>
      <li>
        <a
          href="#"
          class="vtd-shortcuts block text-sm lg:text-xs px-2 py-2 sm:leading-4 whitespace-nowrap font-medium rounded-sm text-vtd-primary-600 hover:text-vtd-primary-700 transition-colors hover:bg-vtd-secondary-100 focus:bg-vtd-secondary-100 focus:text-vtd-primary-600 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-primary-300 dark:text-vtd-primary-400 dark:focus:bg-vtd-secondary-700 dark:focus:text-vtd-primary-300"
          @click.prevent="setToLastDay(30, close)"
        >
          {{ props.i18n.past(30) }}
        </a>
      </li>
      <li>
        <a
          href="#"
          class="vtd-shortcuts block text-sm lg:text-xs px-2 py-2 sm:leading-4 whitespace-nowrap font-medium rounded-sm text-vtd-primary-600 hover:text-vtd-primary-700 transition-colors hover:bg-vtd-secondary-100 focus:bg-vtd-secondary-100 focus:text-vtd-primary-600 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-primary-300 dark:text-vtd-primary-400 dark:focus:bg-vtd-secondary-700 dark:focus:text-vtd-primary-300"
          @click.prevent="setToThisMonth(close)"
        >
          {{ props.i18n.currentMonth }}
        </a>
      </li>
      <li>
        <a
          href="#"
          class="vtd-shortcuts block text-sm lg:text-xs px-2 py-2 sm:leading-4 whitespace-nowrap font-medium rounded-sm text-vtd-primary-600 hover:text-vtd-primary-700 transition-colors hover:bg-vtd-secondary-100 focus:bg-vtd-secondary-100 focus:text-vtd-primary-600 dark:hover:bg-vtd-secondary-700 dark:hover:text-vtd-primary-300 dark:text-vtd-primary-400 dark:focus:bg-vtd-secondary-700 dark:focus:text-vtd-primary-300"
          @click.prevent="setToLastMonth(close)"
        >
          {{ props.i18n.pastMonth }}
        </a>
      </li>
    </ol>
  </div>
</template>
