// Import vue component
import type { App } from 'vue'
import component from './VueTailwindDatePicker.vue'

// Default export is installable instance of component.
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),
export default /* #__PURE__ */ (() => {
  // Get component instance
  const installable = component

  // Attach install function executed by Vue.use()
  installable.install = (app: App) => {
    app.component('VueTailwindDatepicker', installable)
  }
  return installable
})()
