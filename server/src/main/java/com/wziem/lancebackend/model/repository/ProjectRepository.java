package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.Project;
import com.wziem.lancebackend.model.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findAllByUserId(UUID userId);

    List<Project> findAllByUserIdAndClientId(UUID userId, UUID clientId);

    Optional<Project> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndClientIdAndStatus(UUID userId, UUID clientId, ProjectStatus status);

    @Query("SELECT COALESCE(SUM(p.budget), 0) FROM Project p " +
            "WHERE p.userId = :userId AND p.clientId = :clientId AND p.status = 'COMPLETED'")
    BigDecimal sumCompletedBudgetByClient(UUID userId, UUID clientId);

    @Query("SELECT COALESCE(SUM(p.budget), 0) FROM Project p " +
            "WHERE p.userId = :userId AND p.clientId = :clientId AND p.status <> 'CANCELLED'")
    BigDecimal sumProjectedBudgetByClient(UUID userId, UUID clientId);
}
