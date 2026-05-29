package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.subtask.CreateSubtaskRequest;
import com.wziem.lancebackend.api.dto.subtask.SubtaskDto;
import com.wziem.lancebackend.api.dto.subtask.UpdateSubtaskRequest;
import com.wziem.lancebackend.api.mapper.SubtaskMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.model.entity.Subtask;
import com.wziem.lancebackend.model.repository.SubtaskRepository;
import com.wziem.lancebackend.model.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;
    private final SubtaskMapper subtaskMapper;

    @Transactional
    public SubtaskDto createSubtask(UUID taskId, CreateSubtaskRequest request) {
        verifyTaskOwnership(taskId);

        int nextPosition = (int) subtaskRepository.countByTaskId(taskId);
        Subtask subtask = Subtask.builder()
                .taskId(taskId)
                .label(request.label())
                .done(false)
                .position(nextPosition)
                .build();

        return subtaskMapper.toDto(subtaskRepository.save(subtask));
    }

    @Transactional
    public SubtaskDto updateSubtask(UUID taskId, UUID id, UpdateSubtaskRequest request) {
        verifyTaskOwnership(taskId);

        Subtask subtask = subtaskRepository.findByIdAndTaskId(id, taskId)
                .orElseThrow(() -> new EntityNotFoundException("Subtask not found"));

        if (request.label() != null) subtask.setLabel(request.label());
        if (request.done() != null) subtask.setDone(request.done());

        return subtaskMapper.toDto(subtaskRepository.save(subtask));
    }

    @Transactional
    public void deleteSubtask(UUID taskId, UUID id) {
        verifyTaskOwnership(taskId);

        if (!subtaskRepository.existsByIdAndTaskId(id, taskId)) {
            throw new EntityNotFoundException("Subtask not found");
        }
        subtaskRepository.deleteById(id);
    }

    private void verifyTaskOwnership(UUID taskId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (!taskRepository.existsByIdAndUserId(taskId, userId)) {
            throw new EntityNotFoundException("Task not found");
        }
    }
}
