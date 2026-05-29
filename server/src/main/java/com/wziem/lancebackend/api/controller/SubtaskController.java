package com.wziem.lancebackend.api.controller;

import com.wziem.lancebackend.api.dto.subtask.CreateSubtaskRequest;
import com.wziem.lancebackend.api.dto.subtask.SubtaskDto;
import com.wziem.lancebackend.api.dto.subtask.UpdateSubtaskRequest;
import com.wziem.lancebackend.service.SubtaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tasks/{taskId}/subtasks")
@RequiredArgsConstructor
public class SubtaskController {

    private final SubtaskService subtaskService;

    @PostMapping
    public ResponseEntity<SubtaskDto> createSubtask(
            @PathVariable UUID taskId,
            @Valid @RequestBody CreateSubtaskRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subtaskService.createSubtask(taskId, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<SubtaskDto> updateSubtask(
            @PathVariable UUID taskId,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSubtaskRequest request
    ) {
        return ResponseEntity.ok(subtaskService.updateSubtask(taskId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubtask(
            @PathVariable UUID taskId,
            @PathVariable UUID id
    ) {
        subtaskService.deleteSubtask(taskId, id);
        return ResponseEntity.noContent().build();
    }
}
