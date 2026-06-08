# Voice Client Intake — Feature Documentation

## What Was Built

A voice-driven intake workflow that lets users speak a client briefing aloud and have the system automatically create the corresponding client, project, and tasks. The user clicks a "Voice intake" button on the Dashboard or Clients page, records their speech in a modal, and the audio is sent to the backend where OpenAI Whisper transcribes it and GPT-4o-mini extracts structured client/project/task data from the transcript. The backend then creates all entities via the existing service layer and returns a summary to the frontend — no manual form-filling required.

## How It Works (Step by Step)

1. User clicks the "Voice intake" button (available in Dashboard quick actions and the Clients page header).
2. The `VoiceIntakeModal` opens in the **idle** state, showing a prompt to start recording.
3. User clicks "Start recording" — the browser requests microphone permission via `getUserMedia`.
4. `MediaRecorder` captures audio in chunks using the `audio/webm;codecs=opus` MIME type (fallback: `audio/webm`).
5. User clicks "Stop" — all accumulated chunks are assembled into a single `Blob`.
6. The modal transitions to the **processing** state, and the `useVoiceIntakeMutation` hook POSTs the audio blob as `multipart/form-data` to `POST /api/ai/voice-intake`.
7. **Backend — transcription:** `AiService` forwards the audio file to the OpenAI Whisper API (`/audio/transcriptions`, model `whisper-1`), which returns the transcript as plain text.
8. **Backend — extraction:** `AiService` sends the transcript plus a structured system prompt to the OpenAI Chat Completions API (`/chat/completions`, model `gpt-4o-mini`) with `response_format: {"type": "json_object"}`, which returns a camelCase JSON object containing client, project, and tasks fields.
9. **Backend — entity creation:** `AiController` deserializes the JSON into `ExtractedClientData`, then calls `ClientService`, `ProjectService`, and `TaskService` to persist the entities. If GPT returns no tasks, a default "Plan project" task is created automatically.
10. The backend responds with a `VoiceIntakeResultDto` containing the created `ClientDto`, `ProjectDto`, `List<TaskDto>`, and the raw transcript string.
11. The modal transitions to the **success** state, displaying a summary of what was created and a "View clients" navigation button.
12. TanStack React Query cache entries for clients, projects, and tasks are invalidated, so all list views refresh automatically.

## New Files and Their Roles

### Backend

- `server/src/main/java/com/wziem/lancebackend/api/dto/ai/ExtractedClientData.java` — internal DTO for deserializing GPT's JSON response; three nested records (`ExtractedClient`, `ExtractedProject`, `ExtractedTask`) that map directly to the JSON schema the system prompt instructs the model to produce.
- `server/src/main/java/com/wziem/lancebackend/api/dto/ai/VoiceIntakeResultDto.java` — API response DTO wrapping `ClientDto`, `ProjectDto`, `List<TaskDto>`, and the raw transcript string; sent back to the frontend after all entities are created.
- `server/src/main/java/com/wziem/lancebackend/service/AiService.java` — calls OpenAI Whisper (audio → text) and GPT-4o-mini (text → JSON) via Spring `RestClient`; holds `SYSTEM_PROMPT` as a static constant.
- `server/src/main/java/com/wziem/lancebackend/api/controller/AiController.java` — `POST /ai/voice-intake` endpoint; orchestrates transcription, extraction, and entity creation, and maps the results into `VoiceIntakeResultDto`.
- `server/src/test/java/com/wziem/lancebackend/api/controller/AiControllerTest.java` — `@WebMvcTest` covering the no-tasks (default planning task injected) and with-tasks scenarios.

### Modified Backend

- `server/src/main/resources/application.yml` — added `spring.servlet.multipart` limits (max file and request size: 25 MB) and the `app.openai` config block (`api-key`, `model`).
- `server/.env.example` — added `OPENAI_API_KEY` and `OPENAI_MODEL` documentation so contributors know what to set.

### Frontend

- `client/src/types/ai.ts` — TypeScript interface `VoiceIntakeResultDto` matching the backend response shape.
- `client/src/hooks/useVoiceIntake.ts` — two hooks: `useVoiceRecorder` (a `MediaRecorder` wrapper managing start/stop/blob assembly) and `useVoiceIntakeMutation` (a React Query mutation that POSTs audio and invalidates relevant caches on success).
- `client/src/components/ai/VoiceIntakeModal.tsx` — 5-state modal (`idle` / `recording` / `processing` / `success` / `error`) with an animated pulsing recording indicator, processing spinner, and result summary card.
- `client/src/components/ai/VoiceIntakeButton.tsx` — self-contained trigger button that owns the modal's open/close state; accepts a `variant` prop (`'outline'` or `'accent'`) for use in different contexts.
- `client/src/components/dashboard/QuickActions.tsx` — added `VoiceIntakeButton` as the first quick action on the Dashboard.
- `client/src/pages/ClientsPage.tsx` — added `VoiceIntakeButton` beside the "Add client" button in the page header.

