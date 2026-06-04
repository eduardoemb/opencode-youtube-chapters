import type { ChapterCandidate } from "./parse.js"

export function formatChapters(chapters: ChapterCandidate[]): string[] {
  return chapters.map((chapter) => `${formatTimestamp(chapter.seconds)} - ${formatTitle(chapter.title)}`)
}

export function formatTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  if (hours > 0) {
    return `${hours}:${pad2(minutes)}:${pad2(seconds)}`
  }

  return `${pad2(minutes)}:${pad2(seconds)}`
}

function formatTitle(title: string): string {
  return title.replace(/\s+/g, " ").trim()
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}
