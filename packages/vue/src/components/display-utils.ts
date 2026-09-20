import {
  computed,
  ref,
  unref,
  type FunctionalComponent,
  type VNodeChild,
} from "vue";
import type { FocusTarget } from "./display-types";
/** Renders Vue nodes supplied in a data collection, without stringifying them. */
export const RenderContent: FunctionalComponent<{ content?: VNodeChild }> = (
  props,
) => props.content;
RenderContent.props = ["content"];
export function useDisplayModel<T>(
  read: () => T | undefined,
  initial: T,
  emit: (value: T) => void,
) {
  const local = ref(initial) as import("vue").Ref<T>;
  return computed({
    get: () => (read() === undefined ? local.value : (read() as T)),
    set: (value) => {
      if (read() === undefined) local.value = value;
      emit(value);
    },
  });
}
export function focusTarget(event: Event, target?: FocusTarget) {
  if (target === undefined || target === true) return;
  event.preventDefault();
  if (target === false) return;
  const element = typeof target === "function" ? target() : unref(target);
  element?.focus();
}
