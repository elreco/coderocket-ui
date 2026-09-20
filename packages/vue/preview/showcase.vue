<script setup lang="ts">
import { ref, useId, watch } from "vue";
import {
  Accordion,
  Alert,
  AlertDialog,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Calendar,
  Card,
  Checkbox,
  Collapsible,
  Combobox,
  Command,
  ContextMenu,
  DataTable,
  DatePicker,
  Dialog,
  Drawer,
  Dropdown,
  EmptyState,
  Field,
  FileUpload,
  HoverCard,
  Input,
  InputGroup,
  Kbd,
  Label,
  NavigationMenu,
  NumberField,
  Pagination,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  Sheet,
  Sidebar,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Textarea,
  Toast,
  Toggle,
  ToggleGroup,
  Tooltip,
} from "../src/index";
const props = defineProps<{ slug: string }>();
const notice = ref("");
const labelId = useId();
const page = ref(2);
const calendarDate = ref<string | { start: string; end: string } | null>(
  "2026-09-17",
);
const dateRange = ref<string | { start: string; end: string } | null>({
  start: "2026-09-17",
  end: "2026-09-23",
});
watch(
  () => props.slug,
  () => {
    notice.value = "";
  },
);
</script>

<template>
  <div class="cr-demo">
    <div class="cr-demo-content">
      <template v-if="slug === 'button'">
        <Button @click="notice = 'Ready to continue.'">Continue</Button>
      </template>
      <template v-else-if="slug === 'badge'">
        <Badge variant="success">Active</Badge>
      </template>
      <template v-else-if="slug === 'avatar'">
        <Avatar name="Alex Morgan" />
      </template>
      <template v-else-if="slug === 'card'">
        <Card
          title="Project settings"
          description="Make this workspace your own."
          >Your content goes here.</Card
        >
      </template>
      <template v-else-if="slug === 'alert'">
        <Alert title="Everything is up to date." variant="success"
          >Your changes have been saved.</Alert
        >
      </template>
      <template v-else-if="slug === 'separator'">
        <div>Account<Separator />Preferences</div>
      </template>
      <template v-else-if="slug === 'skeleton'">
        <div style="width: 240px; display: grid; gap: 12px">
          <Skeleton style="height: 20px; width: 60%" /><Skeleton
            style="height: 80px"
          />
        </div>
      </template>
      <template v-else-if="slug === 'label'">
        <div>
          <Label :html-for="labelId">Full name</Label><Input :id="labelId" />
        </div>
      </template>
      <template v-else-if="slug === 'kbd'">
        <span>Open search <Kbd>⌘ K</Kbd></span>
      </template>
      <template v-else-if="slug === 'input'">
        <Input
          aria-label="Email address"
          type="email"
          placeholder="you@company.com"
        />
      </template>
      <template v-else-if="slug === 'textarea'">
        <Textarea
          aria-label="Project description"
          placeholder="Tell us about your project…"
        />
      </template>
      <template v-else-if="slug === 'checkbox'">
        <Checkbox label="Send me product updates" default-checked />
      </template>
      <template v-else-if="slug === 'radio-group'">
        <RadioGroup
          label="Plan"
          default-value="personal"
          :options="[
            { value: 'personal', label: 'Personal' },
            { value: 'team', label: 'Team' },
          ]"
        />
      </template>
      <template v-else-if="slug === 'switch'">
        <Switch label="Email notifications" default-checked />
      </template>
      <template v-else-if="slug === 'slider'">
        <Slider label="Volume" :default-value="40" :min="0" :max="100" />
      </template>
      <template v-else-if="slug === 'field'">
        <Field label="Email" description="We’ll use this for account updates."
          ><Input type="email" placeholder="you@company.com"
        /></Field>
      </template>
      <template v-else-if="slug === 'input-group'">
        <InputGroup
          aria-label="Website"
          leading="https://"
          placeholder="your-company.com"
        />
      </template>
      <template v-else-if="slug === 'select'">
        <Select
          label="Timezone"
          default-value="paris"
          :options="[
            { value: 'paris', label: 'Europe / Paris' },
            { value: 'new-york', label: 'America / New York' },
          ]"
        />
      </template>
      <template v-else-if="slug === 'combobox'">
        <Combobox
          label="Framework"
          :items="['React', 'Vue', 'Svelte', 'SolidJS']"
        />
      </template>
      <template v-else-if="slug === 'accordion'">
        <Accordion
          :items="[
            {
              value: 'ownership',
              title: 'Do I own the code?',
              content: 'Yes. Export it and use it in your own project.',
            },
            {
              value: 'runtime',
              title: 'Does it need a server?',
              content: 'The exported components run independently.',
            },
          ]"
        />
      </template>
      <template v-else-if="slug === 'tabs'">
        <Tabs
          label="Account"
          :items="[
            {
              value: 'profile',
              label: 'Profile',
              content: 'Your profile settings.',
            },
            {
              value: 'notifications',
              label: 'Notifications',
              content: 'Choose how you stay informed.',
            },
          ]"
        />
      </template>
      <template v-else-if="slug === 'collapsible'">
        <Collapsible title="Advanced options"
          >Additional settings for this workspace.</Collapsible
        >
      </template>
      <template v-else-if="slug === 'breadcrumb'">
        <Breadcrumb
          :items="[
            { label: 'Workspace', href: '#workspace' },
            { label: 'Settings', href: '#settings' },
            { label: 'Profile' },
          ]"
        />
      </template>
      <template v-else-if="slug === 'pagination'">
        <Pagination v-model:page="page" :total-pages="8" />
      </template>
      <template v-else-if="slug === 'progress'">
        <Progress label="Upload progress" :value="65" />
      </template>
      <template v-else-if="slug === 'spinner'">
        <Spinner label="Loading your workspace" />
      </template>
      <template v-else-if="slug === 'empty-state'">
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started."
          ><template #action
            ><Button @click="notice = 'New project created in this preview.'"
              >Create project</Button
            ></template
          ></EmptyState
        >
      </template>
      <template v-else-if="slug === 'table'">
        <Table
          caption="Team members"
          :columns="['Name', 'Role']"
          :rows="[
            ['Alex Morgan', 'Owner'],
            ['Sam Taylor', 'Developer'],
          ]"
        />
      </template>
      <template v-else-if="slug === 'data-table'">
        <DataTable
          caption="Projects"
          :columns="[
            { key: 'name', label: 'Name' },
            { key: 'status', label: 'Status' },
          ]"
          :rows="[
            { name: 'Website', status: 'Active' },
            { name: 'Mobile app', status: 'Planning' },
          ]"
        />
      </template>
      <template v-else-if="slug === 'dialog'">
        <Dialog
          trigger="Open dialog"
          title="Workspace settings"
          description="Manage the details of your workspace."
          ><Input aria-label="Workspace name" placeholder="Acme"
        /></Dialog>
      </template>
      <template v-else-if="slug === 'alert-dialog'">
        <AlertDialog
          trigger="Preview confirmation"
          title="Review before continuing"
          description="Important changes deserve a final check."
          close-label="Cancel"
          ><p>
            This is a confirmation preview. No data will be changed. In your
            application, explain the consequences here before asking the user to
            confirm.
          </p></AlertDialog
        >
      </template>
      <template v-else-if="slug === 'drawer'">
        <Drawer
          trigger="Open drawer"
          title="Workspace settings"
          description="Manage the details of your workspace."
          ><Input aria-label="Workspace name" placeholder="Acme"
        /></Drawer>
      </template>
      <template v-else-if="slug === 'sheet'">
        <Sheet
          trigger="Open sheet"
          title="Workspace settings"
          description="Manage the details of your workspace."
          ><Input aria-label="Workspace name" placeholder="Acme"
        /></Sheet>
      </template>
      <template v-else-if="slug === 'popover'">
        <Popover trigger="Set dimensions" title="Dimensions"
          ><Input aria-label="Width" placeholder="Width"
        /></Popover>
      </template>
      <template v-else-if="slug === 'tooltip'">
        <Tooltip trigger="Save" content="Save your changes to this library" />
      </template>
      <template v-else-if="slug === 'dropdown'">
        <Dropdown
          trigger="Project actions"
          :items="[{ label: 'Rename' }, { label: 'Archive' }]"
          @select="notice = `${$event.label} selected`"
        />
      </template>
      <template v-else-if="slug === 'context-menu'">
        <ContextMenu
          :items="[{ label: 'Open' }, { label: 'Duplicate' }]"
          @select="notice = `${$event.label} selected`"
          >Right-click here, or press Shift + F10.</ContextMenu
        >
      </template>
      <template v-else-if="slug === 'hover-card'">
        <HoverCard label="@alex" href="#profile"
          ><strong>Alex Morgan</strong>
          <p class="cr-description">Designer and developer.</p></HoverCard
        >
      </template>
      <template v-else-if="slug === 'navigation-menu'">
        <NavigationMenu
          :items="[
            {
              label: 'Product',
              links: [
                {
                  label: 'Overview',
                  href: '#overview',
                  description: 'Explore the platform.',
                },
                { label: 'Components', href: '#components' },
              ],
            },
          ]"
        />
      </template>
      <template v-else-if="slug === 'sidebar'">
        <Sidebar
          brand="Acme"
          :items="[
            { label: 'Overview', href: '#overview', active: true },
            { label: 'Projects', href: '#projects' },
            { label: 'Settings', href: '#settings' },
          ]"
        />
      </template>
      <template v-else-if="slug === 'toggle'">
        <Toggle aria-label="Bold text">B</Toggle>
      </template>
      <template v-else-if="slug === 'toggle-group'">
        <ToggleGroup
          label="Text alignment"
          :items="[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]"
        />
      </template>
      <template v-else-if="slug === 'number-field'">
        <NumberField label="Team size" :default-value="5" :min="1" :max="100" />
      </template>
      <template v-else-if="slug === 'command'">
        <Command
          :items="[
            {
              value: 'settings',
              label: 'Open settings',
              onSelect: () => (notice = 'Settings selected'),
            },
            {
              value: 'export',
              label: 'Export library',
              onSelect: () => (notice = 'Export selected'),
            },
          ]"
        />
      </template>
      <template v-else-if="slug === 'calendar'">
        <Calendar
          v-model="calendarDate"
          @value-change="notice = `${$event} selected`"
        />
      </template>
      <template v-else-if="slug === 'date-picker'">
        <DatePicker
          v-model="dateRange"
          mode="range"
          label="Project dates"
          :auto-apply="false"
          :collision-padding="{ top: 16, right: 16, bottom: 80, left: 16 }"
          @value-change="notice = $event &amp;&amp; typeof $event === 'object' ? `${$event.start} – ${$event.end} selected` : 'Selection cleared'"
        />
      </template>
      <template v-else-if="slug === 'toast'">
        <Toast />
      </template>
      <template v-else-if="slug === 'file-upload'">
        <FileUpload
          label="Project attachment"
          @file-select="notice = `${$event.name} selected`"
        />
      </template>
      <p v-else>Component unavailable.</p>
    </div>
    <p
      v-if="notice"
      role="status"
      class="cr-description"
      style="margin-top: 12px"
    >
      {{ notice }}
    </p>
  </div>
</template>
