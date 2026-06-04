import { describe, expect, it } from "vitest"

import { validateChapterToolInput } from "../../src/tools/validate.js"

describe("validateChapterToolInput", () => {
  it("returns the validator response shape used by the OpenCode tool", () => {
    const result = validateChapterToolInput({
      chapters: "00:00 - Inicio\n00:12 - Desarrollo\n00:30 - Cierre",
      durationSeconds: 90,
    })

    expect(result).toMatchObject({
      valid: true,
      lines: ["00:00 - Inicio", "00:12 - Desarrollo", "00:30 - Cierre"],
      errors: [],
      warnings: [],
    })
  })
})
