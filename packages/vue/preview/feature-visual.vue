<script setup lang="ts">
import {
  Layers3,
  ArrowUpRight,
  Plus,
  Folder,
  CheckCheck,
  Target,
  Check,
} from "@lucide/vue";
defineProps<{ kind: "design" | "team" | "focus" }>();
</script>
<template>
  <div :class="['cr-demo-visual', `cr-demo-visual-${kind}`]" aria-hidden="true">
    <template v-if="kind === 'design'"
      ><div class="cr-demo-palette">
        <span /><span /><span /><span /><span /><small
          >Your palette. Everywhere.</small
        >
      </div>
      <div class="cr-demo-mini-panel">
        <span class="cr-demo-mini-icon"><Layers3 :size="19" /></span
        ><strong>A space that feels like you.</strong
        ><span>Customer portal</span>
        <div class="cr-demo-mini-input">
          Orbit workspace<ArrowUpRight :size="14" />
        </div>
        <div class="cr-demo-mini-action">
          Create workspace<Plus :size="14" />
        </div></div></template
    ><template v-else-if="kind === 'team'"
      ><div class="cr-demo-avatar-cluster">
        <span>AM</span><span>ST</span><span>JL</span
        ><span><Plus :size="13" /></span>
      </div>
      <div class="cr-demo-team-task">
        <span class="cr-demo-mini-icon"><Folder :size="16" /></span
        ><span
          ><strong>Customer portal</strong><small>Design review</small></span
        ><span class="cr-demo-review-tag">In review</span>
      </div>
      <div class="cr-demo-comment">
        <span class="cr-demo-comment-avatar">ST</span
        ><span
          ><strong>Sam Taylor</strong
          ><small>Ready for your feedback.</small></span
        ><CheckCheck :size="15" /></div></template
    ><template v-else
      ><div class="cr-demo-focus-heading">
        <span>Today’s focus</span
        ><span class="cr-demo-mini-icon"><Target :size="16" /></span>
      </div>
      <div
        v-for="(label, index) in [
          'Review the new homepage',
          'Ship the customer portal',
          'Plan what’s next',
        ]"
        :key="label"
        class="cr-demo-focus-row"
      >
        <span :class="index === 0 ? 'cr-demo-task-done' : 'cr-demo-task-dot'"
          ><Check v-if="index === 0" :size="11" /></span
        ><span>{{ label }}</span
        ><span v-if="index === 1" class="cr-demo-focus-label">Now</span>
      </div></template
    >
  </div>
</template>
