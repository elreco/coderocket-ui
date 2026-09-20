import {
  computed,
  inject,
  onBeforeUnmount,
  ref,
  watchEffect,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from "vue";

export const PortalContainerKey: InjectionKey<Ref<HTMLElement | undefined>> =
  Symbol("coderocket-portal");
export function usePortalContainer(): Ref<HTMLElement | undefined> {
  return inject(PortalContainerKey, ref<HTMLElement>());
}
export function cx(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(" ");
}
/** Both v-model and React-style value props are supported; v-model is preferred. */
export function useControllable<T>(
  model: Ref<T | undefined>,
  value: () => T | undefined,
  initial: () => T,
  change: (value: T) => void = () => {},
) {
  const state = ref(initial()) as Ref<T>;
  return computed<T>({
    get: () =>
      value() !== undefined
        ? (value() as T)
        : model.value !== undefined
          ? model.value
          : state.value,
    set: (next) => {
      state.value = next;
      model.value = next;
      change(next);
    },
  });
}
export interface FieldContext {
  id: string;
  name: ComputedRef<string | undefined>;
  disabled: ComputedRef<boolean>;
  invalid: ComputedRef<boolean>;
  describedBy: ComputedRef<string | undefined>;
  controlId: Ref<string>;
  notifyChange: () => void;
}
export const FieldKey: InjectionKey<FieldContext> = Symbol("coderocket-field");
export function useFieldControl(
  id: () => string | undefined = () => undefined,
) {
  const field = inject(FieldKey, undefined);
  watchEffect(() => {
    if (field && id()) field.controlId.value = id()!;
  });
  return {
    field,
    fieldAttrs: computed(() => ({
      id: id() ?? field?.id,
      name: field?.name.value,
      disabled: field?.disabled.value || undefined,
      "aria-invalid": field?.invalid.value || undefined,
      "aria-describedby": field?.describedBy.value,
    })),
  };
}
/** The native form reset event fires before the browser resets its controls. */
export function useFormReset(
  element: Ref<HTMLElement | null | undefined>,
  reset: () => void,
  form?: () => string | undefined,
) {
  let owner: HTMLFormElement | null = null;
  const handler = (event: Event) =>
    queueMicrotask(() => {
      if (!event.defaultPrevented) reset();
    });
  watchEffect(
    () => {
      const id = form?.();
      const node = element.value;
      const next = node
        ? id
          ? (node.ownerDocument.getElementById(id) as HTMLFormElement | null)
          : node.closest("form")
        : null;
      if (owner === next) return;
      owner?.removeEventListener("reset", handler);
      owner = next;
      owner?.addEventListener("reset", handler);
    },
    { flush: "post" },
  );
  onBeforeUnmount(() => owner?.removeEventListener("reset", handler));
}
