import { type Plugin, tool } from "@opencode-ai/plugin"

import { validateAndRepairChapters } from "./chapters/validate.js"
import { fetchTranscriptForInput } from "./tools/fetch-transcript.js"

export * from "./chapters/index.js"
export * from "./parser/youtube-input.js"
export * from "./tools/fetch-transcript.js"
export * from "./tools/validate.js"
export * from "./transcript/provider.js"
export * from "./transcript/youtube-transcript-provider.js"

export const YouTubeChaptersPlugin: Plugin = async () => ({
  tool: {
    youtube_chapters_fetch_transcript: tool({
      description:
        "Fetch available YouTube transcript/subtitle data for a regular video, youtu.be URL, raw video ID, or completed livestream URL, then return compact time buckets for chapter generation. Shorts and missing transcripts are rejected.",
      args: {
        input: tool.schema.string().describe("YouTube URL, youtu.be URL, completed livestream URL, or raw 11-character video ID."),
        bucketSeconds: tool.schema.number().optional().describe("Optional bucket size in seconds. Defaults to 180; clamped between 30 and 600."),
      },
      async execute(args) {
        const result = await fetchTranscriptForInput(args)
        return {
          title: `Transcript buckets for ${result.videoId}`,
          output: JSON.stringify(result, null, 2),
        }
      },
    }),
    youtube_chapters_validate: tool({
      description:
        "Validate and repair proposed YouTube chapter lines. Enforces first 00:00, 3-10 chapters, ascending timestamps, at least 10 seconds between chapters, optional duration bounds, and returns final lines formatted as `00:00 - Título`.",
      args: {
        chapters: tool.schema.string().describe("Proposed chapter lines generated from transcript buckets."),
        durationSeconds: tool.schema.number().optional().describe("Optional video duration in seconds, usually returned by youtube_chapters_fetch_transcript."),
      },
      async execute(args) {
        const result = validateAndRepairChapters(args.chapters, { durationSeconds: args.durationSeconds })
        return {
          title: result.valid ? "Valid YouTube chapters" : "Invalid YouTube chapters",
          output: JSON.stringify(result, null, 2),
        }
      },
    }),
  },
})

export const server = YouTubeChaptersPlugin

export default YouTubeChaptersPlugin
