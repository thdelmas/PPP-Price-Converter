<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Country } from '@/types'
import { loadPPPData, getCountriesFromPPPData } from '@/utils/pppParser'
import { fetchExchangeRates, getExchangeRate, type ExchangeRates } from '@/services/currencyService'

// Country data dynamically loaded from CSV
const countries = ref<Country[]>([])

// PPP conversion factors loaded from CSV
const pppFactors = ref<Record<string, number>>({})

// Real-time exchange rates
const exchangeRates = ref<ExchangeRates | null>(null)

// Loading state
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const ratesLoadError = ref<string | null>(null)

// Load PPP data and exchange rates on mount
onMounted(async () => {
  try {
    // Load countries, PPP data, and exchange rates in parallel
    const [loadedCountries, pppData, rates] = await Promise.all([
      getCountriesFromPPPData(),
      loadPPPData(),
      fetchExchangeRates(),
    ])

    countries.value = loadedCountries
    exchangeRates.value = rates

    // Check if we're using fallback rates
    if (rates.lastUpdated === 'Static fallback rates') {
      ratesLoadError.value = 'Using fallback exchange rates (API unavailable)'
    }

    // Map PPP factors by country code (not currency code)
    // This ensures each country retains its unique PPP factor
    const factors: Record<string, number> = {}

    for (const [countryCode, data] of pppData.entries()) {
      if (data && data.pppFactor !== null) {
        factors[countryCode] = data.pppFactor
      }
    }

    pppFactors.value = factors
    isLoading.value = false
  } catch (error) {
    console.error('Failed to load PPP data:', error)
    loadError.value = 'Failed to load PPP data'
    isLoading.value = false
  }
})

// Component state
const price = ref<number | null>(1.0)
const originCountryCode = ref<string>('USA')
const targetCountryCode = ref<string>('GBR')

// Computed properties
const originCountry = computed(() =>
  countries.value.find((c) => c.code === originCountryCode.value)
)

const targetCountry = computed(() =>
  countries.value.find((c) => c.code === targetCountryCode.value)
)

const convertedPrice = computed(() => {
  if (
    !price.value ||
    !originCountry.value ||
    !targetCountry.value ||
    isLoading.value ||
    !exchangeRates.value
  ) {
    return null
  }

  const originCurrency = originCountry.value.currencyCode
  const targetCurrency = targetCountry.value.currencyCode

  const originPPP = pppFactors.value[originCountry.value.code]
  const targetPPP = pppFactors.value[targetCountry.value.code]

  // Guard against undefined PPP values
  if (!originPPP || !targetPPP) {
    return null
  }

  // Get the real-time exchange rate
  const conversionRate = getExchangeRate(originCurrency, targetCurrency, exchangeRates.value)

  // Convert using exchange rate
  const exchangeConverted = price.value * conversionRate

  // Apply PPP adjustment
  const pppAdjusted = (price.value * targetPPP) / originPPP

  return {
    exchange: exchangeConverted,
    ppp: pppAdjusted,
    currency: targetCurrency,
    originPPP,
    targetPPP,
    conversionRate,
  }
})

// Format currency
const formatCurrency = (amount: number, currencyCode: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Swap countries
const swapCountries = () => {
  const temp = originCountryCode.value
  originCountryCode.value = targetCountryCode.value
  targetCountryCode.value = temp
}
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading PPP data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="text-center py-12">
        <p class="text-red-600 dark:text-red-400">{{ loadError }}</p>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Exchange rates warning -->
        <div
          v-if="ratesLoadError"
          class="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
        >
          <p class="text-sm text-yellow-800 dark:text-yellow-200">⚠️ {{ ratesLoadError }}</p>
        </div>

        <!-- Price Input -->
        <div class="space-y-2">
          <label
            for="price-input"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Enter Price
          </label>
          <input
            id="price-input"
            v-model.number="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="1.00"
            class="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <!-- Origin Country Selector -->
        <div class="space-y-2">
          <label
            for="origin-country"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Origin Country & Currency
          </label>
          <select
            id="origin-country"
            v-model="originCountryCode"
            class="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option v-for="country in countries" :key="country.code" :value="country.code">
              {{ country.flag }} {{ country.name }} ({{ country.currencyCode }})
            </option>
          </select>
          <!-- PPP Factor Display for Origin -->
          <p
            v-if="originCountry && pppFactors[originCountry.code]"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            PPP Factor (2024): {{ pppFactors[originCountry.code]?.toFixed(3) }}
          </p>
        </div>

        <!-- Swap Button -->
        <div class="flex justify-center">
          <button
            type="button"
            class="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            @click="swapCountries"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        <!-- Target Country Selector -->
        <div class="space-y-2">
          <label
            for="target-country"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Target Country & Currency
          </label>
          <select
            id="target-country"
            v-model="targetCountryCode"
            class="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option v-for="country in countries" :key="country.code" :value="country.code">
              {{ country.flag }} {{ country.name }} ({{ country.currencyCode }})
            </option>
          </select>
          <!-- PPP Factor Display for Target -->
          <p
            v-if="targetCountry && pppFactors[targetCountry.code]"
            class="text-xs text-gray-500 dark:text-gray-400"
          >
            PPP Factor (2024): {{ pppFactors[targetCountry.code]?.toFixed(3) }}
          </p>
        </div>

        <!-- Results -->
        <div
          v-if="convertedPrice && price"
          class="mt-8 space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conversion Results
          </h3>

          <!-- Exchange Rate Conversion -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">Exchange Rate Conversion</p>
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ formatCurrency(convertedPrice.exchange, convertedPrice.currency) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Rate: 1 {{ originCountry?.currencyCode }} =
                  {{ convertedPrice.conversionRate.toFixed(4) }} {{ targetCountry?.currencyCode }}
                </p>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ originCountry?.currencyCode }} → {{ targetCountry?.currencyCode }}
              </div>
            </div>
          </div>

          <!-- PPP Adjusted Conversion -->
          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <div>
                <p class="text-sm text-gray-600 dark:text-gray-400">PPP-Adjusted Price</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">
                  {{ formatCurrency(convertedPrice.ppp, convertedPrice.currency) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Using PPP factors: {{ convertedPrice.originPPP.toFixed(3) }} (origin) /
                  {{ convertedPrice.targetPPP.toFixed(3) }} (target)
                </p>
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Purchasing Power Parity</div>
            </div>
          </div>

          <!-- Explanation -->
          <div class="text-xs text-gray-500 dark:text-gray-400 mt-4">
            <p>
              💡 <strong>Exchange Rate Conversion:</strong> Direct currency conversion using
              real-time market exchange rates.
            </p>
            <p class="mt-1">
              💡 <strong>PPP-Adjusted Price:</strong> Price adjusted for purchasing power
              differences, showing relative value in local economy.
            </p>
            <p class="mt-1">
              💡 <strong>PPP Factors:</strong> Based on World Bank 2024 data. A lower PPP factor
              means stronger purchasing power.
            </p>
            <p v-if="exchangeRates" class="mt-1">
              💡 <strong>Exchange rates updated:</strong>
              {{ exchangeRates.lastUpdated || 'Recently' }}
            </p>
          </div>
        </div>

        <!-- No input message -->
        <div v-else class="mt-8 text-center text-gray-500 dark:text-gray-400 py-12">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>Enter a price to see the conversion</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}
</style>
