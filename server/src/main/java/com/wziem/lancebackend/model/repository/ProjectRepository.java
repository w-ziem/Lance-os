package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findAllByUserId(UUID userId);

    List<Project> findAllByUserIdAndClientId(UUID userId, UUID clientId);

    Optional<Project> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
