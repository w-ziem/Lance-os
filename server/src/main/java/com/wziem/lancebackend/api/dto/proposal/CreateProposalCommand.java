package com.wziem.lancebackend.api.dto.proposal;

import com.wziem.lancebackend.model.enums.IngestChannel;
import com.wziem.lancebackend.model.enums.ProposalKind;

import java.util.UUID;

/**
 * Service-level command, not a REST request body. Proposals are produced by the
 * ingest pipeline, never hand-authored by a user, so there is no POST /proposals.
 * The payload is any object; ProposalService serializes it to jsonb.
 */
public record CreateProposalCommand(
        ProposalKind kind,
        UUID targetProjectId,
        IngestChannel sourceChannel,
        String sourceText,
        Object payload,
        String summary
) {}
