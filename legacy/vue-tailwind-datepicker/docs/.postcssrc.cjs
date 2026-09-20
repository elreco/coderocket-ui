module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      autoprefixer: { flexbox: 'no-2009' },
      features: { 'custom-properties': false },
      stage: 3
    },
    'postcss-prefix-selector': {
      prefix: ':not(:where(.vp-raw *))',
      includeFiles: [/vp-doc\.css/],
      transform(prefix, _selector) {
        const [selector, pseudo = ''] = _selector.split(/(:\S*)$/)
        return selector + prefix + pseudo
      }
    }
  }
}