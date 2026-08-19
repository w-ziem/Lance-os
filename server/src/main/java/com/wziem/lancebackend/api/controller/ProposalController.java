package com.wziem.lancebackend.api.controller;

import com.wziem.lancebackend.api.dto.proposal.ProposalDto;
import com.wziem.lancebackend.model.enums.ProposalStatus;
import com.wziem.lancebackend.service.ProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/proposals")
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    @GetMapping
    public ResponseEntity<List<ProposalDto>> listProposals(
            @RequestParam(required = false) ProposalStatus status
    ) {
        return ResponseEntity.ok(proposalService.list(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProposalDto> getProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(proposalService.get(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ProposalDto> rejectProposal(@PathVariable UUID id) {
        return ResponseEntity.ok(proposalService.reject(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProposal(@PathVariable UUID id) {
        proposalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
