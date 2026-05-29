package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubtaskRepository extends JpaRepository<Subtask, UUID> {

    List<Subtask> findAllByTaskIdOrderByPositionAsc(UUID taskId);

    List<Subtask> findAllByTaskIdInOrderByPositionAsc(Collection<UUID> taskIds);

    Optional<Subtask> findByIdAndTaskId(UUID id, UUID taskId);

    boolean existsByIdAndTaskId(UUID id, UUID taskId);

    long countByTaskId(UUID taskId);
}
