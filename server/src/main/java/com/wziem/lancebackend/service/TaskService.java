package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.task.CreateTaskRequest;
import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.api.dto.task.UpdateTaskRequest;
import com.wziem.lancebackend.api.dto.task.UpdateTaskStatusRequest;
import com.wziem.lancebackend.api.mapper.TaskMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.model.entity.Subtask;
import com.wziem.lancebackend.model.entity.Task;
import com.wziem.lancebackend.model.enums.TaskPriority;
import com.wziem.lancebackend.model.enums.TaskStatus;
import com.wziem.lancebackend.model.repository.ProjectRepository;
import com.wziem.lancebackend.model.repository.SubtaskRepository;
import com.wziem.lancebackend.model.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final SubtaskRepository subtaskRepository;
    private final TaskMapper taskMapper;

    public List<TaskDto> getAllTasks(UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<Task> tasks = projectId != null
                ? taskRepository.findAllByUserIdAndProjectId(userId, projectId)
                : taskRepository.findAllByUserId(userId);

        if (tasks.isEmpty()) return List.of();

        Set<UUID> taskIds = tasks.stream().map(Task::getId).collect(Collectors.toSet());
        Map<UUID, List<Subtask>> byTask = subtaskRepository.findAllByTaskIdInOrderByPositionAsc(taskIds).stream()
                .collect(Collectors.groupingBy(Subtask::getTaskId));

        return tasks.stream()
                .map(t -> taskMapper.toDto(t, byTask.getOrDefault(t.getId(), List.of())))
                .toList();
    }

    public TaskDto getTask(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        List<Subtask> subtasks = subtaskRepository.findAllByTaskIdOrderByPositionAsc(id);
        return taskMapper.toDto(task, subtasks);
    }

    @Transactional
    public TaskDto createTask(CreateTaskRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        verifyProjectOwnership(request.projectId(), userId);

        Task task = Task.builder()
                .userId(userId)
                .projectId(request.projectId())
                .title(request.title())
                .description(request.description())
                .status(request.status() != null ? request.status() : TaskStatus.TODO)
                .priority(request.priority() != null ? request.priority() : TaskPriority.MEDIUM)
                .deadline(request.deadline())
                .estimateHours(request.estimateHours())
                .build();

        Task saved = taskRepository.save(task);
        return taskMapper.toDto(saved, List.of());
    }

    @Transactional
    public TaskDto updateTask(UUID id, UpdateTaskRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        if (!task.getProjectId().equals(request.projectId())) {
            verifyProjectOwnership(request.projectId(), userId);
        }

        task.setTitle(request.title());
        task.setProjectId(request.projectId());
        task.setDescription(request.description());
        task.setPriority(request.priority() != null ? request.priority() : task.getPriority());
        task.setDeadline(request.deadline());
        task.setEstimateHours(request.estimateHours());

        Task saved = taskRepository.save(task);
        List<Subtask> subtasks = subtaskRepository.findAllByTaskIdOrderByPositionAsc(id);
        return taskMapper.toDto(saved, subtasks);
    }

    @Transactional
    public TaskDto updateTaskStatus(UUID id, UpdateTaskStatusRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setStatus(request.status());

        Task saved = taskRepository.save(task);
        List<Subtask> subtasks = subtaskRepository.findAllByTaskIdOrderByPositionAsc(id);
        return taskMapper.toDto(saved, subtasks);
    }

    @Transactional
    public void deleteTask(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (!taskRepository.existsByIdAndUserId(id, userId)) {
            throw new EntityNotFoundException("Task not found");
        }
        taskRepository.deleteById(id);
    }

    private void verifyProjectOwnership(UUID projectId, UUID userId) {
        if (!projectRepository.existsByIdAndUserId(projectId, userId)) {
            throw new EntityNotFoundException("Project not found");
        }
    }
}
