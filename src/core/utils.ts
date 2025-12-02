/**
 * Safe way to retrieve a value from an array with circular indexing
 * Handles negative indices and wraps around array bounds
 * @param values - Array to retrieve value from
 * @returns Function that takes an index and returns the value at that position
 */
export const getValueAt =
  <T>(values: T[]) =>
  (index: number): T | undefined => {
    if (!Array.isArray(values) || values.length === 0) {
      return undefined
    }
    if (!Number.isInteger(index)) {
      return undefined
    }

    // Handle circular indexing for negative numbers
    const normalizedIndex = ((index % values.length) + values.length) % values.length
    return values[normalizedIndex]
  }
