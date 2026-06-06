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

  it("uses configured glossary defaults when no tool glossary is provided", () => {
    const result = validateChapterToolInput(
      {
        chapters: "00:00 - Seller Data overview\n00:12 - Seller platform\n00:30 - Cierre",
        durationSeconds: 90,
      },
      { "Seller Data": "ZelerData", Seller: "Zeler" },
    )

    expect(result.lines).toEqual(["00:00 - ZelerData overview", "00:12 - Zeler platform", "00:30 - Cierre"])
  })

  it("prefers an explicit tool glossary over configured defaults", () => {
    const result = validateChapterToolInput(
      {
        chapters: "00:00 - Seller overview\n00:12 - Tema\n00:30 - Cierre",
        durationSeconds: 90,
        glossary: { Seller: "Explicit" },
      },
      { Seller: "Configured" },
    )

    expect(result.lines[0]).toBe("00:00 - Explicit overview")
  })

  it("falls back to configured defaults when explicit glossary normalizes to empty", () => {
    const result = validateChapterToolInput(
      {
        chapters: "00:00 - Seller overview\n00:12 - Tema\n00:30 - Cierre",
        durationSeconds: 90,
        glossary: { "": "Ignored" },
      },
      { Seller: "Configured" },
    )

    expect(result.lines[0]).toBe("00:00 - Configured overview")
  })
})
