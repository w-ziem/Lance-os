package com.wziem.lancebackend.api.controller;

import com.wziem.lancebackend.api.dto.schedule.ScheduleConfigDto;
import com.wziem.lancebackend.api.dto.schedule.ScheduleTaskRequest;
import com.wziem.lancebackend.api.dto.schedule.ScheduleViewDto;
import com.wziem.lancebackend.api.dto.schedule.ScheduleViewRequest;
import com.wziem.lancebackend.api.dto.schedule.UpdateTaskLockRequest;
import com.wziem.lancebackend.api.dto.task.TaskDto;
import com.wziem.lancebackend.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tasks/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping("/view")
    public ResponseEntity<ScheduleViewDto> getView(@Valid @RequestBody ScheduleViewRequest request) {
        return ResponseEntity.ok(scheduleService.getView(request));
    }

    @GetMapping("/config")
    public ResponseEntity<ScheduleConfigDto> getConfig() {
        return ResponseEntity.ok(scheduleService.getConfig());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TaskDto> scheduleTask(
            @PathVariable UUID id,
            @Valid @RequestBody ScheduleTaskRequest request
    ) {
        return ResponseEntity.ok(scheduleService.scheduleTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<TaskDto> unscheduleTask(@PathVariable UUID id) {
        return ResponseEntity.ok(scheduleService.unscheduleTask(id));
    }

    @PatchMapping("/{id}/lock")
    public ResponseEntity<TaskDto> setLock(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateTaskLockRequest request
    ) {
        return ResponseEntity.ok(scheduleService.setLock(id, request));
    }
}
