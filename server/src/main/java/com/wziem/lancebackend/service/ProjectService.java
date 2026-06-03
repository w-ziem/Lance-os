package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.project.CreateProjectRequest;
import com.wziem.lancebackend.api.dto.project.ProjectDto;
import com.wziem.lancebackend.api.dto.project.UpdateProjectRequest;
import com.wziem.lancebackend.api.dto.project.UpdateProjectStatusRequest;
import com.wziem.lancebackend.api.mapper.ProjectMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.model.entity.Project;
import com.wziem.lancebackend.model.enums.ProjectStatus;
import com.wziem.lancebackend.model.repository.ClientRepository;
import com.wziem.lancebackend.model.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final ProjectMapper projectMapper;

    public List<ProjectDto> getAllProjects(UUID clientId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        List<Project> projects = clientId != null
                ? projectRepository.findAllByUserIdAndClientId(userId, clientId)
                : projectRepository.findAllByUserId(userId);
        return projects.stream().map(projectMapper::toDto).toList();
    }

    public ProjectDto getProject(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        return projectRepository.findByIdAndUserId(id, userId)
                .map(projectMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));
    }

    @Transactional
    public ProjectDto createProject(CreateProjectRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        verifyClientOwnership(request.clientId(), userId);

        Project project = Project.builder()
                .userId(userId)
                .clientId(request.clientId())
                .name(request.name())
                .description(request.description())
                .status(request.status() != null ? request.status() : ProjectStatus.ACTIVE)
                .deadline(request.deadline())
                .budget(request.budget() != null ? request.budget() : BigDecimal.ZERO)
                .build();

        return projectMapper.toDto(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto updateProject(UUID id, UpdateProjectRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        if (!project.getClientId().equals(request.clientId())) {
            verifyClientOwnership(request.clientId(), userId);
        }

        project.setName(request.name());
        project.setClientId(request.clientId());
        project.setDescription(request.description());
        project.setDeadline(request.deadline());
        project.setBudget(request.budget() != null ? request.budget() : project.getBudget());

        return projectMapper.toDto(projectRepository.save(project));
    }

    @Transactional
    public ProjectDto updateProjectStatus(UUID id, UpdateProjectStatusRequest request) {
        UUID userId = SecurityUtils.getCurrentUserId();
        Project project = projectRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        project.setStatus(request.status());

        return projectMapper.toDto(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (!projectRepository.existsByIdAndUserId(id, userId)) {
            throw new EntityNotFoundException("Project not found");
        }
        projectRepository.deleteById(id);
    }

    private void verifyClientOwnership(UUID clientId, UUID userId) {
        if (!clientRepository.existsByIdAndUserId(clientId, userId)) {
            throw new EntityNotFoundException("Client not found");
        }
    }
}
