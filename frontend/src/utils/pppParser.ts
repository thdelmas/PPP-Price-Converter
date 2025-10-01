/**
 * Parse PPP CSV data and extract conversion factors
 */

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
 * Map country codes (ISO 3166-1 alpha-3) to currency codes
 */
export const countryCodeToCurrencyCode: Record<string, string> = {
  USA: 'USD',
  GBR: 'GBP',
  JPN: 'JPY',
  CAN: 'CAD',
  AUS: 'AUD',
  IND: 'INR',
  CHN: 'CNY',
  // Euro area countries
  AUT: 'EUR', // Austria
  BEL: 'EUR', // Belgium
  CYP: 'EUR', // Cyprus
  EST: 'EUR', // Estonia
  FIN: 'EUR', // Finland
  FRA: 'EUR', // France
  DEU: 'EUR', // Germany
  GRC: 'EUR', // Greece
  IRL: 'EUR', // Ireland
  ITA: 'EUR', // Italy
  LVA: 'EUR', // Latvia
  LTU: 'EUR', // Lithuania
  LUX: 'EUR', // Luxembourg
  MLT: 'EUR', // Malta
  NLD: 'EUR', // Netherlands
  PRT: 'EUR', // Portugal
  SVK: 'EUR', // Slovakia
  SVN: 'EUR', // Slovenia
  ESP: 'EUR', // Spain
}

/**
 * Get currency code to country code mapping (reverse)
 */
export function getCurrencyToCountryCode(): Record<string, string> {
  const reverseMap: Record<string, string> = {
    // Explicitly set EUR to use Germany as the representative
    EUR: 'DEU',
  }
  
  for (const [countryCode, currencyCode] of Object.entries(countryCodeToCurrencyCode)) {
    // Use the first country for each currency (unless already set)
    if (!reverseMap[currencyCode]) {
      reverseMap[currencyCode] = countryCode
    }
  }
  
  return reverseMap
}
