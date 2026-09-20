import './tailwind.postcss'
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'

const maintenanceNotice = () => h('aside', {
  'aria-label': 'Maintenance status',
  style: {
    margin: '24px auto',
    padding: '16px 20px',
    maxWidth: '1152px',
    border: '1px solid var(--vp-c-divider)',
    borderRadius: '8px',
    background: 'var(--vp-c-bg-soft)',
    fontSize: '14px',
    lineHeight: '1.7',
  },
}, [
  h('strong', 'Frozen legacy package. '),
  'Vue Tailwind Datepicker is no longer maintained. Existing npm releases remain available, but no new fixes or releases are planned. ',
  h('a', {
    href: 'https://ui.coderocket.app',
    style: { color: 'var(--vp-c-brand-1)', textDecoration: 'underline' },
  }, 'Explore CodeRocket UI for React and Vue.'),
])

export default {
  ...DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': maintenanceNotice,
    'home-hero-before': maintenanceNotice,
  }),
}
