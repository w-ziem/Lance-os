package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.scope.CreateScopeItemRequest;
import com.wziem.lancebackend.api.dto.scope.ScopeItemDto;
import com.wziem.lancebackend.api.dto.scope.ScopeSummaryDto;
import com.wziem.lancebackend.api.dto.scope.UpdateScopeItemRequest;
import com.wziem.lancebackend.api.mapper.ScopeItemMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.model.entity.Project;
import com.wziem.lancebackend.model.entity.ScopeItem;
import com.wziem.lancebackend.model.entity.User;
import com.wziem.lancebackend.model.enums.ScopeItemSource;
import com.wziem.lancebackend.model.repository.ProjectRepository;
import com.wziem.lancebackend.model.repository.ScopeItemRepository;
import com.wziem.lancebackend.model.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScopeItemService {

    private final ScopeItemRepository scopeItemRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ScopeItemMapper scopeItemMapper;

    @Transactional(readOnly = true)
    public List<ScopeItemDto> listByProject(UUID projectId) {
        verifyProjectOwnership(projectId);
        return scopeItemMapper.toDtoList(scopeItemRepository.findAllByProjectIdOrderByPositionAsc(projectId));
    }

    @Transactional(readOnly = true)
    public ScopeItemDto get(UUID projectId, UUID id) {
        verifyProjectOwnership(projectId);
        return scopeItemMapper.toDto(findOwned(projectId, id));
    }

    @Transactional
    public ScopeItemDto create(UUID projectId, CreateScopeItemRequest request) {
        verifyProjectOwnership(projectId);
        return scopeItemMapper.toDto(scopeItemRepository.save(build(projectId, request, ScopeItemSource.MANUAL)));
    }

    /**
     * Used when an accepted proposal materializes scope items. Ownership is verified
     * by the caller, which already resolved the project.
     */
    @Transactional
    public ScopeItemDto createFromProposal(UUID projectId, CreateScopeItemRequest request) {
        return scopeItemMapper.toDto(scopeItemRepository.save(build(projectId, request, ScopeItemSource.AI)));
    }

    @Transactional
    public ScopeItemDto update(UUID projectId, UUID id, UpdateScopeItemRequest request) {
        verifyProjectOwnership(projectId);

        ScopeItem scopeItem = findOwned(projectId, id);

        if (request.name() != null) scopeItem.setName(request.name());
        if (request.description() != null) scopeItem.setDescription(request.description());
        if (request.estimateHours() != null) scopeItem.setEstimateHours(request.estimateHours());

        return scopeItemMapper.toDto(scopeItemRepository.save(scopeItem));
    }

    @Transactional
    public void delete(UUID projectId, UUID id) {
        verifyProjectOwnership(projectId);

        if (!scopeItemRepository.existsByIdAndProjectId(id, projectId)) {
            throw new EntityNotFoundException("Scope item not found");
        }
        scopeItemRepository.deleteById(id);
    }

    /**
     * Valuation of the agreed scope against the project budget. The price is never
     * stored — it is always hours x the user's current rate, so changing the rate
     * reprices every project at once.
     */
    @Transactional(readOnly = true)
    public ScopeSummaryDto getSummary(UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();

        Project project = projectRepository.findByIdAndUserId(projectId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Project not found"));

        List<ScopeItem> items = scopeItemRepository.findAllByProjectIdOrderByPositionAsc(projectId);
        double totalHours = items.stream().mapToDouble(ScopeItem::getEstimateHours).sum();

        Double hourlyRate = userRepository.findById(userId).map(User::getHourlyRate).orElse(null);

        BigDecimal totalValue = hourlyRate == null
                ? null
                : BigDecimal.valueOf(totalHours * hourlyRate).setScale(2, RoundingMode.HALF_UP);

        BigDecimal budget = project.getBudget();
        BigDecimal difference = (totalValue == null || budget == null)
                ? null
                : totalValue.subtract(budget);

        return new ScopeSummaryDto(
                items.size(),
                totalHours,
                hourlyRate,
                totalValue,
                budget,
                difference,
                difference != null && difference.signum() > 0
        );
    }

    private ScopeItem build(UUID projectId, CreateScopeItemRequest request, ScopeItemSource source) {
        return ScopeItem.builder()
                .userId(SecurityUtils.getCurrentUserId())
                .projectId(projectId)
                .name(request.name())
                .description(request.description())
                .estimateHours(request.estimateHours())
                .position((int) scopeItemRepository.countByProjectId(projectId))
                .source(source)
                .build();
    }

    private ScopeItem findOwned(UUID projectId, UUID id) {
        return scopeItemRepository.findByIdAndProjectId(id, projectId)
                .orElseThrow(() -> new EntityNotFoundException("Scope item not found"));
    }

    private void verifyProjectOwnership(UUID projectId) {
        UUID userId = SecurityUtils.getCurrentUserId();
        if (!projectRepository.existsByIdAndUserId(projectId, userId)) {
            throw new EntityNotFoundException("Project not found");
        }
    }
}
