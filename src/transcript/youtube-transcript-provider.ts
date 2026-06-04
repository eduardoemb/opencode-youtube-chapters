import { YoutubeTranscript } from "youtube-transcript"

import { MissingTranscriptError } from "../errors.js"
import { inferDurationSeconds, type TranscriptProvider, type TranscriptResult, type TranscriptSegment } from "./provider.js"

interface RawTranscriptItem {
  text?: string
  offset?: number
  duration?: number
  start?: number
  dur?: number
}

export class YoutubeTranscriptProvider implements TranscriptProvider {
  async fetch(videoId: string): Promise<TranscriptResult> {
    try {
      const rows = await YoutubeTranscript.fetchTranscript(videoId)
      if (!rows.length) {
        throw new MissingTranscriptError(`No transcript rows were returned for video ${videoId}.`)
      }

      const timeScale = detectTimeScale(rows)
      const segments = rows.map((row) => toTranscriptSegment(row, timeScale)).filter((segment) => segment.text.length > 0)
      if (!segments.length) {
        throw new MissingTranscriptError(`Transcript for video ${videoId} did not contain usable text.`)
      }

      return {
        videoId,
        durationSeconds: inferDurationSeconds(segments),
        segments,
      }
    } catch (error) {
      if (error instanceof MissingTranscriptError) throw error
      const message = error instanceof Error ? error.message : String(error)
      throw new MissingTranscriptError(`No available YouTube transcript/subtitles could be fetched for video ${videoId}: ${message}`)
    }
  }
}

function toTranscriptSegment(row: RawTranscriptItem, timeScale: "milliseconds" | "seconds"): TranscriptSegment {
  const start = row.offset ?? row.start ?? 0
  const duration = row.duration ?? row.dur
  return {
    text: decodeHtml(stripWhitespace(row.text ?? "")),
    startSeconds: toSeconds(start, timeScale),
    durationSeconds: duration === undefined ? undefined : toSeconds(duration, timeScale),
  }
}

function detectTimeScale(rows: RawTranscriptItem[]): "milliseconds" | "seconds" {
  return rows.some((row) => (row.duration ?? row.dur ?? 0) > 120) ? "milliseconds" : "seconds"
}

function toSeconds(value: number, timeScale: "milliseconds" | "seconds"): number {
  const seconds = timeScale === "milliseconds" ? value / 1000 : value
  return Number(seconds.toFixed(3))
}

function stripWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}
