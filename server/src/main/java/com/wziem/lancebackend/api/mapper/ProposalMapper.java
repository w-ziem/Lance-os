package com.wziem.lancebackend.api.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wziem.lancebackend.api.dto.proposal.ProposalDto;
import com.wziem.lancebackend.model.entity.Proposal;
import org.mapstruct.Mapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Abstract class rather than an interface so ObjectMapper can be injected — the
 * payload is stored as a jsonb string but exposed to the client as real nested JSON.
 */
@Mapper(componentModel = "spring")
public abstract class ProposalMapper {

    @Autowired
    protected ObjectMapper objectMapper;

    public abstract ProposalDto toDto(Proposal proposal);

    public abstract List<ProposalDto> toDtoList(List<Proposal> proposals);

    protected JsonNode payloadToJson(String payload) {
        if (payload == null) return null;
        try {
            return objectMapper.readTree(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Malformed proposal payload", e);
        }
    }
}
