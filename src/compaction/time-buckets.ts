import { inferDurationSeconds, type TranscriptSegment } from "../transcript/provider.js"

export interface TranscriptBucket {
  startSeconds: number
  endSeconds: number
  text: string
  segmentCount: number
}

export interface CompactTranscriptOptions {
  bucketSeconds?: number
  maxCharactersPerBucket?: number
}

export function compactTranscriptSegments(
  segments: TranscriptSegment[],
  options: CompactTranscriptOptions = {},
): TranscriptBucket[] {
  if (!segments.length) return []

  const bucketSeconds = clampNumber(options.bucketSeconds ?? 180, 30, 600)
  const maxCharactersPerBucket = clampNumber(options.maxCharactersPerBucket ?? 2500, 10, 10_000)
  const sorted = [...segments].sort((a, b) => a.startSeconds - b.startSeconds)
  const buckets: TranscriptBucket[] = []

  let current = createBucket(Math.floor(sorted[0].startSeconds / bucketSeconds) * bucketSeconds)

  for (const segment of sorted) {
    const segmentEnd = segment.startSeconds + (segment.durationSeconds ?? 0)
    const exceedsBucket = segment.startSeconds >= current.startSeconds + bucketSeconds

    if (exceedsBucket && current.segmentCount > 0) {
      buckets.push(finalizeBucket(current, maxCharactersPerBucket))
      current = createBucket(Math.floor(segment.startSeconds / bucketSeconds) * bucketSeconds)
    }

    current.endSeconds = Math.max(current.endSeconds, segmentEnd, segment.startSeconds)
    current.text = appendText(current.text, segment.text, maxCharactersPerBucket)
    current.segmentCount += 1
  }

  if (current.segmentCount > 0) {
    buckets.push(finalizeBucket(current, maxCharactersPerBucket))
  }

  return buckets
}

export function inferTranscriptDuration(segments: TranscriptSegment[]): number | undefined {
  return inferDurationSeconds(segments)
}

function createBucket(startSeconds: number): TranscriptBucket {
  return {
    startSeconds,
    endSeconds: startSeconds,
    text: "",
    segmentCount: 0,
  }
}

function finalizeBucket(bucket: TranscriptBucket, maxCharacters: number): TranscriptBucket {
  return {
    ...bucket,
    startSeconds: Math.floor(bucket.startSeconds),
    endSeconds: Math.ceil(bucket.endSeconds),
    text: trimToBoundary(bucket.text.trim(), maxCharacters),
  }
}

function appendText(current: string, next: string, maxCharacters: number): string {
  if (!next) return current
  const joined = current ? `${current} ${next}` : next
  return trimToBoundary(joined, maxCharacters)
}

function trimToBoundary(value: string, maxCharacters: number): string {
  if (value.length <= maxCharacters) return value
  const truncated = value.slice(0, maxCharacters)
  const lastSpace = truncated.lastIndexOf(" ")
  return `${truncated.slice(0, lastSpace > 0 ? lastSpace : maxCharacters).trim()}…`
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
