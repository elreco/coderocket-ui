<script setup>
  import DemoLayout from './DemoLayout.vue'
  import VueTailwindDatePicker from '../src/VueTailwindDatePicker.vue'
  import dayjs from 'dayjs'
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

  const onSelectSomething = (newDate, calendar) => {
    console.log('is dayjs instance:', newDate instanceof dayjs)
    console.log('formatted date:', newDate.format('YYYY-MM-DD HH:mm:ss'))
    console.log('calendar:', calendar)
  }

  const onClickSomething = (newDate, calendar) => {
    console.log('is dayjs instance:', newDate instanceof dayjs)
    console.log('formatted date:', newDate.format('YYYY-MM-DD HH:mm:ss'))
    console.log('calendar:', calendar)
  }
</script>

# Events

## selectMonth

Changed month event from dropdown for left/single calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue1"
    @select-month="onSelectSomething($event, 'left')"
  />
</DemoLayout>
<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue2"
    as-single
    @select-month="onSelectSomething($event, 'single')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onSelectSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @select-month="onSelectSomething($event)"
  />
  <vue-tailwind-datepicker
    v-model="dateValue"
    as-single
    @select-month="onSelectSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::

## selectYear

Changed year event from dropdown for left/single calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue3"
    @select-year="onSelectSomething($event, 'single')"
  />
</DemoLayout>
<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue4"
    as-single
    @select-year="onSelectSomething($event, 'single')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onSelectSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @select-year="onSelectSomething($event)"
  />
  <vue-tailwind-datepicker
    v-model="dateValue"
    as-single
    @select-year="onSelectSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::

## selectRightMonth

Changed month event from dropdown for right calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue5"
    @select-right-month="onSelectSomething($event, 'right')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onClickSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @select-right-month="onSelectSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::

## selectRightYear

Changed year event from dropdown for right calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue6"
    @select-right-year="onSelectSomething($event, 'right')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onSelectSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @select-right-year="onSelectSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::

## clickPrev

Click previous button event for left/single calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue7"
    @click-prev="onClickSomething($event, 'left')"
  />
</DemoLayout>
<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue8"
    as-single
    @click-prev="onClickSomething($event, 'single')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onClickSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @click-prev="onClickSomething($event)"
  />
  <vue-tailwind-datepicker
    v-model="dateValue"
    as-single
    @click-prev="onClickSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::

## clickNext

Click next button event for left/single calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue9"
    @click-next="onClickSomething($event, 'left')"
  />
</DemoLayout>
<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue10"
    as-single
    @click-next="onClickSomething($event, 'single')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onClickSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @click-next="onClickSomething($event)"
  />
  <vue-tailwind-datepicker
    v-model="dateValue"
    as-single
    @click-next="onClickSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::

## clickRightPrev

Click previous button event for right calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue11"
    @click-right-prev="onClickSomething($event, 'right')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onClickSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @click-right-prev="onClickSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::

## clickRightNext

Click next button event for right calendar.

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue12"
    @click-right-next="onClickSomething($event, 'right')"
  />
</DemoLayout>

```vue
<script setup>
import { ref } from "vue";
const dateValue = ref([]);

const onClickSomething = (newDate) => {
  console.log(newDate); // newDate instanceof dayjs
};
</script>

<template>
  <vue-tailwind-datepicker
    v-model="dateValue"
    @click-right-next="onClickSomething($event)"
  />
</template>
```

::: info
The same works with `no-input` prop.
:::
