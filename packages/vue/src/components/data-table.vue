<script setup lang="ts">
import { computed } from "vue";
import Pagination from "./pagination.vue";
import { RenderContent, useDisplayModel } from "./display-utils";
import type {
  DataColumn,
  DataRow,
  DataSort,
  DisplayContent,
} from "./display-types";
const props = withDefaults(
  defineProps<{
    caption: string;
    columns: DataColumn[];
    rows: DataRow[];
    pageSize?: number;
    query?: string;
    defaultQuery?: string;
    page?: number;
    defaultPage?: number;
    sort?: DataSort | null;
    defaultSort?: DataSort | null;
    getRowKey?: (row: Readonly<DataRow>, index: number) => string | number;
    loading?: boolean;
    loadingMessage?: DisplayContent;
    emptyMessage?: DisplayContent;
    searchPlaceholder?: string;
    searchable?: boolean;
  }>(),
  {
    pageSize: 5,
    defaultQuery: "",
    defaultPage: 1,
    defaultSort: null,
    loading: false,
    loadingMessage: "Loading records…",
    emptyMessage: "No matching records.",
    searchPlaceholder: "Search records…",
    searchable: true,
  },
);
const emit = defineEmits<{
  "update:query": [value: string];
  "query-change": [value: string];
  "update:page": [value: number];
  "page-change": [value: number];
  "update:sort": [value: DataSort | null];
  "sort-change": [value: DataSort | null];
}>();
const queryValue = useDisplayModel(
  () => props.query,
  props.defaultQuery,
  (value) => {
    emit("update:query", value);
    emit("query-change", value);
  },
);
const pageValue = useDisplayModel(
  () => props.page,
  props.defaultPage,
  (value) => {
    emit("update:page", value);
    emit("page-change", value);
  },
);
const sortValue = useDisplayModel<DataSort | null>(
  () => props.sort,
  props.defaultSort,
  (value) => {
    emit("update:sort", value);
    emit("sort-change", value);
  },
);
const filtered = computed(() => {
  const list = props.rows.filter((row) =>
    props.columns.some((column) =>
      String(row[column.key] ?? "")
        .toLowerCase()
        .includes(queryValue.value.toLowerCase()),
    ),
  );
  const sort = sortValue.value;
  if (sort)
    list.sort((a, b) => {
      const left = a[sort.key],
        right = b[sort.key];
      return (
        (typeof left === "number" && typeof right === "number"
          ? left - right
          : String(left ?? "").localeCompare(String(right ?? ""), undefined, {
              numeric: true,
            })) * sort.direction
      );
    });
  return list;
});
const size = computed(() =>
  Number.isFinite(props.pageSize) ? Math.max(1, Math.floor(props.pageSize)) : 5,
);
const total = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / size.value)),
);
const current = computed(() =>
  Number.isFinite(pageValue.value)
    ? Math.max(1, Math.min(Math.floor(pageValue.value), total.value))
    : 1,
);
const offset = computed(() => (current.value - 1) * size.value);
const visibleRows = computed(() =>
  filtered.value.slice(offset.value, current.value * size.value),
);
function search(event: Event) {
  queryValue.value = (event.target as HTMLInputElement).value;
  pageValue.value = 1;
}
function sortBy(column: DataColumn) {
  sortValue.value = {
    key: column.key,
    direction:
      sortValue.value?.key === column.key && sortValue.value.direction === 1
        ? -1
        : 1,
  };
  pageValue.value = 1;
}
</script>
<template>
  <div class="cr-data-table">
    <input
      v-if="searchable"
      class="cr-input"
      type="search"
      :aria-label="`Search ${caption}`"
      :placeholder="searchPlaceholder"
      :value="queryValue"
      @input="search"
    />
    <div
      class="cr-table-scroll"
      role="region"
      :aria-label="caption"
      tabindex="0"
    >
      <table class="cr-table" :aria-busy="loading || undefined">
        <caption>
          {{
            caption
          }}
        </caption>
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="
                sortValue?.key === column.key
                  ? sortValue.direction === 1
                    ? 'ascending'
                    : 'descending'
                  : undefined
              "
            >
              <button
                v-if="column.sortable !== false"
                type="button"
                class="cr-button"
                data-variant="ghost"
                data-size="sm"
                :aria-label="`Sort by ${column.label}, ${sortValue?.key === column.key && sortValue.direction === 1 ? 'descending' : 'ascending'}`"
                @click="sortBy(column)"
              >
                {{ column.label
                }}<span aria-hidden="true">{{
                  sortValue?.key === column.key
                    ? sortValue.direction === 1
                      ? "↑"
                      : "↓"
                    : "↕"
                }}</span></button
              ><template v-else>{{ column.label }}</template>
            </th>
          </tr>
        </thead>
        <tbody>
          <template v-if="!loading"
            ><tr
              v-for="(row, index) in visibleRows"
              :key="
                getRowKey?.(row, offset + index) ?? row.id ?? offset + index
              "
            >
              <td v-for="column in columns" :key="column.key">
                <slot
                  :name="`cell-${column.key}`"
                  :value="row[column.key]"
                  :row="row"
                  :column="column"
                  :row-index="offset + index"
                  ><slot
                    name="cell"
                    :value="row[column.key]"
                    :row="row"
                    :column="column"
                    :row-index="offset + index"
                    ><RenderContent
                      :content="
                        column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]
                      " /></slot
                ></slot>
              </td></tr
          ></template>
          <tr v-if="loading || !filtered.length">
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
    <div class="cr-data-table-footer">
      <p class="cr-description" role="status">
        <RenderContent v-if="loading" :content="loadingMessage" /><template
          v-else
          >{{
            filtered.length
              ? `${offset + 1}–${Math.min(current * size, filtered.length)} of ${filtered.length} records`
              : "0 records"
          }}</template
        >
      </p>
      <Pagination
        :label="`${caption} pages`"
        :page="current"
        :total-pages="total"
        :disabled="loading"
        @update:page="pageValue = $event"
      />
    </div>
  </div>
</template>
