package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.task.CreateTaskRequest;
import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.api.dto.task.UpdateTaskRequest;
import com.wziem.lancebackend.api.dto.task.UpdateTaskStatusRequest;
import com.wziem.lancebackend.api.mapper.TaskMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.model.entity.Task;
import com.wziem.lancebackend.model.enums.TaskPriority;
import com.wziem.lancebackend.model.enums.TaskStatus;
import com.wziem.lancebackend.model.repository.ProjectRepository;
import com.wziem.lancebackend.model.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskMapper taskMapper;

    public List<TaskDto> getAllTasks(UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<Task> tasks = projectId != null
                ? taskRepository.findAllByUserIdAndProjectId(userId, projectId)
                : taskRepository.findAllByUserId(userId);
        return tasks.stream().map(taskMapper::toDto).toList();
    }

    public TaskDto getTask(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return taskRepository.findByIdAndUserId(id, userId)
                .map(taskMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
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

        return taskMapper.toDto(taskRepository.save(task));
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

        return taskMapper.toDto(taskRepository.save(task));
    }

    @Transactional
    public TaskDto updateTaskStatus(UUID id, UpdateTaskStatusRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));

        task.setStatus(request.status());

        return taskMapper.toDto(taskRepository.save(task));
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
