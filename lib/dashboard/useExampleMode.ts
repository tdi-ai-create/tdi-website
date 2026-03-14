'use client'

export interface ExampleModeResult {
  displayValue: string | number
  isExample:    boolean
  hasRealData:  boolean
}

export function useExampleMode(
  value:      any,
  defaultKey: string,
  defaults:   Record<string, string>
): ExampleModeResult {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === '' ||
    value === 0 ||
    (typeof value === 'number' && isNaN(value))

  return {
    displayValue: isEmpty ? (defaults[defaultKey] ?? '—') : value,
    isExample:    isEmpty,
    hasRealData:  !isEmpty,
  }
}

// For checking if an entire section has any real data
export function sectionHasRealData(values: any[]): boolean {
  return values.some(v =>
    v !== null &&
    v !== undefined &&
    v !== '' &&
    v !== 0 &&
    !(typeof v === 'number' && isNaN(v))
  )
}
