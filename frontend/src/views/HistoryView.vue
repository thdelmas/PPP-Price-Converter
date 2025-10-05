<script setup lang="ts">
import { ref } from 'vue'

interface HistoryEntry {
  id: string
  date: Date
  originCountry: string
  targetCountry: string
  originCurrency: string
  targetCurrency: string
  amount: number
  convertedAmount: number
  pppAdjustedAmount: number
}

// Sample history data (in production, this would come from a store/API)
const history = ref<HistoryEntry[]>([
  {
    id: '1',
    date: new Date('2024-01-15T10:30:00'),
    originCountry: 'United States',
    targetCountry: 'United Kingdom',
    originCurrency: 'USD',
    targetCurrency: 'GBP',
    amount: 100,
    convertedAmount: 79.25,
    pppAdjustedAmount: 85.50,
  },
  {
    id: '2',
    date: new Date('2024-01-14T15:45:00'),
    originCountry: 'United States',
    targetCountry: 'Japan',
    originCurrency: 'USD',
    targetCurrency: 'JPY',
    amount: 50,
    convertedAmount: 7350,
    pppAdjustedAmount: 6800,
  },
  {
    id: '3',
    date: new Date('2024-01-13T09:20:00'),
    originCountry: 'United Kingdom',
    targetCountry: 'France',
    originCurrency: 'GBP',
    targetCurrency: 'EUR',
    amount: 200,
    convertedAmount: 234.50,
    pppAdjustedAmount: 230.00,
  },
])

const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const clearHistory = () => {
  if (confirm('Are you sure you want to clear all history?')) {
    history.value = []
  }
}

const deleteEntry = (id: string) => {
  history.value = history.value.filter((entry) => entry.id !== id)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Conversion History</h1>
        <button
          v-if="history.length > 0"
          @click="clearHistory"
          class="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>

      <!-- History Items -->
      <div class="space-y-4">
        <div
          v-for="entry in history"
          :key="entry.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex justify-between items-start mb-3">
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(entry.date) }}</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {{ entry.originCountry }} → {{ entry.targetCountry }}
              </p>
            </div>
            <button
              @click="deleteEntry(entry.id)"
              class="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete entry"
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

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <!-- Original Amount -->
            <div class="bg-gray-50 dark:bg-gray-700 rounded p-3">
              <p class="text-xs text-gray-500 dark:text-gray-400">Original</p>
              <p class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ formatCurrency(entry.amount, entry.originCurrency) }}
              </p>
            </div>

            <!-- Exchange Rate Conversion -->
            <div class="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
              <p class="text-xs text-gray-600 dark:text-gray-400">Exchange Rate</p>
              <p class="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {{ formatCurrency(entry.convertedAmount, entry.targetCurrency) }}
              </p>
            </div>

            <!-- PPP Adjusted -->
            <div class="bg-green-50 dark:bg-green-900/20 rounded p-3">
              <p class="text-xs text-gray-600 dark:text-gray-400">PPP Adjusted</p>
              <p class="text-lg font-semibold text-green-600 dark:text-green-400">
                {{ formatCurrency(entry.pppAdjustedAmount, entry.targetCurrency) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="history.length === 0" class="text-center py-12">
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
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-gray-500 dark:text-gray-400">No conversion history</p>
        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Your past conversions will appear here
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
