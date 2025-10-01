/**
 * Parse PPP CSV data and extract conversion factors
 */

import type { Country } from '@/types'
import {
  countryCodeToCurrencyCode,
  currencyNames,
  getCountryFlag,
  getCurrencyToCountryCode as getCurrencyMapping,
} from './currencyMapping'

interface PPPCountryData {
  countryName: string
  countryCode: string
  pppFactor: number | null
  year: number
}

/**
 * Parse a CSV line respecting quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

/**
 * Load and parse PPP data from CSV
 */
export async function loadPPPData(): Promise<Map<string, PPPCountryData>> {
  const response = await fetch('/ppp_2025.csv')
  const text = await response.text()
  const lines = text.trim().split('\n')

  if (lines.length < 2) {
    throw new Error('Invalid CSV file')
  }

  // Parse header to find year columns
  const headerLine = lines[0]
  if (!headerLine) {
    throw new Error('Invalid CSV file: missing header')
  }
  const headers = parseCSVLine(headerLine)

  // Find the most recent year with data (2024 is the latest year in the dataset)
  const yearIndex = headers.indexOf('2024')

  if (yearIndex === -1) {
    throw new Error('2024 data not found in CSV')
  }

  const dataMap = new Map<string, PPPCountryData>()

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line) continue

    const values = parseCSVLine(line)

    if (values.length < yearIndex + 1) {
      continue
    }

    const countryName = values[0]
    const countryCode = values[1]
    const pppValue = values[yearIndex]

    // Skip if any required field is missing
    if (!countryName || !countryCode || !pppValue || pppValue === '') {
      continue
    }

    const pppFactor = parseFloat(pppValue)

    if (isNaN(pppFactor)) {
      continue
    }

    dataMap.set(countryCode, {
      countryName,
      countryCode,
      pppFactor,
      year: 2024,
    })
  }

  return dataMap
}

/**
 * Get list of countries with PPP data
 * Returns Country objects with name, code, currency info, and flags
 */
export async function getCountriesFromPPPData(): Promise<Country[]> {
  const pppData = await loadPPPData()
  const countries: Country[] = []

  for (const [countryCode, data] of pppData.entries()) {
    // Get currency code for this country
    const currencyCode = countryCodeToCurrencyCode[countryCode]

    // Skip countries without currency mapping
    if (!currencyCode) {
      continue
    }

    // Get currency name
    const currency = currencyNames[currencyCode] || currencyCode

    // Get flag emoji
    const flag = getCountryFlag(countryCode)

    countries.push({
      name: data.countryName,
      code: countryCode,
      currency,
      currencyCode,
      flag,
    })
  }

  // Sort countries alphabetically by name
  countries.sort((a, b) => a.name.localeCompare(b.name))

  return countries
}

/**
 * Re-export currency mapping functions for backward compatibility
 */
export { countryCodeToCurrencyCode }
export function getCurrencyToCountryCode(): Record<string, string> {
  return getCurrencyMapping()
}
