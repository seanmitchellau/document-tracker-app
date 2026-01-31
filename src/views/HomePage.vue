<template>
  <main>
    <div class="space-y-16 py-16 xl:space-y-20">
      <div>
        <div class="px-4 sm:px-6 lg:px-8">
          <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
              <h1 class="text-base font-semibold leading-6 text-gray-900">
                Documents
              </h1>
              <p class="mt-2 text-sm text-gray-700">
                A list of all your documents
              </p>
            </div>
          </div>

          <div class="mt-4">
            <nav class="flex space-x-2">
              <button
                v-for="tab in tabs"
                :key="tab.value"
                @click="activeFilter = tab.value"
                class="rounded-md px-3 py-2 text-sm font-medium transition-all"
                :class="
                  activeFilter === tab.value
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                "
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div class="mt-8 flow-root">
            <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div
                class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
              >
                <table class="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer select-none hover:text-indigo-600"
                        @click="toggleSort"
                      >
                        Expires At
                        <span v-if="sortDirection === 'asc'" class="ml-1">&#9650;</span>
                        <span v-else class="ml-1">&#9660;</span>
                      </th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span class="sr-only">View</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr v-if="documentsQuery.isLoading.value">
                      <td colspan="3" class="py-4 text-center text-sm text-gray-500">
                        Loading...
                      </td>
                    </tr>
                    <tr v-else-if="!documents.length">
                      <td colspan="3" class="py-4 text-center text-sm text-gray-500">
                        No documents found.
                      </td>
                    </tr>
                    <tr v-for="document in documents" :key="document.id">
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"
                      >
                        {{ document.name }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {{ document.expires_at ? new Date(document.expires_at).toLocaleDateString() : '—' }}
                      </td>
                      <td
                        class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"
                      >
                        <RouterLink
                          :to="`/documents/${document.id}`"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          View
                        </RouterLink>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { documentsClient } from "../client";

const tabs = [
  { label: "All", value: "" },
  { label: "Expiring Soon", value: "expiring_soon" },
  { label: "Expired", value: "expired" },
];

const activeFilter = ref("");
const sortDirection = ref<"asc" | "desc">("asc");

function toggleSort() {
  sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
}

const sortParam = computed(() =>
  sortDirection.value === "desc" ? "-expires_at" : "expires_at"
);

const queryParams = computed(() => ({
  ...(activeFilter.value ? { filter: activeFilter.value } : {}),
  sort: sortParam.value,
}));

const documentsQuery = useQuery({
  queryKey: computed(() => ["documents", activeFilter.value, sortParam.value]),
  queryFn: () => documentsClient.getDocuments(queryParams.value),
});

const documents = computed(() => documentsQuery.data.value?.data.data ?? []);
</script>
