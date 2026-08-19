# Voice Intake — Task Scheduling & Anti-Hallucination Design

**Date:** 2026-06-09  
**Branch:** dashboard_ai_service  
**Status:** Approved — ready for implementation

---

## Overview

Extends the voice client intake feature so that tasks extracted from voice can land directly in the calendar (instead of always going to unplanned tasks), provided the user mentions a day or time. Simultaneously tightens the GPT system prompt to eliminate hallucinations on budget, deadline, and scheduling fields.

---

## Data Flow

```
Frontend
  FormData { audio: Blob, timezone: "Europe/Warsaw" }   ← timezone added
           ↓
POST /ai/voice-intake
  1. Whisper → transcript (unchanged)
  2. GPT extraction with new schema + strict rules
  3. clientService.createClient(...)
  4. projectService.createProject(budget = null if not stated)
  5. Per task:
       a. taskService.createTask(...)          → task created, unscheduled
       b. if extractedTask.scheduledDate != null:
            scheduleService.scheduleForIntake(taskId, date, hour, durationHours, zone)
            → free slot found  : scheduledStart / scheduledEnd set, task on calendar
            → conflict / full  : task stays unscheduled, no error thrown, no other tasks bumped
  6. Return VoiceIntakeResultDto
           ↓
Frontend
  task.scheduledStart != null  →  calendar
  task.scheduledStart == null  →  unplanned tasks panel
```

---

## GPT Schema Changes

### `ExtractedTask` — 3 new fields

```json
{
  "title": "string (required)",
  "description": "string or null",
  "priority": "LOW or MEDIUM or HIGH",
  "scheduledDate": "YYYY-MM-DD or null",
  "scheduledHour": 14,
  "estimatedHours": 1.5
}
```

| Field | Rule |
|---|---|
| `scheduledDate` | `null` unless user mentioned a specific day or date |
| `scheduledHour` | `null` unless user mentioned a specific time (0–23, 24h format) |
| `estimatedHours` | **Only field where inference is allowed** — estimate from task type (see examples below) |

**estimatedHours inference examples** (in system prompt):
- quick call / standup → 0.5
- meeting / consultation → 1.0
- code review → 1.5
- small feature / bug fix → 2.0
- design or planning work → 3.0–4.0
- `null` only if truly unknowable

### Anti-Hallucination Rules (`STRICT EXTRACTION RULES` section in prompt)

```
Output ONLY values explicitly stated in the transcript.
For every field not mentioned: output null. No exceptions.

budget       → null unless a specific number was stated. Never estimate or infer.
deadline     → null unless a specific date or relative day was stated.
scheduledDate→ null unless the user mentioned a day/date for this task.
scheduledHour→ null unless the user mentioned a specific time.
estimatedHours → ONLY field where inference is allowed (use task-type examples).
email, phone, companyName → null if not mentioned.

Do not invent plausible values. Silence (null) is always correct.
```

---

## Backend Changes

### 1. `ExtractedClientData.java` — `ExtractedTask` record

Add 3 fields:

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public record ExtractedTask(
    String title,
    String description,
    String priority,
    String scheduledDate,   // "YYYY-MM-DD" or null
    Integer scheduledHour,  // 0–23 or null
    Double estimatedHours   // null if GPT cannot estimate
) {}
```

### 2. `AiService.java` — `buildSystemPrompt()`

- Add `STRICT EXTRACTION RULES` block before the JSON schema
- Add `scheduledDate`, `scheduledHour`, `estimatedHours` to task schema in prompt
- Add estimatedHours inference examples
- Strengthen budget/deadline null rules

### 3. `ScheduleService.java` — new `scheduleForIntake()` method

```
scheduleForIntake(taskId, date, requestedHour, durationHours, zone):

  duration  = durationHours ?? 1.0
  userId    = SecurityUtils.getCurrentUserId()
  task      = taskRepository.findByIdAndUserId(taskId, userId)  // throws if not found

  if requestedHour != null:
    candidates = [ (date @ requestedHour, duration) ]          // exactly one slot
  else:
    candidates = slots from workStartHour to workEndHour – duration, step slotMinutes

  for (start, end) in candidates:
    if taskRepository.findOverlapping(userId, taskId, start, end).isEmpty():
      task.scheduledStart = start
      task.scheduledEnd   = end
      taskRepository.save(task)
      return Optional.of(toDtoWithSubtasks(task))

  return Optional.empty()   // conflict or day full — caller leaves task unscheduled
```

**Key difference from `scheduleTask()`**: never bumps overlapping tasks. Any overlap (locked or not) → returns empty, task stays unscheduled.

**Error handling**: `ZoneRulesException` / `DateTimeException` on timezone parsing → caller falls back to UTC.

### 4. `AiController.java`

- Add `@RequestParam(value = "timezone", defaultValue = "UTC") String timezone` to endpoint
- Parse `ZoneId` defensively (catch `ZoneRulesException`, fall back to UTC)
- After each `createTask`, if `scheduledDate != null`: call `scheduleForIntake`, use returned DTO if present
- Inject `ScheduleService` via constructor (`@RequiredArgsConstructor`)

---

## Frontend Changes

### `useVoiceIntake.ts` — send timezone

```typescript
formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
```

One line, before `api.post`. Uses browser's built-in `Intl` API, no dependency.

### `VoiceIntakeModal.tsx` — updated success rows

```
Client  →  result.client.name
Project →  result.project.name
Budget  →  "$5,000"  or  "Not specified"   ← new
Tasks   →  "3 created (2 on calendar)"     ← updated
```

- Budget: `result.project.budget != null ? '$' + Number(result.project.budget).toLocaleString() : 'Not specified'`
- Scheduled count: `result.tasks.filter(t => t.scheduledStart != null).length`
- `TaskDto.scheduledStart` already exists — no new types needed

---

## Files Changed

| File | Change |
|---|---|
| `server/.../api/dto/ai/ExtractedClientData.java` | Add 3 fields to `ExtractedTask` |
| `server/.../service/AiService.java` | Update `buildSystemPrompt()` |
| `server/.../service/ScheduleService.java` | Add `scheduleForIntake()` |
| `server/.../api/controller/AiController.java` | Add `timezone` param, scheduling call |
| `client/src/hooks/useVoiceIntake.ts` | Append timezone to FormData |
| `client/src/components/ai/VoiceIntakeModal.tsx` | Update success rows (budget + scheduled count) |

---

## What Is Not In Scope

- Locking newly scheduled tasks (user can lock manually if needed)
- Displaying the transcript in the modal (not requested)
- Timezone settings UI (browser timezone is used directly)
- Retry logic if GPT returns malformed schedule fields (backend silently skips, task goes unplanned)

---

## Commit Plan

```
feat(server): add scheduling fields to GPT task extraction
feat(server): add scheduleForIntake to ScheduleService
feat(server): wire timezone and scheduling into voice intake controller
feat(client): send browser timezone in voice intake request
feat(client): show budget and scheduled count in intake success modal
```
