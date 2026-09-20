<script setup>
  import DemoLayout from './DemoLayout.vue'
  import VueTailwindDatePicker from '../src/VueTailwindDatePicker.vue'
  import { ref } from 'vue'

  const dateValue1 = ref([])
  const dateValue2 = ref([])
  const dateValue3 = ref([])
  const dateValue4 = ref([])
  const dateValue5 = ref([])
  const dateValue6 = ref([])
  const dateValue7 = ref([])
  const dateValue8 = ref([])
  const dateValue9 = ref([])
  const dateValue10 = ref([])
  const dateValue11 = ref([])
  const dateValue12 = ref([])
  const dateValue13 = ref([])
  const dateValue14 = ref([])
  const dateValue15 = ref([])
  const dateValue16 = ref([])
  const dateValue17 = ref([])
  const dateValue18 = ref([])
  const dateValue19 = ref([])
  const formatter = ref({
    date: 'DD MMM YYYY',
    month: 'MMM'
  })
  const startFrom = new Date(2020, 0, 1)
  const dDate = (date) => {
    return date < new Date() || date > new Date(2023, 0, 8);
  }
  const options = ref({
    shortcuts: {
      today: 'Hari ini',
      yesterday: 'Kemarin',
      past: period => period + ' hari terakhir',
      currentMonth: 'Bulan ini',
      pastMonth: 'Bulan lalu'
    },
    footer: {
      apply: 'Terapkan',
      cancel: 'Batal'
    }
  })
</script>

# Props

All available `props`, to setting up Vue Tailwind Datepicker.

## Default Configuration

The datepicker if you don't set any `props`.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue1"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" />
</template>
```

## Overlay

Using datepicker with backdrop, by default `overlay` is false.

<DemoLayout>
  <VueTailwindDatePicker
    :overlay="true"
    v-model="dateValue2"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" overlay />
</template>
```

## Input classes

You can apply apply your own input classes using Tailwind CSS.

<DemoLayout>
  <VueTailwindDatePicker
    input-classes="text-sm bg-red-100 border-red-200 rounded-xs text-slate-800 font-medium dark:bg-red-800 dark:text-slate-800 border border-solid dark:border-red-200"
    v-model="dateValue15"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    input-classes="block mb-2 text-sm font-medium text-green-700 dark:text-green-500"
  />
</template>
```

## Disabled

The datepicker can be fully disabled as well.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue1"
		:disabled="true"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" :disabled="true" />
</template>
```

## Single Date

Using date picker as single date.

<DemoLayout>
  <VueTailwindDatePicker
    as-single
    v-model="dateValue3"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" as-single />
</template>
```

## Use Range

Using date picker as single date, but datepicker with range.

<DemoLayout>
  <VueTailwindDatePicker
    as-single
    use-range
    v-model="dateValue4"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" as-single use-range />
</template>
```

## Placeholder

Change placeholder, by default placeholder use `formatter.date` object.

<DemoLayout>
  <VueTailwindDatePicker
    placeholder="My Placeholder"
    v-model="dateValue5"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" placeholder="My Placeholder" />
</template>
```

## Separator

Change placeholder, by default placeholder use `formatter.date` object.

<DemoLayout>
  <VueTailwindDatePicker
    separator=" to "
    v-model="dateValue6"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" separator=" to " />
</template>
```

## Without Input

Display Datepicker only without input

<DemoLayout>
  <VueTailwindDatePicker
    :no-input="true"
    :as-single="true"
    v-model="dateValue13"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" no-input />
</template>
```

## Color mode

Control how datepicker pick dark/light look, via `colorMode` prop. By default `colorMode` is `auto`: follow nearest ancestor `.dark` class (same as your Tailwind dark-mode toggle) or OS `prefers-color-scheme` if no ancestor toggle. Use `dark` or `light` to force appearance regardless of ancestor class or OS setting.

<DemoLayout>
  <VueTailwindDatePicker
    color-mode="dark"
    v-model="dateValue18"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" color-mode="dark" />
</template>
```

<DemoLayout>
  <VueTailwindDatePicker
    color-mode="light"
    v-model="dateValue19"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<template>
  <vue-tailwind-datepicker v-model="dateValue" color-mode="light" />
</template>
```

## Formatter

Change formatter, default `formatter`:

```js
  {
    date: 'YYYY-MM-DD HH:mm:ss',
    month: 'MMM'
  }
```

<DemoLayout>
  <VueTailwindDatePicker
    :formatter="formatter"
    v-model="dateValue7"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
const formatter = ref({
  date: 'DD MMM YYYY',
  month: 'MMM',
})
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" :formatter="formatter" />
</template>
```

## Auto apply

Change auto apply, by default `autoApply` is true.

<DemoLayout>
  <VueTailwindDatePicker
    :auto-apply="false"
    v-model="dateValue8"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" :auto-apply="false" />
