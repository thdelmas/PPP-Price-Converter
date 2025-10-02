/**
 * Currency Service
 * Fetches real-time exchange rates from external API
 */

export interface ExchangeRates {
  base: string
  rates: Record<string, number>
  timestamp: number
  lastUpdated?: string
}

const CACHE_KEY = 'currency_exchange_rates'
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

// Fallback exchange rates (relative to USD, approximate values)
const FALLBACK_RATES: ExchangeRates = {
  base: 'USD',
  rates: {
    USD: 1.0,
    GBP: 0.79,
    EUR: 0.92,
    JPY: 149.0,
    CAD: 1.36,
    AUD: 1.53,
    INR: 83.0,
    CNY: 7.24,
    CHF: 0.88,
    NOK: 10.5,
    SEK: 10.3,
    DKK: 6.9,
    PLN: 4.0,
    TRY: 32.0,
    RUB: 92.0,
    BRL: 5.0,
    MXN: 17.0,
    ZAR: 18.5,
    KRW: 1320.0,
    SGD: 1.34,
    HKD: 7.8,
    NZD: 1.63,
    IDR: 15700.0,
    THB: 35.0,
    MYR: 4.7,
    PHP: 56.0,
    ISK: 137.0,
    CZK: 23.0,
    HUF: 360.0,
    RON: 4.6,
    HRK: 7.0,
    BDT: 110.0,
    PKR: 278.0,
    VND: 24500.0,
    EGP: 48.5,
    NGN: 1400.0,
    ARS: 990.0,
    CLP: 950.0,
    COP: 4050.0,
    PER: 3.8,
    ILS: 3.7,
    AED: 3.67,
    SAR: 3.75,
    QAR: 3.64,
    KWD: 0.31,
    OMR: 0.38,
    BHD: 0.38,
    JOD: 0.71,
    LBP: 89500.0,
    MAD: 10.0,
    TND: 3.1,
    DZA: 135.0,
    LKR: 325.0,
    NPR: 132.0,
    BGD: 110.0,
    MMK: 2100.0,
    KHR: 4100.0,
    LAK: 20500.0,
    BYN: 3.25,
    MDL: 17.8,
    GEL: 2.65,
    AMD: 390.0,
    AZN: 1.7,
    KZT: 450.0,
    KGS: 88.0,
    TJS: 10.9,
    TMT: 3.5,
    UZS: 12500.0,
    UAH: 41.0,
    MKD: 56.5,
    RSD: 108.0,
    BAM: 1.8,
    ALL: 93.0,
    IRR: 42000.0,
    IQD: 1310.0,
    SYP: 13000.0,
    YER: 250.0,
    AOA: 900.0,
    XOF: 605.0,
    XAF: 605.0,
    GHS: 15.0,
    KES: 130.0,
    UGX: 3700.0,
    TZS: 2600.0,
    ETB: 120.0,
    ZMW: 27.0,
    MWK: 1730.0,
    RWF: 1360.0,
    BIF: 2850.0,
    MGA: 4500.0,
    MUR: 46.0,
    SCR: 14.0,
    CVE: 102.0,
    GMD: 70.0,
    SLL: 22000.0,
    LRD: 190.0,
    DJF: 178.0,
    SOS: 570.0,
    SDG: 600.0,
    SSP: 130.0,
    ERN: 15.0,
    MZN: 64.0,
    BWP: 13.5,
    NAD: 18.5,
    SZL: 18.5,
    LSL: 18.5,
    ZWL: 322.0,
    XCD: 2.7,
    TTD: 6.8,
    JMD: 155.0,
    BBD: 2.0,
    BSD: 1.0,
    BZD: 2.0,
    GYD: 209.0,
    SRD: 35.5,
    HTG: 132.0,
    DOP: 59.0,
    CRC: 520.0,
    GTQ: 7.8,
    HNL: 24.8,
    NIO: 36.8,
    PAB: 1.0,
    PYG: 7350.0,
    UYU: 42.0,
    BOB: 6.9,
    VES: 36.5,
    PGK: 3.9,
    WST: 2.8,
    TOP: 2.4,
    FJD: 2.3,
    VUV: 119.0,
    SBD: 8.5,
    STN: 24.0,
    KMF: 455.0,
    MVR: 15.4,
    BND: 1.34,
    MNT: 3400.0,
    AFN: 70.0,
    BTN: 83.0,
    GNF: 8600.0,
  },
  timestamp: Date.now(),
  lastUpdated: 'Static fallback rates',
}

/**
 * Fetch exchange rates from API
 * Uses exchangerate-api.com free tier (no API key required for basic usage)
 * Falls back to localStorage cache if API fails
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // Try to get from cache first
    const cached = getCachedRates()
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('Using cached exchange rates')
      return cached
    }

    // Fetch from API - using exchangerate-api.com free tier
    // Alternative: 'https://open.er-api.com/v6/latest/USD'
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    const exchangeRates: ExchangeRates = {
      base: data.base || 'USD',
      rates: data.rates || {},
      timestamp: Date.now(),
      lastUpdated: data.date || new Date().toISOString().split('T')[0],
    }

    // Cache the rates
    cacheRates(exchangeRates)

    console.log('Fetched fresh exchange rates from API')
    return exchangeRates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)

    // Try to use cached rates even if expired
    const cached = getCachedRates()
    if (cached) {
      console.warn('Using expired cached rates due to API failure')
      return cached
    }

    // Fall back to static rates
    console.warn('Using fallback static rates')
    return FALLBACK_RATES
  }
}

/**
 * Get exchange rates from localStorage cache
 */
function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (error) {
    console.error('Failed to read cached rates:', error)
  }
  return null
}

/**
 * Store exchange rates in localStorage cache
 */
function cacheRates(rates: ExchangeRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates))
  } catch (error) {
    console.error('Failed to cache rates:', error)
  }
}

/**
 * Convert currency amount using exchange rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  // If converting to same currency, return the same amount
  if (fromCurrency === toCurrency) {
    return amount
  }

  const fromRate = rates.rates[fromCurrency]
  const toRate = rates.rates[toCurrency]

  if (!fromRate || !toRate) {
    console.warn(`Missing rate for ${fromCurrency} or ${toCurrency}`)
    return amount // Return original amount if rates not available
  }

  // Convert from source to base currency (USD), then to target currency
  if (rates.base === fromCurrency) {
    return amount * toRate
  } else if (rates.base === toCurrency) {
    return amount / fromRate
  } else {
    // Convert via base currency
    const amountInBase = amount / fromRate
    return amountInBase * toRate
  }
}

/**
 * Get the exchange rate between two currencies
 */
export function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) {
    return 1
  }

  const fromRate = rates.rates[fromCurrency]
  const toRate = rates.rates[toCurrency]

  if (!fromRate || !toRate) {
    return 1 // Return 1:1 if rates not available
  }

  // Calculate the conversion rate
  if (rates.base === fromCurrency) {
    return toRate
  } else if (rates.base === toCurrency) {
    return 1 / fromRate
  } else {
    return toRate / fromRate
  }
}
