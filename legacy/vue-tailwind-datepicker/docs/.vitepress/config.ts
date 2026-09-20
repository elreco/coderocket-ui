import type { UserConfig } from 'vitepress'
import { version } from '../../package.json'

const canonicalOrigin = 'https://vue-tailwind-datepicker.com'
const description = 'Documentation for the frozen Vue 3 datepicker: installation, date ranges, localization and customization. Existing npm releases remain available.'
const pageDescriptions: Record<string, string> = {
  'installation.md': 'Install the historical Vue Tailwind Datepicker package in Vue 3. Existing npm releases remain available; discover the React and Vue components in CodeRocket UI.',
  'demo.md': 'Try the historical Vue Tailwind Datepicker: single dates, date ranges and customizable date selections for Vue 3.',
  'props.md': 'Vue Tailwind Datepicker prop reference: selection modes, date limits, disabled dates, localization, shortcuts and formatting.',
  'events.md': 'Vue Tailwind Datepicker events and v-model integration for handling date selection in your Vue 3 application.',
  'theming-options.md': 'Customize the historical Vue Tailwind Datepicker with Tailwind CSS themes, colors and appearance options.',
  'advanced-features.md': 'Configure advanced Vue Tailwind Datepicker features including custom presets, internationalization and date constraints.',
}

// The mirror may use DOCS_BASE, but the historical custom domain remains canonical.
function canonicalPage(path: string) {
  return new URL(path.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '.html'), `${canonicalOrigin}/`).href
}

export default {
  base: process.env.DOCS_BASE || '/',
  title: 'Vue Tailwind Datepicker',
  lastUpdated: true,
  description,
  sitemap: { hostname: canonicalOrigin },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: `${process.env.DOCS_BASE || '/'}logo.png` }],
  ],
  transformPageData(pageData) {
    if (!pageData.frontmatter.description) {
      pageData.description = pageDescriptions[pageData.relativePath] || description
    }
  },
  transformHead({ pageData, title, description: pageDescription }) {
    if (pageData.relativePath === '404.md') {
      return [['meta', { name: 'robots', content: 'noindex, follow' }]]
    }
    const url = canonicalPage(pageData.relativePath)
    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:site_name', content: 'Vue Tailwind Datepicker' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: `${canonicalOrigin}/logo.png` }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
    ]
  },
  themeConfig: {
    search: {
      provider: 'local'
    },
    /* logo: 'https://github.com/elreco/vue-tailwind-datepicker/blob/main/docs/logo.png?raw=true', */
    socialLinks: [{ icon: 'github', link: 'https://github.com/elreco/coderocket-ui/tree/main/legacy/vue-tailwind-datepicker' }],
    footer: {
      message: 'Released under the MIT License.',
      copyright: `Copyright © ${new Date().getFullYear()} Alexandre Le Corre`
    },
    sidebar: [
      {
        text: 'Get Started',
        items: [
          { text: 'Installation', link: '/installation' },
          { text: 'Demo', link: '/demo' }
        ]
      },
      {
        text: 'Customization',
        items: [
          { text: 'Theming options', link: '/theming-options' },
          { text: 'Props', link: '/props' },
          { text: 'Events', link: '/events' },
          { text: 'Advanced Features', link: '/advanced-features' },
        ]
      },
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Get Started', link: '/installation' },
      { text: 'Demo', link: '/demo' },
      {
        text: version,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/elreco/vue-tailwind-datepicker/releases'
          },
        ]
      }
    ]
  },
  vite: {
    optimizeDeps: {
      include: ['@headlessui/vue', 'dayjs'],
      exclude: []
    },
  }
} satisfies UserConfig
