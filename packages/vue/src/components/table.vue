<script setup lang="ts">
import type { DisplayContent } from "./display-types";
import { RenderContent } from "./display-utils";
withDefaults(
  defineProps<{
    caption: string;
    columns: string[];
    rows: DisplayContent[][];
    loading?: boolean;
    loadingMessage?: DisplayContent;
    emptyMessage?: DisplayContent;
    getRowKey?: (row: DisplayContent[], index: number) => string | number;
  }>(),
  {
    loading: false,
    loadingMessage: "Loading records…",
    emptyMessage: "No records yet.",
  },
);
</script>
<template>
  <div class="cr-table-scroll" role="region" :aria-label="caption" tabindex="0">
    <table class="cr-table" :aria-busy="loading || undefined">
      <caption>
        {{
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th v-for="(column, index) in columns" :key="index" scope="col">
            <slot name="header" :column="column" :index="index">{{
              column
            }}</slot>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="!loading"
          ><tr
            v-for="(row, index) in rows"
            :key="getRowKey?.(row, index) ?? index"
          >
            <td v-for="(value, column) in row" :key="column">
              <slot
                name="cell"
                :value="value"
                :row="row"
                :row-index="index"
                :column-index="column"
                ><RenderContent :content="value"
              /></slot>
            </td></tr
        ></template>
        <tr v-if="loading || !rows.length">
          <td :colspan="Math.max(1, columns.length)">
            <slot v-if="loading" name="loading"
              ><RenderContent :content="loadingMessage" /></slot
            ><slot v-else name="empty"
              ><RenderContent :content="emptyMessage"
            /></slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
