import { describe, expect, it } from "vitest"

import { formatTimestamp, parseChapterCandidates, validateAndRepairChapters } from "../../src/chapters/index.js"

describe("chapter parsing and formatting", () => {
  it("parses MM:SS and HH:MM:SS candidates", () => {
    const parsed = parseChapterCandidates("00:00 - Contexto\n1:02:03 - Cierre")

    expect(parsed.errors).toEqual([])
    expect(parsed.chapters.map((chapter) => chapter.seconds)).toEqual([0, 3723])
  })

  it("formats timestamps using YouTube-compatible chapter style", () => {
    expect(formatTimestamp(0)).toBe("00:00")
    expect(formatTimestamp(65)).toBe("01:05")
    expect(formatTimestamp(3661)).toBe("1:01:01")
  })
})

describe("validateAndRepairChapters", () => {
  it("repairs first timestamp and short gaps when possible", () => {
    const result = validateAndRepairChapters(
      "00:05 - Setup real\n00:08 - Parser\n00:11 - Validación",
      { durationSeconds: 120 },
    )

    expect(result.valid).toBe(true)
    expect(result.lines).toEqual([
      "00:00 - Setup real",
      "00:10 - Parser",
      "00:20 - Validación",
    ])
    expect(result.warnings).toContain("First chapter timestamp was repaired to 00:00.")
  })

  it("sorts repairable non-ascending timestamps", () => {
    const result = validateAndRepairChapters(
      "00:00 - Inicio\n00:30 - Final\n00:20 - Medio",
      { durationSeconds: 120 },
    )

    expect(result.valid).toBe(true)
    expect(result.lines).toEqual([
      "00:00 - Inicio",
      "00:20 - Medio",
      "00:30 - Final",
    ])
  })

  it("rejects videos under 30 seconds", () => {
    const result = validateAndRepairChapters(
      "00:00 - Uno\n00:10 - Dos\n00:20 - Tres",
      { durationSeconds: 29 },
    )

    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Videos under 30 seconds are not apt for YouTube chapters.")
  })

  it("rejects fewer than 3 chapters", () => {
    const result = validateAndRepairChapters("00:00 - Uno\n00:10 - Dos", { durationSeconds: 90 })

    expect(result.valid).toBe(false)
    expect(result.errors).toContain("YouTube chapters require at least 3 chapters.")
  })

  it("rejects timestamps beyond known duration after repair", () => {
    const result = validateAndRepairChapters(
      "00:00 - Uno\n00:10 - Dos\n00:55 - Tres",
      { durationSeconds: 45 },
    )

    expect(result.valid).toBe(false)
    expect(result.errors).toContain("Chapter timestamp 55s is beyond the video duration (45s).")
  })
})
