package com.wziem.lancebackend.api.controller;

import com.wziem.lancebackend.api.dto.ai.ExtractedClientData;
import com.wziem.lancebackend.api.dto.ai.VoiceIntakeResultDto;
import com.wziem.lancebackend.api.dto.client.ClientDto;
import com.wziem.lancebackend.api.dto.client.CreateClientRequest;
import com.wziem.lancebackend.api.dto.project.CreateProjectRequest;
import com.wziem.lancebackend.api.dto.project.ProjectDto;
import com.wziem.lancebackend.api.dto.task.CreateTaskRequest;
import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.model.enums.ProjectStatus;
import com.wziem.lancebackend.model.enums.TaskPriority;
import com.wziem.lancebackend.model.enums.TaskStatus;
import com.wziem.lancebackend.service.AiService;
import com.wziem.lancebackend.service.ClientService;
import com.wziem.lancebackend.service.ProjectService;
import com.wziem.lancebackend.service.ScheduleService;
import com.wziem.lancebackend.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final ClientService clientService;
    private final ProjectService projectService;
    private final TaskService taskService;
    private final ScheduleService scheduleService;

    @PostMapping(value = "/voice-intake", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VoiceIntakeResultDto voiceIntake(
            @RequestParam("audio") MultipartFile audio,
            @RequestParam(value = "timezone", defaultValue = "UTC") String timezone) {

        ZoneId zone;
        try {
            zone = ZoneId.of(timezone);
        } catch (DateTimeException e) {
            zone = ZoneId.of("UTC");
        }

        String transcript = aiService.transcribeAudio(audio);
        ExtractedClientData extracted = aiService.extractClientData(transcript);

        ClientDto client = clientService.createClient(buildClientRequest(extracted.client()));
        ProjectDto project = projectService.createProject(buildProjectRequest(extracted.project(), client.id()));
        List<TaskDto> tasks = buildTasks(extracted.tasks(), project.id(), zone);

        return new VoiceIntakeResultDto(client, project, tasks, transcript);
    }

    private CreateClientRequest buildClientRequest(ExtractedClientData.ExtractedClient ec) {
        String email = ec.email() != null
                ? ec.email()
                : "voice-intake-" + UUID.randomUUID().toString().substring(0, 8) + "@placeholder.local";

        String notes = ec.notes();
        if (ec.email() == null) {
            String flag = "Email not captured via voice — please update.";
            notes = notes != null ? flag + " " + notes : flag;
        }

        return new CreateClientRequest(ec.name(), email, ec.companyName(), ec.phone(), notes);
    }

    private CreateProjectRequest buildProjectRequest(ExtractedClientData.ExtractedProject ep, UUID clientId) {
        LocalDate deadline = ep.deadline() != null ? LocalDate.parse(ep.deadline()) : null;
        BigDecimal budget = ep.budget() != null ? BigDecimal.valueOf(ep.budget()) : null;
        return new CreateProjectRequest(ep.name(), clientId, ep.description(), ProjectStatus.ACTIVE, deadline, budget);
    }

    private List<TaskDto> buildTasks(
            List<ExtractedClientData.ExtractedTask> extractedTasks,
            UUID projectId,
            ZoneId zone) {

        List<ExtractedClientData.ExtractedTask> tasks =
                (extractedTasks == null || extractedTasks.isEmpty())
                        ? List.of(new ExtractedClientData.ExtractedTask(
                                "Plan and scope the project",
                                "Break down the project into tasks and estimate the work",
                                "HIGH", null, null, null))
                        : extractedTasks;

        return tasks.stream()
                .map(t -> {
                    TaskDto task = taskService.createTask(new CreateTaskRequest(
                            t.title(),
                            projectId,
                            t.description(),
                            TaskStatus.TODO,
                            parseTaskPriority(t.priority()),
                            null,
                            t.estimatedHours() != null ? t.estimatedHours() : null));

                    if (t.scheduledDate() != null) {
                        try {
                            LocalDate date = LocalDate.parse(t.scheduledDate());
                            return scheduleService.scheduleForIntake(
                                    task.id(), date, t.scheduledHour(), t.estimatedHours(), zone)
                                    .orElse(task);
                        } catch (Exception e) {
                            // malformed date or scheduling error → stay unscheduled
                        }
                    }
                    return task;
                })
                .toList();
    }

    private TaskPriority parseTaskPriority(String raw) {
        if (raw == null) return TaskPriority.MEDIUM;
        try {
            return TaskPriority.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TaskPriority.MEDIUM;
        }
    }
}