</template>
```

## Start from

Change start from of datepicker, by default `startFrom` is new Date().

<DemoLayout>
  <VueTailwindDatePicker
    :start-from="startFrom"
    v-model="dateValue9"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
const startFrom = new Date(2020, 0, 1)
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" :start-from="startFrom" />
</template>
```

## Weekdays size

If you need to use a minimum number of characters for the name of the days of the week (Sun -> Su, Mon -> Mo, etc.), use `min`, by default `weekdaysSize` is `short` (Sun, Mon, etc.).

<DemoLayout>
  <VueTailwindDatePicker
    weekdays-size="min"
    v-model="dateValue16"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" weekdays-size="min" />
</template>
```

## Week number

If you want to show week number in the calendar

<DemoLayout>
  <VueTailwindDatePicker
    week-number
    v-model="dateValue16"
  />
</DemoLayout>


## Shortcuts

Display or not the dates shortcuts, default value is true.

<DemoLayout>
  <VueTailwindDatePicker
    :shortcuts="false"
    v-model="dateValue10"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" :shortcuts="false" />
</template>
```

## Disable date

Disable some dates in range.

<DemoLayout>
  <VueTailwindDatePicker
    :disable-date="dDate"
    v-model="dateValue14"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
function dDate(date) {
  return date < new Date() || date > new Date(2023, 0, 8)
}
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" :disable-date="dDate" />
</template>
```

## Slot

Two slot are available, a global one that surround the full input and a smaller one just for the icon in the input

### Global slot

<DemoLayout>
  <div class="flex">
    <VueTailwindDatePicker
      v-model="dateValue11"
      v-slot="{ value, placeholder, clear }"
    >
      <div class="flex">
        <div class="flex-1">
          <button
            type="button"
            class="block w-full bg-gray-50 text-gray-400 hover:text-gray-900 leading-6 py-3 sm:px-6 border border-gray-200 rounded-xl items-center justify-center space-x-2 sm:space-x-4 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-300 focus:outline-hidden transition ease-out duration-300"
          >
            <span class="text-gray-900">
              {{ value || placeholder }}
            </span>
          </button>
        </div>
        <div class="shrink-0">
          <button
            type="button"
            class="ml-4 block px-3 flex-none bg-indigo-50 text-indigo-400 hover:text-indigo-900 leading-6 py-3 sm:px-6 border border-indigo-200 rounded-xl items-center justify-center space-x-2 sm:space-x-4 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-300 focus:outline-hidden transition ease-out duration-300"
            @click="clear"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </VueTailwindDatePicker>
  </div>
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
</script>

<template>
  <div class="flex">
    <vue-tailwind-datepicker
      v-slot="{ value, placeholder, clear }"
      v-model="dateValue"
    >
      <div class="flex">
        <div class="flex-1">
          <button
            type="button"
            class="block w-full bg-gray-50 text-gray-400 hover:text-gray-900 leading-6 py-3 sm:px-6 border border-gray-200 rounded-xl items-center justify-center space-x-2 sm:space-x-4 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-300 focus:outline-hidden transition ease-out duration-300"
          >
            <span class="text-gray-900">
              {{ value || placeholder }}
            </span>
          </button>
        </div>
        <div class="shrink-0">
          <button
            type="button"
            class="ml-4 block px-3 flex-none bg-indigo-50 text-indigo-400 hover:text-indigo-900 leading-6 py-3 sm:px-6 border border-indigo-200 rounded-xl items-center justify-center space-x-2 sm:space-x-4 focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-300 focus:outline-hidden transition ease-out duration-300"
            @click="clear"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </vue-tailwind-datepicker>
  </div>
</template>
```

### inputIcon slot

<DemoLayout>
  <div class="flex">
    <VueTailwindDatePicker v-model="dateValue17">
      <template #inputIcon="{ value }">
        {{ value ? 'delete icon' : "calendar icon" }}
      </template>
    </VueTailwindDatePicker>
  </div>
</DemoLayout>

```vue
  <VueTailwindDatePicker
    v-model="dateValue"
  >
    <template #inputIcon="{ value }">
      {{ value ? 'delete icon' : "calendar icon" }}
    </template>
  </VueTailwindDatePicker>
```


## Options

Change default options

<DemoLayout>
  <VueTailwindDatePicker
    :options="options" :auto-apply="false"
    v-model="dateValue12"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from 'vue'

const dateValue = ref([])
const options = ref({
  shortcuts: {
    today: 'Hari ini',
    yesterday: 'Kemarin',
    past: period => `${period} hari terakhir`,
    currentMonth: 'Bulan ini',
    pastMonth: 'Bulan lalu',
  },
  footer: {
    apply: 'Terapkan',
    cancel: 'Batal',
  },
})
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    :options="options"
    :auto-apply="false"
  />
</template>
```
