export default function useDom() {
  const useVisibleViewport = (el: HTMLElement | null) => {
    if (el) {
      const { right } = el.getBoundingClientRect()
      const vWidth = window.innerWidth || document.documentElement.clientWidth
      return right > vWidth
    }
    else {
      return null
    }
  }

  return {
    useVisibleViewport,
  }
}
