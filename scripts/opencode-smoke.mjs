import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"))
const pluginModule = await import(new URL("../dist/index.js", import.meta.url))

assert.equal(typeof pluginModule.server, "function", "built plugin must export an OpenCode-compatible server function")
assert.equal(pluginModule.default, pluginModule.server, "default export should point at the same plugin server")
assert.equal(pluginModule.YouTubeChaptersPlugin, pluginModule.server, "named plugin export should point at the same plugin server")

const hooks = await pluginModule.server({})
const tools = hooks?.tool ?? {}

assert.equal(typeof tools.youtube_chapters_fetch_transcript?.execute, "function", "fetch transcript tool must be registered")
assert.equal(typeof tools.youtube_chapters_validate?.execute, "function", "validate tool must be registered")
assert.ok(tools.youtube_chapters_fetch_transcript.args.input, "fetch tool must expose input arg")
assert.ok(tools.youtube_chapters_validate.args.chapters, "validate tool must expose chapters arg")

const validationResult = await tools.youtube_chapters_validate.execute({
  chapters: "00:00 - Arranque\n00:12 - Tema central\n00:30 - Cierre",
  durationSeconds: 90,
})
const validationPayload = JSON.parse(validationResult.output)
assert.equal(validationPayload.valid, true, "validate tool must execute deterministically without LLM/network auth")
assert.deepEqual(validationPayload.lines, ["00:00 - Arranque", "00:12 - Tema central", "00:30 - Cierre"])

const configuredHooks = await pluginModule.server({}, { glossary: { Seller: "Zeler" } })
const configuredValidation = await configuredHooks.tool.youtube_chapters_validate.execute({
  chapters: "00:00 - Seller inicio\n00:12 - Tema central\n00:30 - Cierre",
  durationSeconds: 90,
})
assert.deepEqual(JSON.parse(configuredValidation.output).lines, ["00:00 - Zeler inicio", "00:12 - Tema central", "00:30 - Cierre"])

const commandTemplate = await readFile(new URL("../examples/commands/chapters.md", import.meta.url), "utf8")
assert.match(commandTemplate, /\$ARGUMENTS/, "command template must use OpenCode command arguments")
assert.match(commandTemplate, /Usage: \/chapters <youtube-url-or-video-id>/, "command template must document empty input usage")
assert.match(commandTemplate, /youtube_chapters_fetch_transcript/, "command template must call the transcript tool")
assert.match(commandTemplate, /youtube_chapters_validate/, "command template must call the validation tool")
assert.match(commandTemplate, /Final successful output must be only chapter lines/, "command template must constrain final output")

const exampleConfig = JSON.parse(await readFile(new URL("../examples/opencode.json", import.meta.url), "utf8"))
assert.ok(exampleConfig.plugin.some((entry) => entry === packageJson.name || entry?.[0] === packageJson.name), "example OpenCode config must reference this npm plugin package")

console.log(`OpenCode plugin smoke passed: ${Object.keys(tools).sort().join(", ")}`)
