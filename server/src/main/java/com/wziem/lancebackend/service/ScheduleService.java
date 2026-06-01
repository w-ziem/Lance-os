package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.schedule.ScheduleConfigDto;
import com.wziem.lancebackend.api.dto.schedule.ScheduleTaskRequest;
import com.wziem.lancebackend.api.dto.schedule.ScheduleViewDto;
import com.wziem.lancebackend.api.dto.schedule.ScheduleViewRequest;
import com.wziem.lancebackend.api.dto.schedule.UpdateTaskLockRequest;
import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.api.mapper.TaskMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.config.schedule.ScheduleProperties;
import com.wziem.lancebackend.exceptions.ScheduleConflictException;
import com.wziem.lancebackend.model.entity.Subtask;
import com.wziem.lancebackend.model.entity.Task;
import com.wziem.lancebackend.model.repository.SubtaskRepository;
import com.wziem.lancebackend.model.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final TaskMapper taskMapper;
    private final ScheduleProperties scheduleProperties;

    @Transactional(readOnly = true)
    public ScheduleViewDto getView(ScheduleViewRequest request) {
        validateRange(request.startDate(), request.endDate());
        UUID userId = SecurityUtils.getCurrentUserId();

        List<Task> scheduled = taskRepository.findScheduledInRange(userId, request.startDate(), request.endDate());
        List<Task> unscheduled = taskRepository.findUnscheduled(userId);

        Map<UUID, List<Subtask>> subtasksByTask = loadSubtasks(scheduled, unscheduled);

        List<TaskDto> scheduledDtos = scheduled.stream()
                .map(t -> taskMapper.toDto(t, subtasksByTask.getOrDefault(t.getId(), List.of())))
                .toList();
        List<TaskDto> unscheduledDtos = unscheduled.stream()
                .map(t -> taskMapper.toDto(t, subtasksByTask.getOrDefault(t.getId(), List.of())))
                .toList();

        return new ScheduleViewDto(scheduledDtos, unscheduledDtos, getConfig());
    }

    public ScheduleConfigDto getConfig() {
        return new ScheduleConfigDto(
                scheduleProperties.getWorkStartHour(),
                scheduleProperties.getWorkEndHour(),
                scheduleProperties.getSlotMinutes()
        );
    }

    @Transactional
    public TaskDto scheduleTask(UUID taskId, ScheduleTaskRequest request) {
        validateRange(request.startDate(), request.endDate());
        UUID userId = SecurityUtils.getCurrentUserId();

        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (task.isLocked()) {
            throw new ScheduleConflictException("Cannot reschedule a locked task");
        }

        List<Task> overlapping = taskRepository.findOverlapping(
                userId, taskId, request.startDate(), request.endDate());

        // Reject if any overlap is a locked task.
        overlapping.stream()
                .filter(Task::isLocked)
                .findFirst()
                .ifPresent(locked -> {
                    throw new ScheduleConflictException(
                            "Slot overlaps with locked task: " + locked.getTitle());
                });

        // Push out any non-locked overlap to the unscheduled bucket.
        for (Task other : overlapping) {
            other.setScheduledStart(null);
            other.setScheduledEnd(null);
        }
        if (!overlapping.isEmpty()) {
            taskRepository.saveAll(overlapping);
        }

        task.setScheduledStart(request.startDate());
        task.setScheduledEnd(request.endDate());

        Task saved = taskRepository.save(task);
        return toDtoWithSubtasks(saved);
    }

    @Transactional
    public TaskDto unscheduleTask(UUID taskId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (task.isLocked()) {
            throw new ScheduleConflictException("Cannot unschedule a locked task; unlock it first");
        }

        task.setScheduledStart(null);
        task.setScheduledEnd(null);

        Task saved = taskRepository.save(task);
        return toDtoWithSubtasks(saved);
    }

    @Transactional
    public TaskDto setLock(UUID taskId, UpdateTaskLockRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setLocked(Boolean.TRUE.equals(request.locked()));
        Task saved = taskRepository.save(task);
        return toDtoWithSubtasks(saved);
    }

    private void validateRange(Instant start, Instant end) {
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("endDate must be after startDate");
        }
    }

    private TaskDto toDtoWithSubtasks(Task task) {
        List<Subtask> subtasks = subtaskRepository.findAllByTaskIdOrderByPositionAsc(task.getId());
        return taskMapper.toDto(task, subtasks);
    }

    private Map<UUID, List<Subtask>> loadSubtasks(List<Task> a, List<Task> b) {
        Set<UUID> ids = java.util.stream.Stream.concat(a.stream(), b.stream())
                .map(Task::getId)
                .collect(Collectors.toSet());
        if (ids.isEmpty()) return Map.of();
        return subtaskRepository.findAllByTaskIdInOrderByPositionAsc(ids).stream()
                .collect(Collectors.groupingBy(Subtask::getTaskId));
    }
}
