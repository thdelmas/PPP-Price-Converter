<script setup lang="ts">
import { ref } from 'vue'

const title = ref('PPP Price Converter')
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {{ title }}
      </h1>
      <div class="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <p class="text-center text-gray-600 dark:text-gray-300">
          Convert prices across different countries using Purchasing Power Parity (PPP) data.
        </p>
      </div>
    </div>
  </div>
</template>
