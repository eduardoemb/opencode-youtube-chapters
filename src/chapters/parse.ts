export interface ChapterCandidate {
  seconds: number
  title: string
  originalLine: string
}

export interface ChapterParseResult {
  chapters: ChapterCandidate[]
  errors: string[]
}

const CHAPTER_LINE_PATTERN = /^((?:\d{1,2}:)?\d{1,3}:\d{2})\s*(?:[-–—:]\s*)?(.+)$/

export function parseChapterCandidates(text: string): ChapterParseResult {
  const errors: string[] = []
  const chapters: ChapterCandidate[] = []
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  if (!lines.length) {
    return { chapters, errors: ["No chapter lines were provided."] }
  }

  for (const line of lines) {
    const match = line.match(CHAPTER_LINE_PATTERN)
    if (!match) {
      errors.push(`Invalid chapter line format: ${line}`)
      continue
    }

    const seconds = parseTimestamp(match[1])
    const title = normalizeTitle(match[2])

    if (seconds === undefined) {
      errors.push(`Invalid timestamp in line: ${line}`)
      continue
    }

    if (!title) {
      errors.push(`Missing title in line: ${line}`)
      continue
    }

    chapters.push({ seconds, title, originalLine: line })
  }

  return { chapters, errors }
}

export function parseTimestamp(value: string): number | undefined {
  const parts = value.split(":").map((part) => Number(part))
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return undefined

  if (parts.length === 2) {
    const [minutes, seconds] = parts
    if (seconds > 59) return undefined
    return minutes * 60 + seconds
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts
    if (minutes > 59 || seconds > 59) return undefined
    return hours * 3600 + minutes * 60 + seconds
  }

  return undefined
}

function normalizeTitle(value: string): string {
  return value.replace(/^[-–—:\s]+/, "").replace(/\s+/g, " ").trim()
}
