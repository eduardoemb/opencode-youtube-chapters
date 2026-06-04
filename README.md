# OpenCode YouTube Chapters

Generate copy-ready YouTube chapter lines from available YouTube transcripts using OpenCode's active model.

This package provides an OpenCode plugin with deterministic tools for transcript preparation and chapter validation. The global `/chapters` command is installed as a markdown command because OpenCode plugins do not directly register slash commands in V1.

## Quick path

1. Install the package.
2. Add it to your global OpenCode config.
3. Copy the `chapters.md` command template.
4. Run `/chapters <youtube-url-or-video-id>` from any repo.

```bash
npm install -g opencode-youtube-chapters
```

`~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-youtube-chapters"]
}
```

Create `~/.config/opencode/commands/chapters.md` from [`examples/commands/chapters.md`](examples/commands/chapters.md).

## Usage

```text
/chapters https://youtu.be/dQw4w9WgXcQ
```

Successful output is only chapter lines:

```text
00:00 - Tema inicial
02:14 - Primer concepto
05:48 - Ejemplo práctico
```

## Supported input

| Input | Supported |
|---|---:|
| `https://www.youtube.com/watch?v=<id>` | ✅ |
| `https://youtu.be/<id>` | ✅ |
| Raw 11-character video ID | ✅ |
| Completed livestream URL like `https://www.youtube.com/live/<id>` | ✅ |
| YouTube Shorts | ❌ |

## What the plugin registers

| Tool | Purpose |
|---|---|
| `youtube_chapters_fetch_transcript` | Normalizes the video input, fetches available subtitles/transcript, and returns compact chronological buckets. |
| `youtube_chapters_validate` | Repairs and validates candidate chapter lines before final output. |

The tools do not call an LLM. The `/chapters` command prompt instructs your active OpenCode model to call these tools, draft Spanish (Mexico) titles, validate them, and print only final lines.

## Chapter rules

- Output language: Spanish (Mexico).
- Titles: short and content-specific.
- Normal successful output: no heading, no bullets, no explanation.
- Format: `00:00 - Título`.
- Count: 3-10 chapters.
- First timestamp: `00:00`.
- Timestamps: ascending, at least 10 seconds apart.
- Videos under 30 seconds are rejected as not apt for chapters.

## Limitations

- Transcript-only V1: no Whisper, audio download, `yt-dlp`, or fallback transcription.
- Videos without available subtitles/transcripts fail with a clear error.
- Shorts are intentionally unsupported in V1.
- Chapter quality depends on the active OpenCode model and transcript quality.
- `youtube-transcript` is an unofficial YouTube transcript dependency, isolated behind a provider interface for future replacement.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
npm run smoke:opencode
npm run verify
npm pack --dry-run
```

### Local OpenCode/plugin smoke verification

`npm run verify` builds the package and then runs `scripts/opencode-smoke.mjs`. The smoke test is deterministic and does not require an OpenCode login, LLM provider key, YouTube network call, or paid model call. It verifies that:

- the built `dist/index.js` module exports an OpenCode-compatible `server` plugin function;
- the plugin registers `youtube_chapters_fetch_transcript` and `youtube_chapters_validate`;
- the validation tool executes locally without network/auth;
- `examples/opencode.json` references this npm package; and
- `examples/commands/chapters.md` contains the `/chapters` usage guard plus both tool calls.

This is the strongest CI-safe smoke check for V1. It does not prove that an authenticated `opencode run /chapters ...` session can call a live model, because that requires a configured OpenCode runtime and provider credentials. Before release, run one manual OpenCode session with the packed or globally installed package to verify the full slash-command flow end to end.

## Package API

Core deterministic helpers are exported for tests and future integrations:

```ts
import { parseYouTubeInput, validateAndRepairChapters } from "opencode-youtube-chapters"
```

Use `TranscriptProvider` to inject a fake provider in tests or replace the transcript backend later.
