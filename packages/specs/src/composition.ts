import { z } from "zod";
import { componentSpecs, blockSpecs, componentSpecSchema } from "./index";
const id = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
export const compositionNodeSchema = z
  .object({
    id,
    parent: id.nullable(),
    kind: z.enum([
      "stack",
      "row",
      "grid",
      "card",
      "form",
      "heading",
      "text",
      "button",
      "badge",
      "separator",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "select",
      "progress",
      "avatar",
      "file-upload",
    ]),
    text: z.string().max(600).default(""),
    description: z.string().max(600).default(""),
    name: z
      .string()
      .regex(/^[a-z][a-z0-9_-]{0,63}$/)
      .optional(),
    variant: z
      .enum([
        "primary",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "success",
        "warning",
      ])
      .optional(),
    inputType: z
      .enum(["text", "email", "password", "number", "url", "tel"])
      .optional(),
    required: z.boolean().optional(),
    options: z
      .array(
        z
          .object({
            value: z.string().min(1).max(80),
            label: z.string().min(1).max(100),
          })
          .strict(),
      )
      .max(30)
      .optional(),
    action: id.optional(),
    value: z.number().min(0).max(100).optional(),
    columns: z.number().int().min(1).max(4).optional(),
  })
  .strict();
export const compositionSchema = z
  .object({
    schemaVersion: z.literal(1),
    name: z.string().min(1).max(80),
    slug: id,
    kind: z.enum(["component", "block"]),
    description: z.string().min(1).max(600),
    nodes: z.array(compositionNodeSchema).min(1).max(80),
  })
  .strict();
export type Composition = z.infer<typeof compositionSchema>;
export type CompositionNode = z.infer<typeof compositionNodeSchema>;
const containers = new Set(["stack", "row", "grid", "card", "form"]);
const labelled = new Set([
  "heading",
  "button",
  "badge",
  "input",
  "textarea",
  "checkbox",
  "switch",
  "select",
  "progress",
  "avatar",
  "file-upload",
]);
export function validateComposition(raw: unknown): Composition {
  const composition = compositionSchema.parse(raw),
    nodes = new Map(composition.nodes.map((node) => [node.id, node]));
  if (
    componentSpecs.some((spec) => spec.slug === composition.slug) ||
    blockSpecs.some((spec) => spec.slug === composition.slug)
  )
    throw new Error(
      "This slug belongs to the existing catalogue. Choose a unique custom slug.",
    );
  const fieldNames = new Set<string>();
  if (nodes.size !== composition.nodes.length)
    throw new Error("Node ids must be unique.");
  if (composition.nodes.filter((node) => node.parent === null).length !== 1)
    throw new Error("Exactly one root is required.");
  for (const node of composition.nodes) {
    const seen = new Set<string>([node.id]);
    let parent = node.parent,
      depth = 0;
    while (parent !== null) {
      const item = nodes.get(parent);
      if (
        !item ||
        seen.has(parent) ||
        !containers.has(item.kind) ||
        ++depth > 10
      )
        throw new Error(
          "Invalid tree, unsupported parent or excessive nesting.",
        );
      seen.add(parent);
      parent = item.parent;
    }
    if (labelled.has(node.kind) && !node.text.trim())
      throw new Error(`${node.id} requires a visible label.`);
    if (
      [
        "input",
        "textarea",
        "select",
        "checkbox",
        "switch",
        "file-upload",
      ].includes(node.kind) &&
      !node.name
    )
      throw new Error(`${node.id} requires a field name.`);
    if (
      node.name &&
      [
        "input",
        "textarea",
        "select",
        "checkbox",
        "switch",
        "file-upload",
      ].includes(node.kind)
    ) {
      if (fieldNames.has(node.name))
        throw new Error("Field names must be unique.");
      fieldNames.add(node.name);
    }
    if (
      node.kind === "button" &&
      node.action === "submit" &&
      ![...seen].some((key) => nodes.get(key)?.kind === "form")
    )
      throw new Error("Submit buttons require a form.");
    if (
      node.kind === "select" &&
      (!node.options?.length ||
        new Set(node.options.map((item) => item.value)).size !==
          node.options.length)
    )
      throw new Error("Select options must have unique values.");
    if (["button", "form"].includes(node.kind) && !node.action)
      throw new Error(
        `${node.id} requires a named action for the integrating application.`,
      );
    if (
      node.kind === "form" &&
      [...seen].some(
        (key) => key !== node.id && nodes.get(key)?.kind === "form",
      )
    )
      throw new Error("Forms cannot be nested.");
  }
  return composition;
}
export function compositionSpec(input: Composition) {
  const composition = validateComposition(input);
  const dependencies = new Set<string>();
  for (const node of composition.nodes) {
    if (componentSpecs.some((spec) => spec.slug === node.kind))
      dependencies.add(node.kind);
    if (["input", "textarea", "select"].includes(node.kind))
      dependencies.add("field");
  }
  return componentSpecSchema.parse({
    schemaVersion: 1,
    name: composition.name,
    slug: composition.slug,
    description: composition.description,
    category: "Custom",
    anatomy: composition.nodes.map((node) => ({
      name: node.id,
      description: node.kind,
    })),
    variants: [{ name: "theme", values: ["light", "dark"] }],
    states: ["default", "focus"],
    tokenBindings: [
      { property: "colors", token: "tokens.colors" },
      { property: "spacing", token: "tokens.spacing" },
      { property: "radius", token: "tokens.radius" },
    ],
    behavior: [
      "Named actions are supplied by the integrating application.",
      "Forms use native validation.",
    ],
    accessibility: {
      labelRequired: true,
      keyboard: [
        "Tab between controls; Enter or Space activates native/Base UI controls.",
      ],
      notes: [
        "Visible labels are enforced. Test the finished composition in your application.",
      ],
    },
    dependencies: [...dependencies],
    status: "experimental",
    source: `custom-${composition.slug}.tsx`,
    example: `<${componentExportName(composition)} onAction={handleAction} />`,
  });
}
export const componentExportName = (composition: Composition) =>
  composition.slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
