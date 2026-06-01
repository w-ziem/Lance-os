package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findAllByUserId(UUID userId);

    List<Task> findAllByUserIdAndProjectId(UUID userId, UUID projectId);

    Optional<Task> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    @Query("""
        SELECT t FROM Task t
        WHERE t.userId = :userId
          AND t.scheduledStart IS NOT NULL
          AND t.scheduledStart < :rangeEnd
          AND t.scheduledEnd   > :rangeStart
        """)
    List<Task> findScheduledInRange(
            @Param("userId") UUID userId,
            @Param("rangeStart") Instant rangeStart,
            @Param("rangeEnd") Instant rangeEnd
    );

    @Query("""
        SELECT t FROM Task t
        WHERE t.userId = :userId
          AND t.scheduledStart IS NULL
        """)
    List<Task> findUnscheduled(@Param("userId") UUID userId);

    @Query("""
        SELECT t FROM Task t
        WHERE t.userId = :userId
          AND t.id <> :excludeId
          AND t.scheduledStart IS NOT NULL
          AND t.scheduledStart < :end
          AND t.scheduledEnd   > :start
        """)
    List<Task> findOverlapping(
            @Param("userId") UUID userId,
            @Param("excludeId") UUID excludeId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
