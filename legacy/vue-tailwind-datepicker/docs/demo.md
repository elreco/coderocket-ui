<script setup>
  import DemoLayout from './DemoLayout.vue'
  import VueTailwindDatePicker from '../src/VueTailwindDatePicker.vue'
  import { ref } from 'vue'

  const dateValue = ref('')
</script>

# Demo

::: tip
Install `@coderocketapp/vue-tailwind-datepicker` to use this frozen version. It is no longer maintained.
See the [installation guide](./installation.md) for the stylesheet and migration instructions.
:::

<DemoLayout>
  <VueTailwindDatePicker
    v-model="dateValue"
  ></VueTailwindDatePicker>
</DemoLayout>

```vue
<script setup>
import VueTailwindDatePicker from "@coderocketapp/vue-tailwind-datepicker";
import { ref } from "vue";

const dateValue = ref("");
</script>

<template>
  <vue-tailwind-datepicker v-model="dateValue" />
</template>
```
