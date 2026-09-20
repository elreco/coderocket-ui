import { inject, shallowRef, type InjectionKey } from "vue";
import type { DisplayContent } from "./display-types";
export interface ToastAction {
  children?: DisplayContent;
  label?: string;
  altText?: string;
  onClick?: (event: MouseEvent) => void;
  disabled?: boolean;
}
export interface ToastOptions<Data extends object = Record<string, unknown>> {
  id?: string;
  title?: DisplayContent;
  description?: DisplayContent;
  type?: string;
  timeout?: number;
  priority?: "low" | "high";
  actionProps?: ToastAction;
  data?: Data;
  onClose?: () => void;
  onRemove?: () => void;
}
export interface ToastObject<
  Data extends object = Record<string, unknown>,
> extends ToastOptions<Data> {
  id: string;
  open: boolean;
  updateKey: number;
}
export type ToastUpdate<Data extends object = Record<string, unknown>> =
  Partial<Omit<ToastOptions<Data>, "id">>;
export interface ToastPromiseOptions<
  Value,
  Data extends object = Record<string, unknown>,
> {
  loading: string | ToastUpdate<Data>;
  success:
    string | ToastUpdate<Data> | ((value: Value) => string | ToastUpdate<Data>);
  error:
    | string
    | ToastUpdate<Data>
    | ((error: unknown) => string | ToastUpdate<Data>);
}
export interface ToastManager<Data extends object = Record<string, unknown>> {
  readonly toasts: readonly ToastObject<Data>[];
  add: (options: ToastOptions<Data>) => string;
  update: (
    id: string,
    options:
      ToastUpdate<Data> | ((previous: ToastObject<Data>) => ToastUpdate<Data>),
  ) => void;
  close: (id?: string) => void;
  promise: <Value>(
    promise: Promise<Value>,
    options: ToastPromiseOptions<Value, Data>,
  ) => Promise<Value>;
}
export const toastManagerKey: InjectionKey<ToastManager> = Symbol(
  "coderocket-toast-manager",
);
let nextId = 0;
/** Can be created outside Vue and passed to ToastProvider as `toast-manager`. */
export function createToastManager<
  Data extends object = Record<string, unknown>,
>(): ToastManager<Data> {
  const state = shallowRef<ToastObject<Data>[]>([]);
  const removals = new Map<string, ReturnType<typeof setTimeout>>();
  const manager: ToastManager<Data> = {
    get toasts() {
      return state.value;
    },
    add(options) {
      const id = options.id ?? `cr-toast-${++nextId}`;
      const old = state.value.find((toast) => toast.id === id);
      const pending = removals.get(id);
      if (pending) {
        clearTimeout(pending);
        removals.delete(id);
      }
      const toast = {
        ...old,
        ...options,
        id,
        open: true,
        updateKey: (old?.updateKey ?? 0) + 1,
      };
      state.value = old
        ? state.value.map((item) => (item.id === id ? toast : item))
        : [...state.value, toast];
      return id;
    },
    update(id, options) {
      const old = state.value.find((toast) => toast.id === id);
      if (!old) return;
      const next = typeof options === "function" ? options(old) : options;
      state.value = state.value.map((toast) =>
        toast.id === id
          ? { ...toast, ...next, updateKey: toast.updateKey + 1 }
          : toast,
      );
    },
    close(id) {
      const closing = state.value.filter(
        (toast) => toast.open && (id === undefined || toast.id === id),
      );
      const ids = new Set(closing.map((toast) => toast.id));
      state.value = state.value.map((toast) =>
        ids.has(toast.id) ? { ...toast, open: false } : toast,
      );
      for (const toast of closing) {
        toast.onClose?.();
        removals.set(
          toast.id,
          setTimeout(() => {
            removals.delete(toast.id);
            state.value = state.value.filter((item) => item.id !== toast.id);
            toast.onRemove?.();
          }, 200),
        );
      }
    },
    async promise(promise, options) {
      const normalize = (
        value: string | ToastUpdate<Data>,
      ): ToastUpdate<Data> =>
        typeof value === "string" ? { title: value } : value;
      const loading = normalize(options.loading);
      const id = manager.add({
        ...loading,
        timeout: 0,
        type: loading.type ?? "loading",
      });
      try {
        const result = await promise;
        const success = normalize(
          typeof options.success === "function"
            ? options.success(result)
            : options.success,
        );
        manager.update(id, {
          timeout: undefined,
          ...success,
          type: success.type ?? "success",
        });
        return result;
      } catch (error) {
        const failure = normalize(
          typeof options.error === "function"
            ? options.error(error)
            : options.error,
        );
        manager.update(id, {
          timeout: undefined,
          ...failure,
          type: failure.type ?? "error",
        });
        throw error;
      }
    },
  };
  return manager;
}
export function useToast(): ToastManager {
  const manager = inject(toastManagerKey, undefined);
  if (!manager)
    throw new Error("useToast() must be used inside a ToastProvider.");
  return manager;
}