## Technologies Used

- **OpenAI Whisper API** (`/audio/transcriptions`, model `whisper-1`) — speech-to-text. Chosen because it handles conversational Polish and English naturally and returns clean text with no post-processing needed.
- **OpenAI Chat Completions API** (`/chat/completions`, model `gpt-4o-mini`) — structured extraction from natural language. Using `response_format: {"type": "json_object"}` forces the model to return valid JSON, eliminating parsing fragility. GPT-4o-mini is fast and cheap for this extraction task.
- **Spring RestClient** — built into Spring Boot 3.5, requiring no extra dependencies. Handles both multipart (Whisper) and JSON (GPT) requests with a clean fluent API.
- **Browser MediaRecorder API** — native browser API for audio recording. Preferred MIME type is `audio/webm;codecs=opus` with a fallback to `audio/webm`. No external library is needed.
- **TanStack React Query mutations** — cache invalidation on success ensures the Clients, Projects, Tasks, and Dashboard views update automatically after intake completes.

## Setup — Activating the Feature

### Local development (`server/.env`)

Add the following to `server/.env` (this file is gitignored — never commit real keys):

```
OPENAI_API_KEY=sk-proj-your-real-key-here
OPENAI_MODEL=gpt-4o-mini   # optional — this is the default
```

### Docker / Docker Compose

Add the env var to the backend service in `docker-compose.yml`, or place it in a `.env` file at the repo root that docker-compose loads automatically:

```yaml
services:
  backend:
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
```

Or pass it at runtime:

```bash
OPENAI_API_KEY=sk-... docker-compose --profile dev up
```

### Getting an OpenAI API key

1. Go to https://platform.openai.com/api-keys
2. Create a new secret key.
3. Add it to your local `server/.env`.

## Security Notes

- **Authentication required** — `/ai/voice-intake` requires a valid JWT, the same as all other API endpoints. Anonymous calls return 401.
- **No rate limiting** — the endpoint has no per-user rate limiting. If this feature is exposed to multiple users, add rate limiting (e.g. Spring's `RateLimiter` or an API gateway rule) to protect OpenAI spend.
- **Max file size** — Whisper's limit is 25 MB. Spring multipart is configured to the same limit. Audio longer than roughly 20–30 minutes may exceed this.
- **GPT JSON validation** — the model is instructed to return camelCase JSON; Jackson's `@JsonIgnoreProperties(ignoreUnknown = true)` absorbs any extra fields the model adds. If `client.name` is missing, a `NullPointerException` will propagate as a 500. Production hardening: add a null-check in `AiController.buildClientRequest`.
- **Placeholder email** — when no email is extracted from the transcript, a `voice-intake-{8chars}@placeholder.local` address is generated. This passes `@Email` format validation. The placeholder is flagged in the client's notes field so it is visible in the UI.
- **API key in config** — the key is read from an environment variable only; it is never hardcoded. The `app.openai.api-key` property in `application.yml` references `${OPENAI_API_KEY}` with no default value, so the application will fail fast on startup if the key is missing.

## Tuning the AI (System Prompt)

The extraction behavior is controlled entirely by the system prompt in `AiService.SYSTEM_PROMPT` (a static constant). To change what the AI extracts:

- Edit `server/src/main/java/com/wziem/lancebackend/service/AiService.java`, the `SYSTEM_PROMPT` constant.
- The prompt instructs GPT to return a specific camelCase JSON schema. If you add new fields, also update the `ExtractedClientData` records and the builder methods in `AiController`.
- To switch models, set `OPENAI_MODEL=gpt-4o` (more capable but more expensive) or any other OpenAI chat model ID in your `.env`.
- To improve extraction accuracy for your domain, add examples to the system prompt (few-shot prompting).

## Known Limitations and Next Steps

- **No maximum recording time** — the UI does not enforce a time limit. Consider capping at 2 minutes to prevent oversized uploads.
- **Polish/multi-language** — Whisper handles Polish natively; no changes are needed. GPT extraction works in any language Whisper transcribes.
- **No task deadline extraction** — deadlines are not extracted from speech. Next step: add deadline phrases ("due next Friday", "by end of month") to the system prompt and pass them through as `LocalDate`.
- **No duplicate detection** — creating a client with the same name twice will create two separate entries. Next step: add a "did you mean..." confirmation step if a fuzzy name match already exists.
- **Single-turn only** — extraction happens in one shot. A conversational follow-up ("actually, the budget is 8000") is not supported.
- **Error messages are generic** — the frontend shows "Transcription failed" for any backend error. Next step: return structured error codes from the API so the frontend can surface more helpful messages.
