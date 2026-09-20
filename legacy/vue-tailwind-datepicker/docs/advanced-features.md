<script setup>
  import DemoLayout from './DemoLayout.vue'
  import VueTailwindDatePicker from '../src/VueTailwindDatePicker.vue'
  import { ref } from 'vue'

  const dateValue1 = ref([])
  const dateValue2 = ref({
    startDate: '',
    endDate: ''
  })
  const dateValue3 = ref('')
  const dateValue4 = ref([])
  const dateValue5 = ref([])
  const customShortcuts = () => {
    return [
      {
        label: 'Last 15 Days',
        atClick: () => {
          const date = new Date();
          return [
            new Date(date.setDate(date.getDate() - 14)), 
            new Date()
          ];
        }
      },
      {
        label: 'Last Years',
        atClick: () => {
          const date = new Date();
          return [
            new Date(date.setFullYear(date.getFullYear() - 1)),
            new Date()
          ];
        }
      }
    ];
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

# Advanced Features

You can also access to advanced features like if you need different `model` values, apply a different language or customizing your shortcuts.

## Use Array

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue1"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
// use Array as model
const dateValue = ref([]);
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" />
</template>
```

## Use Object

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue2"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
// use Object as model
const dateValue = ref({
  startDate: "",
  endDate: "",
});
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" />
</template>
```

## Use String

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue3"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
// use String as model
const dateValue = ref("");
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" />
</template>
```

## Custom shortcuts

Create your custom shortcuts.

<DemoLayout>
  <VueTailwindDatePicker
    :shortcuts="customShortcuts"
    v-model="dateValue4"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);
const customShortcuts = () => {
  return [
    {
      label: "Last 15 Days",
      atClick: () => {
        const date = new Date();
        return [new Date(date.setDate(date.getDate() + 1)), date];
      },
    },
    {
      label: "Last Years",
      atClick: () => {
        const date = new Date();
        return [new Date(date.setFullYear(date.getFullYear() - 1)), new Date()];
      },
    },
  ];
};
</script>

<template>
  <vue-tailwind-datepicker :shortcuts="customShortcuts" v-model="dateValue" />
</template>
```

## Localization (i18n)

Vue Tailwind Datepicker extend to day.js<br>
[List of supported locales](https://github.com/iamkun/dayjs/tree/dev/src/locale)

<DemoLayout>
  <VueTailwindDatePicker
    i18n="fr"
    :auto-apply="false"
    :options="options"
    v-model="dateValue5"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);
const options = ref({
  shortcuts: {
    today: "Hari ini",
    yesterday: "Kemarin",
    past: (period) => period + " hari terakhir",
    currentMonth: "Bulan ini",
    pastMonth: "Bulan lalu",
  },
  footer: {
    apply: "Terapkan",
    cancel: "Batal",
  },
});
</script>

<template>
  <vue-tailwind-datepicker
    i18n="id"
    :auto-apply="false"
    :options="options"
    v-model="dateValue"
  />
</template>
```
