package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.ScopeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScopeItemRepository extends JpaRepository<ScopeItem, UUID> {

    List<ScopeItem> findAllByProjectIdOrderByPositionAsc(UUID projectId);

    Optional<ScopeItem> findByIdAndProjectId(UUID id, UUID projectId);

    boolean existsByIdAndProjectId(UUID id, UUID projectId);

    long countByProjectId(UUID projectId);

    @Query("SELECT COALESCE(SUM(s.estimateHours), 0) FROM ScopeItem s WHERE s.projectId = :projectId")
    Double sumEstimateHoursByProjectId(@Param("projectId") UUID projectId);
}
