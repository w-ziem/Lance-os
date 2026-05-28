package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByUserId(UUID userId);

    List<Task> findAllByUserIdAndProjectId(UUID userId, UUID projectId);

    Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
