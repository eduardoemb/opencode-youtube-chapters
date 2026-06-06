export type ChapterGlossary = Record<string, string>

export function normalizeGlossary(value: unknown): ChapterGlossary {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  const entries = Object.entries(value).flatMap(([source, replacement]) => {
    const normalizedSource = source.trim()
    if (!normalizedSource || typeof replacement !== "string") {
      return []
    }

    return [[normalizedSource, replacement.trim()] as const]
  })

  return Object.fromEntries(entries)
}

export function applyGlossaryCorrections(title: string, glossary: ChapterGlossary = {}): string {
  return Object.entries(glossary)
    .filter(([source]) => source.length > 0)
    .sort(([left], [right]) => right.length - left.length)
    .reduce((current, [source, replacement]) => current.split(source).join(replacement), title)
}
