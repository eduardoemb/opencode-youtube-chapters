export class YouTubeChaptersError extends Error {
  constructor(
    message: string,
    readonly code: string,
  ) {
    super(message)
    this.name = "YouTubeChaptersError"
  }
}

export class UnsupportedInputError extends YouTubeChaptersError {
  constructor(message: string) {
    super(message, "unsupported_input")
    this.name = "UnsupportedInputError"
  }
}

export class MissingTranscriptError extends YouTubeChaptersError {
  constructor(message: string) {
    super(message, "missing_transcript")
    this.name = "MissingTranscriptError"
  }
}

export class InvalidChapterError extends YouTubeChaptersError {
  constructor(message: string) {
    super(message, "invalid_chapters")
    this.name = "InvalidChapterError"
  }
}
