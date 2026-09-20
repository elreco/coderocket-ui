<script setup lang="ts">
import { computed, h, ref, useId } from "vue";
import {
  LayoutDashboard,
  Folder,
  Settings2,
  UsersRound,
  CheckCheck,
  Palette,
  Target,
} from "@lucide/vue";
import * as Blocks from "../src/blocks";
import { RenderContent } from "../src/components/display-utils";
import FeatureVisual from "./feature-visual.vue";
import HeroVisual from "./hero-visual.vue";
const props = defineProps<{ slug: string }>();
const anchor = useId(),
  href = `#${anchor}`;
const notice = ref(""),
  name = ref("Acme"),
  query = ref("");
const members = ref([
  { id: "alex", name: "Alex Morgan", email: "alex@example.com", role: "Owner" },
  { id: "sam", name: "Sam Taylor", email: "sam@example.com", role: "Member" },
]);
const keys = ref([
  {
    id: "preview",
    name: "Development",
    prefix: "demo_",
    created: "Sep 17, 2026",
  },
]);
const notifications = ref([
  {
    id: "1",
    title: "Project ready for review",
    description: "Sam updated the customer portal.",
    time: "10 minutes ago",
    unread: true,
  },
  {
    id: "2",
    title: "Welcome to your workspace",
    description: "Everything is ready for your next idea.",
    time: "Yesterday",
    unread: false,
  },
]);
const action = (label: string) => () => {
  notice.value = `${label} — preview action received.`;
};
async function submitted(data: FormData) {
  if (data.has("workspace")) name.value = String(data.get("workspace"));
  notice.value = "Preview form submitted. No data was sent to a service.";
}
const rows = [
  { name: "Customer portal", status: "In progress", owner: "Alex" },
  { name: "Marketing site", status: "Review", owner: "Sam" },
  { name: "Mobile app", status: "Planning", owner: "Jamie" },
];
const columns = [
  { key: "name", label: "Project" },
  { key: "status", label: "Status" },
  { key: "owner", label: "Owner" },
];
const content = computed(() => {
  switch (props.slug) {
    case "login":
      return h(Blocks.LoginBlock, {
        onSubmit: submitted,
        signupHref: href,
        forgotHref: href,
      });
    case "signup":
      return h(Blocks.SignupBlock, { onSubmit: submitted, loginHref: href });
    case "forgot-password":
      return h(Blocks.ForgotPasswordBlock, {
        onSubmit: submitted,
        loginHref: href,
      });
    case "reset-password":
      return h(Blocks.ResetPasswordBlock, { onSubmit: submitted });
    case "otp":
      return h(Blocks.OtpBlock, { onSubmit: submitted });
    case "app-sidebar":
      return h(Blocks.AppSidebarBlock, {
        workspace: "Acme",
        accountName: "Alex Morgan",
        items: [
          {
            label: "Overview",
            href,
            active: true,
            icon: h(LayoutDashboard, { size: 18 }),
          },
          {
            label: "Projects",
            href: `${href}-projects`,
            icon: h(Folder, { size: 18 }),
          },
          {
            label: "Settings",
            href: `${href}-settings`,
            icon: h(Settings2, { size: 18 }),
          },
        ],
      });
    case "app-header":
      return h(Blocks.AppHeaderBlock, {
        breadcrumbs: [{ label: "Workspace", href }, { label: "Projects" }],
        accountName: "Alex Morgan",
        onSearch: action("Search"),
        onSignOut: action("Sign out"),
      });
    case "profile":
      return h(Blocks.ProfileBlock, {
        name: "Alex Morgan",
        email: "alex@example.com",
        bio: "Making useful things on the internet.",
        onSave: submitted,
      });
    case "settings":
      return h(Blocks.SettingsBlock, {
        workspaceName: name.value,
        onSave: submitted,
        onNotificationSave: submitted,
      });
    case "team":
      return h(Blocks.TeamBlock, {
        members: members.value,
        onInvite: async (data: FormData) => {
          const email = String(data.get("email"));
          members.value.push({
            id: crypto.randomUUID(),
            name: email.split("@")[0],
            email,
            role: "Invited",
          });
          notice.value = "Preview invitation added locally. No email sent.";
        },
        onRemove: (id: string) => {
          members.value = members.value.filter((item) => item.id !== id);
        },
      });
    case "billing":
      return h(Blocks.BillingBlock, {
        plan: "Team",
        price: "$29 / month",
        renewal: "Renews October 1",
        usage: 3,
        limit: 5,
        onManage: action("Manage sample subscription"),
        invoices: [{ id: "1", date: "September 1, 2026", amount: "$29", href }],
      });
    case "api-keys":
      return h(Blocks.ApiKeysBlock, {
        keys: keys.value,
        onCreate: async (data: FormData) => {
          keys.value.push({
            id: crypto.randomUUID(),
            name: String(data.get("name")),
            prefix: "demo_",
            created: "Just now",
          });
          notice.value =
            "Preview record created. This is not a usable API credential.";
        },
        onRevoke: (id: string) => {
          keys.value = keys.value.filter((item) => item.id !== id);
        },
      });
    case "notifications":
      return h(Blocks.NotificationsBlock, {
        items: notifications.value,
        onReadAll: () => {
          notifications.value = notifications.value.map((item) => ({
            ...item,
            unread: false,
          }));
        },
        onOpen: (id: string) => {
          notifications.value = notifications.value.map((item) =>
            item.id === id ? { ...item, unread: false } : item,
          );
          notice.value = "Preview notification opened.";
        },
      });
    case "data-table":
      return h(Blocks.DataTableBlock, {
        title: "Projects",
        description: "Everything your team is working on.",
        columns,
        rows,
        onCreate: action("Add record"),
      });
    case "filters":
      return h("div", [
        h(Blocks.FiltersBlock, {
          statuses: [
            { value: "active", label: "Active" },
            { value: "archived", label: "Archived" },
          ],
          onChange: (filters) => {
            query.value = JSON.stringify(filters);
          },
        }),
        h(
          "p",
          { role: "status", class: "cr-description" },
          `Current filters: ${query.value || "None"}`,
        ),
      ]);
    case "search":
      return h(Blocks.SearchBlock, {
        items: rows.map((row, index) => ({
          id: String(index),
          title: row.name,
          description: row.status,
        })),
        onSelect: (id: string) => {
          notice.value = `Selected ${rows[Number(id)].name}`;
        },
      });
    case "empty-state":
      return h(Blocks.EmptyStateBlock, {
        title: "A fresh start",
        description: "Your first project is one click away.",
        actionLabel: "Create project",
        onAction: action("Create project"),
      });
    case "detail-view":
      return h(Blocks.DetailViewBlock, {
        title: "Customer portal",
        status: "In progress",
        fields: [
          { label: "Owner", value: "Alex Morgan" },
          { label: "Due date", value: "October 1, 2026" },
          { label: "Team", value: "Product" },
        ],
        onEdit: action("Edit project"),
      });
    case "stats":
      return h(Blocks.StatsBlock, {
        items: [
          {
            label: "Active projects",
            value: "24",
            change: "+4 this month",
            trend: "positive",
            icon: h(Folder, { size: 17 }),
          },
          {
            label: "Team members",
            value: "12",
            change: "+2 this month",
            trend: "positive",
            icon: h(UsersRound, { size: 17 }),
          },
          {
            label: "Completed tasks",
            value: "148",
            change: "Across all projects",
            trend: "neutral",
            icon: h(CheckCheck, { size: 17 }),
          },
        ],
      });
    case "hero":
      return h(
        Blocks.HeroBlock,
        {
          eyebrow: "A CALMER WAY TO WORK",
          title: "Good work needs a great space.",
          description:
            "Bring projects, people and possibilities together. One thoughtful workspace, shaped around the way you work.",
          primary: { label: "Create your workspace", href },
          secondary: { label: "Explore the product", href },
        },
        { default: () => h(HeroVisual) },
      );
    case "features":
      return h(Blocks.FeaturesBlock, {
        eyebrow: "BUILT AROUND YOUR WORK",
        title: "Less busywork. More possibility.",
        description:
          "Bring your tools, your team and your next idea into one considered workspace.",
        items: [
          {
            title: "Your brand, in every detail.",
            description:
              "Start with a familiar foundation. Make the colors, shape and rhythm unmistakably yours.",
            icon: h(Palette, { size: 21, strokeWidth: 1.75 }),
            eyebrow: "MAKE IT YOURS",
            visual: h(FeatureVisual, { kind: "design" }),
          },
          {
            title: "Move forward, together.",
            description:
              "Give ideas a home and keep the whole team in the conversation.",
            icon: h(UsersRound, { size: 21, strokeWidth: 1.75 }),
            eyebrow: "STAY CONNECTED",
            visual: h(FeatureVisual, { kind: "team" }),
          },
          {
            title: "Make space for focus.",
            description:
              "A clear view of what matters now, with everything else in its place.",
            icon: h(Target, { size: 21, strokeWidth: 1.75 }),
            eyebrow: "FIND YOUR FLOW",
            visual: h(FeatureVisual, { kind: "focus" }),
          },
        ],
      });
    case "pricing":
      return h(Blocks.PricingBlock, {
        title: "A plan for your next chapter.",
        plans: [
          {
            name: "Personal",
            price: "$0",
            period: "/ month",
            description: "For individual projects.",
            features: ["1 workspace", "Community support"],
            href,
            action: "Start free",
          },
          {
            name: "Team",
            price: "$29",
            period: "/ month",
            description: "For teams building together.",
            features: [
              "Unlimited workspaces",
              "Priority support",
              "Advanced permissions",
            ],
            href,
            action: "Choose Team",
            featured: true,
          },
        ],
      });
    case "testimonials":
      return h(Blocks.TestimonialsBlock, {
        title: "Sample testimonial layout",
        quotes: [
          {
            quote:
              "This is illustrative placeholder copy. Replace it with a real customer quote before publishing.",
            name: "Alex Morgan",
            role: "Sample customer",
          },
          {
            quote:
              "Use this space to show what your customers value about your product.",
            name: "Sam Taylor",
            role: "Sample customer",
          },
        ],
      });
    case "faq":
      return h(Blocks.FaqBlock, {
        title: "A few things to know.",
        items: [
          {
            question: "Can I customize this block?",
            answer: "Yes. You own the source and can adapt it to your product.",
          },
          {
            question: "How do I connect real data?",
            answer:
              "Pass your records and action callbacks as typed Vue props.",
          },
          {
            question: "Does it require a SaaS connection?",
            answer: "No. Exported blocks work entirely in your application.",
          },
        ],
      });
    case "cta":
      return h(Blocks.CtaBlock, {
        title: "Your next idea starts here.",
        description: "Create something you’re proud to share.",
        action: { label: "Start building", href },
      });
    case "footer":
      return h(Blocks.FooterBlock, {
        brand: "Acme",
        description: "A little more room for great work.",
        groups: [
          {
            title: "Product",
            links: [
              { label: "Features", href },
              { label: "Pricing", href: `${href}-projects` },
            ],
          },
          {
            title: "Resources",
            links: [
              { label: "Documentation", href },
              { label: "Contact", href: `${href}-settings` },
            ],
          },
        ],
        copyright: "© 2026 Acme. Sample company.",
      });
    default:
      return h("p", "Block unavailable.");
  }
});
</script>
<template>
  <div class="cr-block-demo">
    <p class="cr-demo-label">INTERACTIVE PREVIEW · SAMPLE DATA</p>
    <RenderContent :content="content" />
    <p v-if="notice" role="status" class="cr-demo-notice">{{ notice }}</p>
    <div :id="anchor" class="cr-demo-destination">
      <span :id="`${anchor}-projects`" /><span
        :id="`${anchor}-settings`"
      />Interactive example. Changes stay in this preview.
    </div>
  </div>
</template>
