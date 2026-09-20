"use client";
import { useId, useState } from "react";
import {
  ArrowUpRight,
  Check,
  CheckCheck,
  Clock3,
  Folder,
  LayoutDashboard,
  Layers3,
  Palette,
  PanelLeft,
  Plus,
  Search,
  Settings2,
  Target,
  UsersRound,
} from "lucide-react";
import * as Blocks from "./index";
function FeatureVisual({ kind }: { kind: "design" | "team" | "focus" }) {
  return (
    <div className={`cr-demo-visual cr-demo-visual-${kind}`} aria-hidden="true">
      {kind === "design" ? (
        <>
          <div className="cr-demo-palette">
            <span />
            <span />
            <span />
            <span />
            <span />
            <small>Your palette. Everywhere.</small>
          </div>
          <div className="cr-demo-mini-panel">
            <span className="cr-demo-mini-icon">
              <Layers3 size={19} />
            </span>
            <strong>A space that feels like you.</strong>
            <span>Customer portal</span>
            <div className="cr-demo-mini-input">
              Orbit workspace
              <ArrowUpRight size={14} />
            </div>
            <div className="cr-demo-mini-action">
              Create workspace
              <Plus size={14} />
            </div>
          </div>
        </>
      ) : kind === "team" ? (
        <>
          <div className="cr-demo-avatar-cluster">
            <span>AM</span>
            <span>ST</span>
            <span>JL</span>
            <span>
              <Plus size={13} />
            </span>
          </div>
          <div className="cr-demo-team-task">
            <span className="cr-demo-mini-icon">
              <Folder size={16} />
            </span>
            <span>
              <strong>Customer portal</strong>
              <small>Design review</small>
            </span>
            <span className="cr-demo-review-tag">In review</span>
          </div>
          <div className="cr-demo-comment">
            <span className="cr-demo-comment-avatar">ST</span>
            <span>
              <strong>Sam Taylor</strong>
              <small>Ready for your feedback.</small>
            </span>
            <CheckCheck size={15} />
          </div>
        </>
      ) : (
        <>
          <div className="cr-demo-focus-heading">
            <span>Today’s focus</span>
            <span className="cr-demo-mini-icon">
              <Target size={16} />
            </span>
          </div>
          {[
            "Review the new homepage",
            "Ship the customer portal",
            "Plan what’s next",
          ].map((label, i) => (
            <div className="cr-demo-focus-row" key={label}>
              <span
                className={i === 0 ? "cr-demo-task-done" : "cr-demo-task-dot"}
              >
                {i === 0 ? <Check size={11} /> : null}
              </span>
              <span>{label}</span>
              {i === 1 ? (
                <span className="cr-demo-focus-label">Now</span>
              ) : null}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
function HeroVisual() {
  return (
    <div className="cr-demo-workspace" aria-hidden="true">
      <div className="cr-demo-workspace-bar">
        <span>
          <Layers3 size={16} />
          Orbit workspace
        </span>
        <span>
          <Search size={14} />
          <span className="cr-demo-shortcut">⌘ K</span>
        </span>
      </div>
      <div className="cr-demo-workspace-body">
        <div className="cr-demo-workspace-nav">
          <span data-active="true">
            <LayoutDashboard size={14} />
            Overview
          </span>
          <span>
            <Folder size={14} />
            Projects
          </span>
          <span>
            <UsersRound size={14} />
            Team
          </span>
          <span>
            <Settings2 size={14} />
            Settings
          </span>
        </div>
        <div className="cr-demo-workspace-main">
          <div className="cr-demo-workspace-title">
            <span>
              <small>YOUR WORKSPACE</small>
              <strong>A little more clarity.</strong>
            </span>
            <span className="cr-demo-workspace-create">
              <Plus size={13} />
              New project
            </span>
          </div>
          <div className="cr-demo-workspace-projects">
            {[
              { name: "Customer portal", status: "In review", icon: PanelLeft },
              { name: "Brand refresh", status: "In progress", icon: Palette },
              { name: "Next release", status: "Planned", icon: Clock3 },
            ].map(({ name, status, icon: Icon }) => (
              <div key={name}>
                <span className="cr-demo-mini-icon">
                  <Icon size={18} />
                </span>
                <strong>{name}</strong>
                <span>{status}</span>
                <div className="cr-demo-workspace-progress">
                  <i />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export function BlockShowcase({ slug }: { slug: string }) {
  const anchor = useId(),
    href = `#${anchor}`;
  const [notice, setNotice] = useState(""),
    [name, setName] = useState("Acme"),
    [query, setQuery] = useState("");
  const [members, setMembers] = useState([
    {
      id: "alex",
      name: "Alex Morgan",
      email: "alex@example.com",
      role: "Owner",
    },
    { id: "sam", name: "Sam Taylor", email: "sam@example.com", role: "Member" },
  ]);
  const [keys, setKeys] = useState([
    {
      id: "preview",
      name: "Development",
      prefix: "demo_",
      created: "Sep 17, 2026",
    },
  ]);
  const [notifications, setNotifications] = useState([
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
  const action = (label: string) => () =>
    setNotice(`${label} — preview action received.`);
  const submitted = async (data: FormData) => {
    if (data.has("workspace")) setName(String(data.get("workspace")));
    setNotice("Preview form submitted. No data was sent to a service.");
  };
  const rows = [
      { name: "Customer portal", status: "In progress", owner: "Alex" },
      { name: "Marketing site", status: "Review", owner: "Sam" },
      { name: "Mobile app", status: "Planning", owner: "Jamie" },
    ],
    columns = [
      { key: "name", label: "Project" },
      { key: "status", label: "Status" },
      { key: "owner", label: "Owner" },
    ];
  let content;
  switch (slug) {
    case "login":
      content = (
        <Blocks.LoginBlock
          onSubmit={submitted}
          signupHref={href}
          forgotHref={href}
        />
      );
      break;
    case "signup":
      content = <Blocks.SignupBlock onSubmit={submitted} loginHref={href} />;
      break;
    case "forgot-password":
      content = (
        <Blocks.ForgotPasswordBlock onSubmit={submitted} loginHref={href} />
      );
      break;
    case "reset-password":
      content = <Blocks.ResetPasswordBlock onSubmit={submitted} />;
      break;
    case "otp":
      content = <Blocks.OtpBlock onSubmit={submitted} />;
      break;
    case "app-sidebar":
      content = (
        <Blocks.AppSidebarBlock
          workspace="Acme"
          accountName="Alex Morgan"
          items={[
            {
              label: "Overview",
              href,
              active: true,
              icon: <LayoutDashboard size={18} />,
            },
            {
              label: "Projects",
              href: href + "-projects",
              icon: <Folder size={18} />,
            },
            {
              label: "Settings",
              href: href + "-settings",
              icon: <Settings2 size={18} />,
            },
          ]}
        />
      );
      break;
    case "app-header":
      content = (
        <Blocks.AppHeaderBlock
          breadcrumbs={[{ label: "Workspace", href }, { label: "Projects" }]}
          accountName="Alex Morgan"
          onSearch={action("Search")}
          onSignOut={action("Sign out")}
        />
      );
      break;
    case "profile":
      content = (
        <Blocks.ProfileBlock
          name="Alex Morgan"
          email="alex@example.com"
          bio="Making useful things on the internet."
          onSave={submitted}
        />
      );
      break;
    case "settings":
      content = (
        <Blocks.SettingsBlock
          workspaceName={name}
          onSave={submitted}
          onNotificationSave={submitted}
        />
      );
      break;
    case "team":
      content = (
        <Blocks.TeamBlock
          members={members}
          onInvite={async (data) => {
            const email = String(data.get("email"));
            setMembers((items) => [
              ...items,
              {
                id: crypto.randomUUID(),
                name: email.split("@")[0],
                email,
                role: "Invited",
              },
            ]);
            setNotice("Preview invitation added locally. No email sent.");
          }}
          onRemove={(id) =>
            setMembers((items) => items.filter((item) => item.id !== id))
          }
        />
      );
      break;
    case "billing":
      content = (
        <Blocks.BillingBlock
          plan="Team"
          price="$29 / month"
          renewal="Renews October 1"
          usage={3}
          limit={5}
          onManage={action("Manage sample subscription")}
          invoices={[
            { id: "1", date: "September 1, 2026", amount: "$29", href },
          ]}
        />
      );
      break;
    case "api-keys":
      content = (
        <Blocks.ApiKeysBlock
          keys={keys}
          onCreate={async (data) => {
            setKeys((items) => [
              ...items,
              {
                id: crypto.randomUUID(),
                name: String(data.get("name")),
                prefix: "demo_",
                created: "Just now",
              },
            ]);
            setNotice(
              "Preview record created. This is not a usable API credential.",
            );
          }}
          onRevoke={(id) =>
            setKeys((items) => items.filter((item) => item.id !== id))
          }
        />
      );
      break;
    case "notifications":
      content = (
        <Blocks.NotificationsBlock
          items={notifications}
          onReadAll={() =>
            setNotifications((items) =>
              items.map((item) => ({ ...item, unread: false })),
            )
          }
          onOpen={(id) => {
            setNotifications((items) =>
              items.map((item) =>
                item.id === id ? { ...item, unread: false } : item,
              ),
            );
            setNotice("Preview notification opened.");
          }}
        />
      );
      break;
    case "data-table":
      content = (
        <Blocks.DataTableBlock
          title="Projects"
          description="Everything your team is working on."
          columns={columns}
          rows={rows}
          onCreate={action("Add record")}
        />
      );
      break;
    case "filters":
      content = (
        <>
          <Blocks.FiltersBlock
            statuses={[
              { value: "active", label: "Active" },
              { value: "archived", label: "Archived" },
            ]}
            onChange={(filters) => setQuery(JSON.stringify(filters))}
          />
          <p role="status" className="cr-description">
            Current filters: {query || "None"}
          </p>
        </>
      );
      break;
    case "search":
      content = (
        <Blocks.SearchBlock
          items={rows.map((row, index) => ({
            id: String(index),
            title: row.name,
            description: row.status,
          }))}
          onSelect={(id) => setNotice(`Selected ${rows[Number(id)].name}`)}
        />
      );
      break;
    case "empty-state":
      content = (
        <Blocks.EmptyStateBlock
          title="A fresh start"
          description="Your first project is one click away."
          actionLabel="Create project"
          onAction={action("Create project")}
        />
      );
      break;
    case "detail-view":
      content = (
        <Blocks.DetailViewBlock
          title="Customer portal"
          status="In progress"
          fields={[
            { label: "Owner", value: "Alex Morgan" },
            { label: "Due date", value: "October 1, 2026" },
            { label: "Team", value: "Product" },
          ]}
          onEdit={action("Edit project")}
        />
      );
      break;
    case "stats":
      content = (
        <Blocks.StatsBlock
          items={[
            {
              label: "Active projects",
              value: "24",
              change: "+4 this month",
              trend: "positive",
              icon: <Folder size={17} />,
            },
            {
              label: "Team members",
              value: "12",
              change: "+2 this month",
              trend: "positive",
              icon: <UsersRound size={17} />,
            },
            {
              label: "Completed tasks",
              value: "148",
              change: "Across all projects",
              trend: "neutral",
              icon: <CheckCheck size={17} />,
            },
          ]}
        />
      );
      break;
    case "hero":
      content = (
        <Blocks.HeroBlock
          eyebrow="A CALMER WAY TO WORK"
          title="Good work needs a great space."
          description="Bring projects, people and possibilities together. One thoughtful workspace, shaped around the way you work."
          primary={{ label: "Create your workspace", href }}
          secondary={{ label: "Explore the product", href }}
        >
          <HeroVisual />
        </Blocks.HeroBlock>
      );
      break;
    case "features":
      content = (
        <Blocks.FeaturesBlock
          eyebrow="BUILT AROUND YOUR WORK"
          title="Less busywork. More possibility."
          description="Bring your tools, your team and your next idea into one considered workspace."
          items={[
            {
              title: "Your brand, in every detail.",
              description:
                "Start with a familiar foundation. Make the colors, shape and rhythm unmistakably yours.",
              icon: <Palette size={21} strokeWidth={1.75} />,
              eyebrow: "MAKE IT YOURS",
              visual: <FeatureVisual kind="design" />,
            },
            {
              title: "Move forward, together.",
              description:
                "Give ideas a home and keep the whole team in the conversation.",
              icon: <UsersRound size={21} strokeWidth={1.75} />,
              eyebrow: "STAY CONNECTED",
              visual: <FeatureVisual kind="team" />,
            },
            {
              title: "Make space for focus.",
              description:
                "A clear view of what matters now, with everything else in its place.",
              icon: <Target size={21} strokeWidth={1.75} />,
              eyebrow: "FIND YOUR FLOW",
              visual: <FeatureVisual kind="focus" />,
            },
          ]}
        />
      );
      break;
    case "pricing":
      content = (
        <Blocks.PricingBlock
          title="A plan for your next chapter."
          plans={[
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
          ]}
        />
      );
      break;
    case "testimonials":
      content = (
        <Blocks.TestimonialsBlock
          title="Sample testimonial layout"
          quotes={[
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
          ]}
        />
      );
      break;
    case "faq":
      content = (
        <Blocks.FaqBlock
          title="A few things to know."
          items={[
            {
              question: "Can I customize this block?",
              answer:
                "Yes. You own the source and can adapt it to your product.",
            },
            {
              question: "How do I connect real data?",
              answer:
                "Pass your records and action callbacks as typed React props.",
            },
            {
              question: "Does it require a SaaS connection?",
              answer: "No. Exported blocks work entirely in your application.",
            },
          ]}
        />
      );
      break;
    case "cta":
      content = (
        <Blocks.CtaBlock
          title="Your next idea starts here."
          description="Create something you’re proud to share."
          action={{ label: "Start building", href }}
        />
      );
      break;
    case "footer":
      content = (
        <Blocks.FooterBlock
          brand="Acme"
          description="A little more room for great work."
          groups={[
            {
              title: "Product",
              links: [
                { label: "Features", href },
                { label: "Pricing", href: href + "-projects" },
              ],
            },
            {
              title: "Resources",
              links: [
                { label: "Documentation", href },
                { label: "Contact", href: href + "-settings" },
              ],
            },
          ]}
          copyright="© 2026 Acme. Sample company."
        />
      );
      break;
    default:
      content = <p>Block unavailable.</p>;
  }
  return (
    <div className="cr-block-demo">
      <p className="cr-demo-label">INTERACTIVE PREVIEW · SAMPLE DATA</p>
      {content}
      {notice && (
        <p role="status" className="cr-demo-notice">
          {notice}
        </p>
      )}
      <div id={anchor} className="cr-demo-destination">
        <span id={anchor + "-projects"} />
        <span id={anchor + "-settings"} />
        Interactive example. Changes stay in this preview.
      </div>
    </div>
  );
}
