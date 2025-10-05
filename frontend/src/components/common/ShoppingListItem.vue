<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

export interface ShoppingListItem {
  id: string
  name: string
  checked: boolean
  price?: number
  currency?: string
}

const props = defineProps<{
  item: ShoppingListItem
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  click: [id: string]
}>()

const handleToggle = () => {
  emit('toggle', props.item.id)
}

const handleDelete = (e: Event) => {
  e.stopPropagation()
  emit('delete', props.item.id)
}

const handleClick = () => {
  emit('click', props.item.id)
}
</script>

<template>
  <div
    class="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700"
    @click="handleClick"
  >
    <!-- Checkbox -->
    <input
      type="checkbox"
      :checked="item.checked"
      @click.stop
      @change="handleToggle"
      class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
    />

    <!-- Item Content -->
    <div class="flex-1 min-w-0">
      <p
        class="text-gray-900 dark:text-white"
        :class="{ 'line-through text-gray-500 dark:text-gray-400': item.checked }"
      >
        {{ item.name }}
      </p>
      <p v-if="item.price && item.currency" class="text-sm text-gray-600 dark:text-gray-400">
        {{ item.price }} {{ item.currency }}
      </p>
    </div>

    <!-- Delete Button -->
    <button
      @click="handleDelete"
      class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
      title="Delete item"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped></style>
