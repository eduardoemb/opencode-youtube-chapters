import { describe, expect, it } from "vitest"

import { MissingTranscriptError, UnsupportedInputError } from "../../src/errors.js"
import { fetchTranscriptForInput } from "../../src/tools/fetch-transcript.js"
import type { TranscriptProvider } from "../../src/transcript/provider.js"

describe("fetchTranscriptForInput", () => {
  it("normalizes input and returns compact buckets with a fake provider", async () => {
    const provider: TranscriptProvider = {
      async fetch(videoId) {
        return {
          videoId,
          segments: [
            { startSeconds: 0, durationSeconds: 5, text: "Arranque" },
            { startSeconds: 20, durationSeconds: 5, text: "Tema central" },
          ],
        }
      },
    }

    const result = await fetchTranscriptForInput({ input: "https://youtu.be/dQw4w9WgXcQ", bucketSeconds: 60 }, provider)

    expect(result.videoId).toBe("dQw4w9WgXcQ")
    expect(result.durationSeconds).toBe(25)
    expect(result.chapterRules).toEqual([])
    expect(result.glossary).toEqual({})
    expect(result.buckets).toHaveLength(1)
    expect(result.buckets[0].text).toBe("Arranque Tema central")
  })

  it("returns normalized chapter rules and glossary without mutating transcript buckets", async () => {
    const provider: TranscriptProvider = {
      async fetch(videoId) {
        return {
          videoId,
          segments: [{ startSeconds: 0, durationSeconds: 5, text: "Seller Data habla de Seller" }],
        }
      },
    }

    const result = await fetchTranscriptForInput(
      { input: "dQw4w9WgXcQ", bucketSeconds: 60 },
      provider,
      {
        chapterRules: [" Usa Zeler como marca ", "", "No inventes nombres"],
        glossary: { "Seller Data": "ZelerData", Seller: "Zeler", "": "Ignored" },
      },
    )

    expect(result.chapterRules).toEqual(["Usa Zeler como marca", "No inventes nombres"])
    expect(result.glossary).toEqual({ "Seller Data": "ZelerData", Seller: "Zeler" })
    expect(result.buckets[0].text).toBe("Seller Data habla de Seller")
  })

  it("surfaces missing transcript errors from the provider", async () => {
    const provider: TranscriptProvider = {
      async fetch() {
        throw new MissingTranscriptError("No transcript")
      },
    }

    await expect(fetchTranscriptForInput({ input: "dQw4w9WgXcQ" }, provider)).rejects.toThrow(MissingTranscriptError)
  })

  it("rejects empty command input before calling the provider", async () => {
    let providerCalled = false
    const provider: TranscriptProvider = {
      async fetch() {
        providerCalled = true
        throw new Error("provider should not be called for empty input")
      },
    }

    await expect(fetchTranscriptForInput({ input: "   " }, provider)).rejects.toThrow(UnsupportedInputError)
    await expect(fetchTranscriptForInput({ input: "   " }, provider)).rejects.toThrow(/Usage: \/chapters <youtube-url-or-video-id>/)
    expect(providerCalled).toBe(false)
  })
})
