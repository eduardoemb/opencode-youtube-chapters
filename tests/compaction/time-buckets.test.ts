import { describe, expect, it } from "vitest"

import { compactTranscriptSegments } from "../../src/compaction/time-buckets.js"

describe("compactTranscriptSegments", () => {
  it("merges transcript segments into chronological buckets", () => {
    const buckets = compactTranscriptSegments(
      [
        { startSeconds: 0, durationSeconds: 4, text: "Primera idea" },
        { startSeconds: 12, durationSeconds: 4, text: "segunda idea" },
        { startSeconds: 61, durationSeconds: 3, text: "otra sección" },
      ],
      { bucketSeconds: 60 },
    )

    expect(buckets).toEqual([
      { startSeconds: 0, endSeconds: 16, text: "Primera idea segunda idea", segmentCount: 2 },
      { startSeconds: 60, endSeconds: 64, text: "otra sección", segmentCount: 1 },
    ])
  })

  it("truncates oversized buckets at a word boundary", () => {
    const buckets = compactTranscriptSegments(
      [{ startSeconds: 0, durationSeconds: 1, text: "uno dos tres cuatro cinco" }],
      { maxCharactersPerBucket: 10 },
    )

    expect(buckets[0].text).toBe("uno dos…")
  })
})
