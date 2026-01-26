import { formatPercentage } from '../formatters'

describe('formatPercentage', () => {
  test('rounds and formats with no decimals', () => {
    expect(formatPercentage(80.33333333)).toBe('80%')
    expect(formatPercentage(80)).toBe('80%')
    expect(formatPercentage(0)).toBe('0%')
  })

  test('handles non-finite values gracefully', () => {
    // @ts-ignore - simulate NaN/undefined
    expect(formatPercentage(NaN)).toBe('0%')
    // @ts-ignore
    expect(formatPercentage(undefined)).toBe('0%')
  })
})
