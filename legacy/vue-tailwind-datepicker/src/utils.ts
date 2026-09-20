import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export function injectStrict<T>(key: InjectionKey<T>, fallback?: T) {
  const resolved = inject(key, fallback)

  if (!resolved)
    throw new Error(`Could not resolve ${key.description}`)

  return resolved
}

export const localesMap = Object.fromEntries(
  Object.entries(import.meta.glob('../node_modules/dayjs/esm/locale/*.js', { import: 'default' })).map(
    ([path, loadLocale]) => [path.match(/([\w-]*)\.js$/)?.[1], loadLocale],
  ),
) as Record<string, () => Promise<ILocale>>

