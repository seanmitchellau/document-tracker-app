<template>
  <main>
    <div class="py-16">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-gray-900">
            Create Document
          </h1>
          <p class="mt-2 text-sm text-gray-700">
            Upload a new PDF document with an expiry date.
          </p>
        </div>

        <form class="mt-8 max-w-md space-y-6" @submit.prevent="onSubmit">
          <div>
            <label
              for="name"
              class="block text-sm font-medium leading-6 text-gray-900"
            >
              Document Name
            </label>
            <div class="mt-2">
              <input
                id="name"
                type="text"
                required
                v-model="form.name"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label
              for="expires_at"
              class="block text-sm font-medium leading-6 text-gray-900"
            >
              Expiry Date
            </label>
            <div class="mt-2">
              <input
                id="expires_at"
                type="date"
                required
                v-model="form.expires_at"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <label
              for="file"
              class="block text-sm font-medium leading-6 text-gray-900"
            >
              PDF File
            </label>
            <div class="mt-2">
              <input
                id="file"
                type="file"
                required
                accept=".pdf,application/pdf"
                @change="onFileChange"
                class="block w-full text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          <div v-if="createMutation.isError.value" class="mt-2">
            <p class="text-red-500 text-sm">
              Failed to create document. Please check your input and try again.
            </p>
          </div>

          <div>
            <button
              type="submit"
              :disabled="createMutation.isLoading.value"
              class="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {{ createMutation.isLoading.value ? 'Creating...' : 'Create Document' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { documentsClient } from "../client";

const router = useRouter();
const queryClient = useQueryClient();

const form = reactive({
  name: "",
  expires_at: "",
});

const file = ref<File | null>(null);

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  file.value = target.files?.[0] ?? null;
}

const createMutation = useMutation({
  mutationFn: (data: FormData) => documentsClient.createDocument(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    router.push({ path: "/home" });
  },
});

function onSubmit() {
  if (!file.value) return;

  const formData = new FormData();
  formData.append("name", form.name);
  formData.append("expires_at", form.expires_at);
  formData.append("file", file.value);

  createMutation.mutate(formData);
}
</script>
