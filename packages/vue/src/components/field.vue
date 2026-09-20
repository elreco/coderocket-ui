<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  provide,
  ref,
  useId,
  useSlots,
} from "vue";
import { cx, FieldKey, useFormReset } from "./utils";
import { fieldControl, useFieldFormValidation } from "./field-validation";
const props = withDefaults(
  defineProps<{
    label?: string;
    description?: string;
    error?: string;
    invalid?: boolean;
    disabled?: boolean;
    name?: string;
    id?: string;
    className?: string;
    validationMode?: "onBlur" | "onChange" | "onSubmit";
    validationDebounceTime?: number;
    validate?: (
      value: string,
      formValues: Record<string, FormDataEntryValue>,
    ) =>
      | string
      | string[]
      | null
      | undefined
      | Promise<string | string[] | null | undefined>;
  }>(),
  { validationMode: "onBlur", validationDebounceTime: 0 },
);
const slots = useSlots();
const generatedId = useId();
const id = props.id ?? `cr-field-${generatedId}`;
const controlId = ref(id);
const root = ref<HTMLElement>();
const validationError = ref("");
const invalid = computed(() =>
  Boolean(props.error || slots.error || props.invalid || validationError.value),
);
const errorText = computed(() => props.error || validationError.value);
const describedBy = computed(
  () =>
    [
      props.description || slots.description ? `${id}-description` : "",
      errorText.value || slots.error ? `${id}-error` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined,
);
provide(FieldKey, {
  id,
  name: computed(() => props.name),
  disabled: computed(() => !!props.disabled),
  invalid,
  describedBy,
  controlId,
  notifyChange: () => {
    void nextTick(() => input({ target: fieldControl(root.value) ?? null }));
  },
});
const controlProps = computed(() => ({
  id: controlId.value,
  name: props.name,
  disabled: props.disabled,
  "aria-invalid": invalid.value || undefined,
  "aria-describedby": describedBy.value,
}));
let revision = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
function isControl(
  target: EventTarget | null | undefined,
): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
async function validate(
  target: EventTarget | null | undefined,
): Promise<boolean> {
  if (!isControl(target)) target = fieldControl(root.value);
  if (!isControl(target) || target.disabled) return true;
  const current = ++revision;
  let result: string | string[] | null | undefined;
  try {
    result = await props.validate?.(
      target instanceof HTMLInputElement &&
        ["checkbox", "radio"].includes(target.type) &&
        !target.checked
        ? ""
        : target.value,
      target.form ? Object.fromEntries(new FormData(target.form)) : {},
    );
  } catch {
    result = "Validation could not be completed. Please try again.";
  }
  if (current !== revision) return false;
  const custom = Array.isArray(result) ? result.join(" ") : result || "";
  target.setCustomValidity(custom);
  validationError.value = custom || target.validationMessage || "";
  return target.validity.valid;
}
function input(event: Pick<Event, "target">) {
  revision++;
  validationError.value = "";
  if (isControl(event.target)) event.target.setCustomValidity("");
  if (props.validationMode === "onChange") {
    clearTimeout(timer);
    const target = event.target;
    timer = setTimeout(
      () => void validate(target),
      props.validationDebounceTime,
    );
  }
}
function invalidEvent(event: Event) {
  void validate(event.target);
}
useFieldFormValidation(
  root,
  () => Boolean(props.validate) && !props.disabled,
  () => validate(fieldControl(root.value)),
);
useFormReset(
  root,
  () => {
    revision++;
    clearTimeout(timer);
    validationError.value = "";
    root.value
      ?.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("input,textarea,select")
      .forEach((control) => control.setCustomValidity(""));
  },
  () => fieldControl(root.value)?.getAttribute("form") ?? undefined,
);
onBeforeUnmount(() => {
  revision++;
  clearTimeout(timer);
});
</script>
<template>
  <div
    ref="root"
    :class="cx('cr-field', className)"
    :data-invalid="invalid ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    @invalid.capture="invalidEvent"
    @input="input"
    @focusout="validationMode === 'onBlur' && validate($event.target)"
  >
    <label :for="controlId" class="cr-label"
      ><slot name="label">{{ label }}</slot></label
    >
    <p
      v-if="description || $slots.description"
      :id="`${id}-description`"
      class="cr-description"
    >
      <slot name="description">{{ description }}</slot>
    </p>
    <slot :control-props="controlProps" :invalid="invalid" />
    <p
      v-if="errorText || $slots.error"
      :id="`${id}-error`"
      role="alert"
      class="cr-field-error"
    >
      <slot name="error">{{ errorText }}</slot>
    </p>
  </div>
</template>
