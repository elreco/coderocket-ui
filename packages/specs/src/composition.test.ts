import { it, expect } from "vitest";
import { validateComposition } from "./composition";
export const compositionFixture = {
  schemaVersion: 1,
  name: "Contact form",
  slug: "contact-form",
  kind: "component",
  description: "A labelled contact form",
  nodes: [
    {
      id: "form",
      parent: null,
      kind: "form",
      text: "Contact",
      description: "",
      action: "contact",
    },
    {
      id: "email",
      parent: "form",
      kind: "input",
      text: "Email",
      description: "Your work email",
      name: "email",
      inputType: "email",
      required: true,
    },
    {
      id: "submit",
      parent: "form",
      kind: "button",
      text: "Send message",
      description: "",
      action: "submit",
    },
  ],
};
it("validates compositions and rejects cycles, missing labels, executable data and catalogue collisions", () => {
  expect(validateComposition(compositionFixture).nodes).toHaveLength(3);
  for (const input of [
    { ...compositionFixture, slug: "button" },
    {
      ...compositionFixture,
      nodes: [
        ...compositionFixture.nodes,
        { ...compositionFixture.nodes[1], id: "second-email" },
      ],
    },
    {
      ...compositionFixture,
      nodes: [
        {
          id: "submit",
          parent: null,
          kind: "button",
          text: "Save",
          description: "",
          action: "submit",
        },
      ],
    },
    {
      ...compositionFixture,
      nodes: compositionFixture.nodes.map((node) =>
        node.id === "email" ? { ...node, text: "" } : node,
      ),
    },
    {
      ...compositionFixture,
      nodes: compositionFixture.nodes.map((node) =>
        node.id === "form" ? { ...node, parent: "email" } : node,
      ),
    },
    {
      ...compositionFixture,
      nodes: compositionFixture.nodes.map((node) =>
        node.id === "email" ? { ...node, onClick: "alert(1)" } : node,
      ),
    },
  ])
    expect(() => validateComposition(input)).toThrow();
});
