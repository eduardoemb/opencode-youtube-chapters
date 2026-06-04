import { compactTranscriptSegments, type TranscriptBucket } from "../compaction/time-buckets.js"
import { parseYouTubeInput } from "../parser/youtube-input.js"
import { YoutubeTranscriptProvider } from "../transcript/youtube-transcript-provider.js"
import { inferDurationSeconds, type TranscriptProvider } from "../transcript/provider.js"

export interface FetchTranscriptArgs {
  input: string
  bucketSeconds?: number
}

export interface FetchTranscriptResult {
  videoId: string
  canonicalUrl: string
  durationSeconds?: number
  buckets: TranscriptBucket[]
  warnings: string[]
}

export async function fetchTranscriptForInput(
  args: FetchTranscriptArgs,
  provider: TranscriptProvider = new YoutubeTranscriptProvider(),
): Promise<FetchTranscriptResult> {
  const parsed = parseYouTubeInput(args.input)
  const transcript = await provider.fetch(parsed.videoId)
  const buckets = compactTranscriptSegments(transcript.segments, { bucketSeconds: args.bucketSeconds })
  const durationSeconds = transcript.durationSeconds ?? inferDurationSeconds(transcript.segments)
  const warnings: string[] = []

  if (!buckets.length) {
    warnings.push("Transcript was fetched but no compact buckets were produced.")
  }

  if (durationSeconds === undefined) {
    warnings.push("Video duration could not be determined from transcript timing; validator can still run with an explicit duration if known.")
  }

  return {
    videoId: parsed.videoId,
    canonicalUrl: parsed.canonicalUrl,
    durationSeconds,
    buckets,
    warnings,
  }
}
