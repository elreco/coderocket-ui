import { onBeforeUnmount, watchEffect, type Ref } from "vue";

type Check = () => Promise<boolean>;
interface FormValidation {
  checks: Set<Check>;
  pending: boolean;
  bypass: boolean;
  submit: (event: Event) => void;
}
const forms = new WeakMap<HTMLFormElement, FormValidation>();
export function fieldControl(root: HTMLElement | undefined) {
  return (
    root?.querySelector<HTMLInputElement>(
      'input[type="radio"][name]:checked',
    ) ??
    root?.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input[name],textarea[name],select[name]") ??
    root?.querySelector<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >("input,textarea,select")
  );
}
/** A form waits for all Fields together, then submits once with the original submitter. */
export function useFieldFormValidation(
  root: Ref<HTMLElement | undefined>,
  enabled: () => boolean,
  check: Check,
) {
  let detach: (() => void) | undefined;
  watchEffect(
    () => {
      detach?.();
      detach = undefined;
      if (!enabled()) return;
      const form = fieldControl(root.value)?.form;
      if (!form) return;
      let state = forms.get(form);
      if (!state) {
        const created: FormValidation = {
          checks: new Set(),
          pending: false,
          bypass: false,
          submit: () => {},
        };
        created.submit = (event: Event) => {
          if (created.bypass || event.defaultPrevented) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (created.pending) return;
          created.pending = true;
          const submitter = (event as SubmitEvent).submitter;
          void Promise.all([...created.checks].map((validate) => validate()))
            .then((results) => {
              if (
                !results.every(Boolean) ||
                !form.isConnected ||
                !created.checks.size
              )
                return;
              created.bypass = true;
              try {
                form.requestSubmit(
                  submitter instanceof HTMLButtonElement ||
                    submitter instanceof HTMLInputElement
                    ? submitter
                    : undefined,
                );
              } finally {
                created.bypass = false;
              }
            })
            .finally(() => {
              created.pending = false;
            });
        };
        state = created;
        forms.set(form, state);
        form.addEventListener("submit", state.submit, true);
      }
      state.checks.add(check);
      const owner = state;
      detach = () => {
        owner.checks.delete(check);
        if (!owner.checks.size) {
          form.removeEventListener("submit", owner.submit, true);
          forms.delete(form);
        }
      };
    },
    { flush: "post" },
  );
  onBeforeUnmount(() => detach?.());
}
