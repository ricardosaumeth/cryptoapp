import { describe, it, expect } from "vitest"
import { getValueAt } from "./utils"

describe("getValueAt", () => {
  const testArray = ["a", "b", "c"]
  const getValue = getValueAt(testArray)

  it("should return value at positive index", () => {
    expect(getValue(0)).toBe("a")
    expect(getValue(1)).toBe("b")
    expect(getValue(2)).toBe("c")
  })

  it("should handle circular indexing for out-of-bounds positive indices", () => {
    expect(getValue(3)).toBe("a") // wraps to index 0
    expect(getValue(4)).toBe("b") // wraps to index 1
  })

  it("should handle negative indices with circular wrapping", () => {
    expect(getValue(-1)).toBe("c") // last element
    expect(getValue(-2)).toBe("b") // second to last
    expect(getValue(-4)).toBe("c") // wraps around
  })

  it("should return undefined for empty array", () => {
    const getEmpty = getValueAt([])
    expect(getEmpty(0)).toBeUndefined()
  })

  it("should return undefined for non-integer indices", () => {
    expect(getValue(1.5)).toBeUndefined()
    expect(getValue(NaN)).toBeUndefined()
  })

  it("should return undefined for non-array input", () => {
    const getInvalid = getValueAt(null as any)
    expect(getInvalid(0)).toBeUndefined()
  })

  it("should work with different data types", () => {
    const numbers = getValueAt([1, 2, 3])
    expect(numbers(0)).toBe(1)

    const objects = getValueAt([{ id: 1 }, { id: 2 }])
    expect(objects(0)).toEqual({ id: 1 })
  })
})
