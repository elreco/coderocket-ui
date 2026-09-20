import { z } from "zod";
import catalogue from "./catalogue.json";
import blockCatalogue from "./blocks.json";
export const blockSpecs = blockCatalogue;
export function getBlock(slug: string) {
  return blockSpecs.find((spec) => spec.slug === slug);
}
export function searchBlocks(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return blockSpecs.filter((spec) =>
    terms.every((term) =>
      `${spec.name} ${spec.category} ${spec.description}`
        .toLowerCase()
        .includes(term),
    ),
  );
}
export const componentSpecSchema = z.object({
  schemaVersion: z.literal(1),
  name: z.string(),
  slug: z.string().regex(/^[a-z][a-z0-9-]+$/),
  description: z.string(),
  category: z.string(),
  anatomy: z.array(z.object({ name: z.string(), description: z.string() })),
  variants: z.array(
    z.object({ name: z.string(), values: z.array(z.string()) }),
  ),
  states: z.array(z.string()),
  tokenBindings: z.array(z.object({ property: z.string(), token: z.string() })),
  behavior: z.array(z.string()),
  accessibility: z.object({
    labelRequired: z.boolean(),
    keyboard: z.array(z.string()),
    notes: z.array(z.string()),
  }),
  dependencies: z.array(z.string()),
  status: z.enum(["draft", "experimental", "stable", "deprecated"]),
  source: z.string(),
  example: z.string(),
});
export type ComponentSpec = z.infer<typeof componentSpecSchema>;
export const componentSpecs: ComponentSpec[] = catalogue.map((raw) => {
  const data = raw as typeof raw & {
    anatomy?: string[];
    variants?: string[];
    states?: string[];
    behavior?: string[];
    dependencies?: string[];
  };
  return componentSpecSchema.parse({
    schemaVersion: 1,
    name: data.name,
    slug: data.slug,
    description: data.description,
    category: data.category,
    anatomy: (data.anatomy ?? ["root"]).map((name) => ({
      name,
      description: `${data.name} ${name}`,
    })),
    variants: [{ name: "appearance", values: data.variants ?? ["default"] }],
    states: data.states ?? ["default", "focus"],
    tokenBindings: [
      { property: "foreground", token: "colors.foreground" },
      { property: "background", token: "colors.surface" },
      { property: "border", token: "colors.border" },
      { property: "radius", token: "radius.md" },
      { property: "focus", token: "colors.focus" },
    ],
    behavior: data.behavior ?? [],
    accessibility: {
      labelRequired: ["Forms", "Data"].includes(data.category),
      keyboard: data.behavior ?? ["Use native or Base UI keyboard semantics."],
      notes: [
        "Provide meaningful labels and descriptions.",
        "Review contrast after changing colors.",
        "Do not rely on color alone to communicate state.",
      ],
    },
    dependencies: data.dependencies ?? [],
    status: "experimental",
    source: data.source,
    example: data.example,
  });
});
export function getComponent(slug: string) {
  return componentSpecs.find((spec) => spec.slug === slug);
}
export function searchComponents(query: string) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return componentSpecs.filter((spec) =>
    terms.every((term) =>
      `${spec.name} ${spec.category} ${spec.description}`
        .toLowerCase()
        .includes(term),
    ),
  );
}
