package com.wziem.lancebackend.api.controller;

import com.wziem.lancebackend.api.dto.project.CreateProjectRequest;
import com.wziem.lancebackend.api.dto.project.ProjectDto;
import com.wziem.lancebackend.api.dto.project.UpdateProjectRequest;
import com.wziem.lancebackend.api.dto.project.UpdateProjectStatusRequest;
import com.wziem.lancebackend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto>> getAllProjects(
            @RequestParam(required = false) UUID clientId
    ) {
        return ResponseEntity.ok(projectService.getAllProjects(clientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @PostMapping
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody CreateProjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectRequest request
    ) {
        return ResponseEntity.ok(projectService.updateProject(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectDto> updateProjectStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProjectStatusRequest request
    ) {
        return ResponseEntity.ok(projectService.updateProjectStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
