export interface TranscriptSegment {
  text: string
  startSeconds: number
  durationSeconds?: number
}

export interface TranscriptResult {
  videoId: string
  language?: string
  isGenerated?: boolean
  durationSeconds?: number
  segments: TranscriptSegment[]
}

export interface TranscriptProvider {
  fetch(videoId: string): Promise<TranscriptResult>
}

export function inferDurationSeconds(segments: TranscriptSegment[]): number | undefined {
  const last = [...segments].sort((a, b) => a.startSeconds - b.startSeconds).at(-1)
  if (!last) return undefined
  return Math.ceil(last.startSeconds + (last.durationSeconds ?? 0))
}
