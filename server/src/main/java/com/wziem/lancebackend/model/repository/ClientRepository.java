package com.wziem.lancebackend.model.repository;

import com.wziem.lancebackend.model.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ClientRepository extends JpaRepository<Client, UUID> {

    List<Client> findAllByUserId(UUID userId);

    Optional<Client> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByIdAndUserId(UUID id, UUID userId);

    boolean existsByEmailAndUserId(String email, UUID userId);

    long countByUserId(UUID userId);
}
