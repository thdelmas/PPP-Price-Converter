<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ShoppingListItem from '@/components/common/ShoppingListItem.vue'
import type { ShoppingListItem as ListItem } from '@/components/common/ShoppingListItem.vue'

const router = useRouter()

// Sample shopping list items (in production, this would come from a store/API)
const items = ref<ListItem[]>([
  { id: '1', name: 'Coffee', checked: false, price: 5.99, currency: 'USD' },
  { id: '2', name: 'Bread', checked: true, price: 2.49, currency: 'USD' },
  { id: '3', name: 'Milk', checked: false, price: 3.99, currency: 'USD' },
  { id: '4', name: 'Eggs', checked: false, price: 4.49, currency: 'USD' },
])

const newItemName = ref('')

const toggleItem = (id: string) => {
  const item = items.value.find((i) => i.id === id)
  if (item) {
    item.checked = !item.checked
  }
}

const deleteItem = (id: string) => {
  items.value = items.value.filter((i) => i.id !== id)
}

const handleItemClick = (id: string) => {
  // Navigate to map view to show prices available
  // For now, we'll navigate to home with a query parameter
  router.push({ name: 'home', query: { item: id } })
}

const addItem = () => {
  if (newItemName.value.trim()) {
    items.value.push({
      id: Date.now().toString(),
      name: newItemName.value.trim(),
      checked: false,
    })
    newItemName.value = ''
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Shopping Lists</h1>

      <!-- Add Item Form -->
      <div class="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <form @submit.prevent="addItem" class="flex gap-2">
          <input
            v-model="newItemName"
            type="text"
            placeholder="Add new item..."
            class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      <!-- Shopping List Items -->
      <div class="space-y-3">
        <ShoppingListItem
          v-for="item in items"
          :key="item.id"
          :item="item"
          @toggle="toggleItem"
          @delete="deleteItem"
          @click="handleItemClick"
        />
      </div>

      <!-- Empty State -->
      <div v-if="items.length === 0" class="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">Your shopping list is empty</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Add items to get started</p>
      </div>

      <!-- Info Message -->
      <div class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p class="text-sm text-blue-800 dark:text-blue-200">
          💡 Click on an item to see available prices on the map
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
