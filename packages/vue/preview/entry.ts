import { createApp, shallowReactive, h, nextTick } from "vue";
import Preview from "./preview.vue";
import "../src/styles.css";
import "../../blocks/src/styles.css";
import type { DesignSystem } from "@coderocket/engine";
import type { Composition } from "@coderocket/specs/composition";
export type PreviewProps = {
  system: DesignSystem;
  kind?: "component" | "block" | "application" | "composition";
  slug?: string;
  composition?: Composition;
};
export function mount(element: HTMLElement, initial: PreviewProps) {
  const props = shallowReactive({ ...initial });
  const app = createApp({ render: () => h(Preview, props) });
  app.mount(element);
  return {
    async update(next: PreviewProps) {
      Object.assign(
        props,
        { kind: undefined, slug: undefined, composition: undefined },
        next,
      );
      await nextTick();
    },
    unmount() {
      app.unmount();
    },
  };
}
