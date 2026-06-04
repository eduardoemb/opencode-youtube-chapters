import { UnsupportedInputError } from "../errors.js"

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/

export interface ParsedYouTubeInput {
  videoId: string
  canonicalUrl: string
  kind: "video"
}

export function parseYouTubeInput(input: string): ParsedYouTubeInput {
  const value = input.trim()

  if (!value) {
    throw new UnsupportedInputError("Missing YouTube URL or video ID. Usage: /chapters <youtube-url-or-video-id>.")
  }

  if (VIDEO_ID_PATTERN.test(value)) {
    return toParsed(value)
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new UnsupportedInputError("Unsupported YouTube input. Provide a full YouTube URL, youtu.be URL, or 11-character video ID.")
  }

  const hostname = url.hostname.replace(/^www\./, "").toLowerCase()
  const pathParts = url.pathname.split("/").filter(Boolean)

  if (pathParts[0]?.toLowerCase() === "shorts") {
    throw new UnsupportedInputError("YouTube Shorts are not supported in V1. Provide a regular video or completed livestream URL.")
  }

  if (hostname === "youtu.be") {
    return toParsed(extractVideoId(pathParts[0]))
  }

  if (hostname === "youtube.com" || hostname === "m.youtube.com" || hostname.endsWith(".youtube.com") || hostname === "youtube-nocookie.com") {
    const watchId = url.searchParams.get("v")
    if (watchId) return toParsed(extractVideoId(watchId))

    if (["live", "embed", "v"].includes(pathParts[0] ?? "")) {
      return toParsed(extractVideoId(pathParts[1]))
    }
  }

  throw new UnsupportedInputError("Unsupported YouTube URL. Use a regular YouTube video URL, youtu.be URL, completed livestream URL, or raw video ID.")
}

function extractVideoId(candidate: string | undefined): string {
  const videoId = candidate?.trim()
  if (!videoId || !VIDEO_ID_PATTERN.test(videoId)) {
    throw new UnsupportedInputError("Could not find a valid 11-character YouTube video ID in the provided input.")
  }
  return videoId
}

function toParsed(videoId: string): ParsedYouTubeInput {
  return {
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    kind: "video",
  }
}
