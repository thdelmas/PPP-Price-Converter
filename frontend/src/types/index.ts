export interface PPPData {
  country: string
  countryCode: string
  currency: string
  currencyCode: string
  pppConversionFactor: number
  exchangeRate: number
  year: number
  lastUpdated: string
}

export interface Country {
  name: string
  code: string
  currency: string
  currencyCode: string
  flag?: string
  region?: string
}

export interface ConversionRequest {
  amount: number
  sourceCurrency: string
  sourceCountry: string
  targetCountries: string[]
}

export interface ConversionResult {
  sourceAmount: number
  sourceCurrency: string
  sourceCountry: string
  targetAmount: number
  targetCurrency: string
  targetCountry: string
  pppAdjustedAmount: number
  conversionRate: number
  pppFactor: number
}
