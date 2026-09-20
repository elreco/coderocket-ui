<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'
import type { Dayjs } from 'dayjs'
import VueTailwindDatePicker from './VueTailwindDatePicker.vue'

const dateValue = ref({
  startDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  endDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
})

const currentLocale = ref('fr')
const locales = ['en', 'fr', 'es', 'de']

function onClickSomething(e: Dayjs) {
  console.log(e)
}

function onSelectSomething(e: Dayjs) {
  console.log(e)
}
</script>

<template>
  <div class="p-10 bg-sky-50 min-h-screen">
    <label>
      Choose one locale
      <select v-model="currentLocale" name="language" class="mb-6">
        <option v-for="locale in locales" :key="locale" :value="locale">
          {{ locale }}
        </option>
      </select>
    </label>
    <div class="grid grid-rows-2 gap-4">
      <VueTailwindDatePicker v-model="dateValue" :i18n="currentLocale" @select-month="onSelectSomething($event)"
        @select-year="onSelectSomething($event)" @select-right-month="onSelectSomething($event)"
        @select-right-year="onSelectSomething($event)" @click-prev="onClickSomething($event)"
        @click-next="onClickSomething($event)" @click-right-prev="onClickSomething($event)"
        @click-right-next="onClickSomething($event)" />

      <VueTailwindDatePicker v-model="dateValue.startDate" as-single :i18n="currentLocale" />
    </div>
  </div>
</template>
