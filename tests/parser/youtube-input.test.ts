import { describe, expect, it } from "vitest"

import { UnsupportedInputError } from "../../src/errors.js"
import { parseYouTubeInput } from "../../src/parser/youtube-input.js"

describe("parseYouTubeInput", () => {
  it.each([
    ["full watch URL", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    ["watch URL with extra params", "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s"],
    ["short URL", "https://youtu.be/dQw4w9WgXcQ"],
    ["raw video ID", "dQw4w9WgXcQ"],
    ["completed livestream URL", "https://www.youtube.com/live/dQw4w9WgXcQ?feature=shared"],
    ["embed URL", "https://www.youtube.com/embed/dQw4w9WgXcQ"],
  ])("normalizes %s", (_label, input) => {
    expect(parseYouTubeInput(input)).toEqual({
      videoId: "dQw4w9WgXcQ",
      canonicalUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      kind: "video",
    })
  })

  it("rejects Shorts in V1", () => {
    expect(() => parseYouTubeInput("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toThrow(UnsupportedInputError)
  })

  it("rejects invalid input clearly", () => {
    expect(() => parseYouTubeInput("not-video")).toThrow(/Unsupported YouTube input/)
  })

  it("rejects empty command input with /chapters usage", () => {
    expect(() => parseYouTubeInput("   ")).toThrow(/Usage: \/chapters <youtube-url-or-video-id>/)
  })
})
