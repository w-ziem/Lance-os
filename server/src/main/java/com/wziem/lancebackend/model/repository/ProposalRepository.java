package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.Proposal;
import com.wziem.lancebackend.model.enums.ProposalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProposalRepository extends JpaRepository<Proposal, UUID> {

    List<Proposal> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Proposal> findAllByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, ProposalStatus status);

    Optional<Proposal> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);
}
