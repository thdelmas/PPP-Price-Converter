<script setup lang="ts">
import { ref } from 'vue'
import PriceConverter from '@/components/converter/PriceConverter.vue'

const title = ref('PPP Price Converter')
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
        {{ title }}
      </h1>

      <div class="max-w-4xl mx-auto mb-8">
        <p class="text-center text-gray-600 dark:text-gray-300 mb-2">
          Convert prices across different countries using Purchasing Power Parity (PPP) data.
        </p>
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Compare exchange rate conversions with PPP-adjusted prices to understand true purchasing
          power.
        </p>
      </div>

      <PriceConverter />
    </div>
  </div>
</template>
