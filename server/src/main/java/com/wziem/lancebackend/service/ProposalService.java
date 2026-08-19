package com.wziem.lancebackend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wziem.lancebackend.api.dto.proposal.CreateProposalCommand;
import com.wziem.lancebackend.api.dto.proposal.ProposalDto;
import com.wziem.lancebackend.api.mapper.ProposalMapper;
import com.wziem.lancebackend.config.SecurityUtils;
import com.wziem.lancebackend.exceptions.ProposalStateException;
import com.wziem.lancebackend.model.entity.Proposal;
import com.wziem.lancebackend.model.enums.ProposalStatus;
import com.wziem.lancebackend.model.repository.ProjectRepository;
import com.wziem.lancebackend.model.repository.ProposalRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;
    private final ProposalMapper proposalMapper;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<ProposalDto> list(ProposalStatus status) {
        UUID userId = SecurityUtils.getCurrentUserId();

        List<Proposal> proposals = status == null
                ? proposalRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                : proposalRepository.findAllByUserIdAndStatusOrderByCreatedAtDesc(userId, status);

        return proposalMapper.toDtoList(proposals);
    }

    @Transactional(readOnly = true)
    public ProposalDto get(UUID id) {
        return proposalMapper.toDto(findOwned(id));
    }

    /**
     * Called by the ingest pipeline, not by a controller — a proposal is always
     * derived from a transcript or pasted text, never authored by hand.
     */
    @Transactional
    public ProposalDto create(CreateProposalCommand command) {
        UUID userId = SecurityUtils.getCurrentUserId();

        if (command.targetProjectId() != null
                && !projectRepository.existsByIdAndUserId(command.targetProjectId(), userId)) {
            throw new EntityNotFoundException("Project not found");
        }

        Proposal proposal = Proposal.builder()
                .userId(userId)
                .targetProjectId(command.targetProjectId())
                .kind(command.kind())
                .status(ProposalStatus.PENDING)
                .sourceChannel(command.sourceChannel())
                .sourceText(command.sourceText())
                .payload(serialize(command.payload()))
                .summary(command.summary())
                .build();

        return proposalMapper.toDto(proposalRepository.save(proposal));
    }

    @Transactional
    public ProposalDto reject(UUID id) {
        Proposal proposal = findOwned(id);
        requirePending(proposal);

        proposal.setStatus(ProposalStatus.REJECTED);
        proposal.setDecidedAt(Instant.now());

        return proposalMapper.toDto(proposalRepository.save(proposal));
    }

    @Transactional
    public void delete(UUID id) {
        UUID userId = SecurityUtils.getCurrentUserId();

        if (!proposalRepository.existsByIdAndUserId(id, userId)) {
            throw new EntityNotFoundException("Proposal not found");
        }
        proposalRepository.deleteById(id);
    }

    private void requirePending(Proposal proposal) {
        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new ProposalStateException("Proposal was already " + proposal.getStatus().name().toLowerCase());
        }
    }

    private Proposal findOwned(UUID id) {
        return proposalRepository.findByIdAndUserId(id, SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new EntityNotFoundException("Proposal not found"));
    }

    private String serialize(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Proposal payload could not be serialized", e);
        }
    }
}
