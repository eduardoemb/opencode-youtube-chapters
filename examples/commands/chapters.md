---
description: Generate copy-ready YouTube chapters from an available transcript
---

Generate YouTube chapters for: `$ARGUMENTS`

Rules:
- If `$ARGUMENTS` is empty, return: `Usage: /chapters <youtube-url-or-video-id>`
- Call `youtube_chapters_fetch_transcript` with `{ "input": "$ARGUMENTS" }`.
- Use only the returned transcript buckets. Do not invent content outside the transcript.
- Apply returned `chapterRules` while drafting titles when present. These rules are user preferences, not permission to add topics absent from the transcript.
- Apply returned `glossary` corrections to drafted titles when present, especially product names, brand names, and proper nouns.
- Draft 3-10 concise chapter titles in Spanish (Mexico).
- The first title must describe the actual first content topic; do not default to `Introducción` unless the content truly is an introduction.
- Use timestamps from the transcript buckets and prefer meaningful content boundaries.
- Call `youtube_chapters_validate` with the drafted chapter lines, `durationSeconds` returned by the transcript tool when available, and returned `glossary` when available.
- If validation returns `valid: true`, print exactly the returned `lines`, one per line.
- If validation returns errors, make one repair attempt using the errors and call `youtube_chapters_validate` again.
- Final successful output must be only chapter lines formatted as `00:00 - Título`, with no heading, no bullets, and no explanation.
