<template>
  <main>
    <div class="py-16">
      <div class="px-4 sm:px-6 lg:px-8">
        <div v-if="documentQuery.isLoading.value" class="text-sm text-gray-500">
          Loading...
        </div>

        <div v-else-if="document">
          <div class="sm:flex sm:items-center sm:justify-between">
            <div class="sm:flex-auto">
              <div v-if="!isEditing" class="flex items-center gap-3">
                <h1 class="text-base font-semibold leading-6 text-gray-900">
                  {{ document.name }}
                </h1>
                <button
                  @click="startEditing"
                  class="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Rename
                </button>
              </div>
              <form v-else class="flex items-center gap-3" @submit.prevent="submitRename">
                <input
                  v-model="editName"
                  type="text"
                  required
                  class="rounded-md border-0 py-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                  type="submit"
                  :disabled="renameMutation.isLoading.value"
                  class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  @click="isEditing = false"
                  class="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>

          <dl class="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Expires At</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ document.expires_at ? new Date(document.expires_at).toLocaleDateString() : '—' }}
              </dd>
            </div>
            <div v-if="document.archived_at">
              <dt class="text-sm font-medium text-gray-500">Archived At</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ new Date(document.archived_at).toLocaleDateString() }}
              </dd>
            </div>
          </dl>

          <div
            v-if="isExpired && !document.archived_at"
            class="mt-6"
          >
            <button
              @click="archiveMutation.mutate()"
              :disabled="archiveMutation.isLoading.value"
              class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
            >
              {{ archiveMutation.isLoading.value ? 'Archiving...' : 'Archive Document' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import { documentsClient } from "../client";

const props = defineProps<{ documentId: string }>();

const queryClient = useQueryClient();

const documentQuery = useQuery({
  queryKey: ["documents", props.documentId],
  queryFn: () => documentsClient.getDocument(Number(props.documentId)),
});

const document = computed(() => documentQuery.data.value?.data.data ?? null);

const isExpired = computed(() => {
  if (!document.value?.expires_at) return false;
  return new Date(document.value.expires_at) <= new Date();
});

const isEditing = ref(false);
const editName = ref("");

function startEditing() {
  editName.value = document.value?.name ?? "";
  isEditing.value = true;
}

const renameMutation = useMutation({
  mutationFn: (name: string) =>
    documentsClient.renameDocument(Number(props.documentId), name),
  onSuccess: () => {
    isEditing.value = false;
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  },
});

function submitRename() {
  renameMutation.mutate(editName.value);
}

const archiveMutation = useMutation({
  mutationFn: () =>
    documentsClient.archiveDocument(Number(props.documentId)),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
  },
});
</script>
