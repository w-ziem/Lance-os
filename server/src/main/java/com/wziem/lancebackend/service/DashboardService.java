package com.wziem.lancebackend.service;

import com.wziem.lancebackend.api.dto.dashboard.DashboardSummaryDto;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.model.enums.ProjectStatus;
import com.wziem.lancebackend.model.enums.TaskPriority;
import com.wziem.lancebackend.model.repository.ClientRepository;
import com.wziem.lancebackend.model.repository.ProjectRepository;
import com.wziem.lancebackend.model.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final ClientRepository clientRepository;

    public DashboardSummaryDto getSummary() {
        UUID userId = SecurityUtils.getCurrentUserId();
        LocalDate today = LocalDate.now();

        BigDecimal revenue             = projectRepository.sumActiveBudget(userId);
        long activeProjects            = projectRepository.countByUserIdAndStatus(userId, ProjectStatus.ACTIVE);
        long completedProjects         = projectRepository.countByUserIdAndStatus(userId, ProjectStatus.COMPLETED);
        long tasksDueToday             = taskRepository.countByUserIdAndDeadline(userId, today);
        long highPriorityDueToday      = taskRepository.countByUserIdAndDeadlineAndPriority(userId, today, TaskPriority.HIGH);
        long clientCount               = clientRepository.countByUserId(userId);

        return new DashboardSummaryDto(
                revenue,
                activeProjects,
                completedProjects,
                tasksDueToday,
                highPriorityDueToday,
                clientCount
        );
    }
}
