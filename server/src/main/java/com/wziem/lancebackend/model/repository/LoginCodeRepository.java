package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.LoginCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LoginCodeRepository extends JpaRepository<LoginCode, UUID> {
    Optional<LoginCode> findFirstByUserIdAndUsedAtIsNullOrderByCreatedAtDesc(UUID userId);

    List<LoginCode> findAllByUserIdAndUsedAtIsNull(UUID userId);
}

