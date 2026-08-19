package com.wziem.lancebackend.model.entity;

import com.wziem.lancebackend.model.enums.IngestChannel;
import com.wziem.lancebackend.model.enums.ProposalKind;
import com.wziem.lancebackend.model.enums.ProposalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "proposals")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // null for NEW_CLIENT - there is no existing project to target yet
    @Column(name = "target_project_id")
    private UUID targetProjectId;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false)
    private ProposalKind kind;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ProposalStatus status = ProposalStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_channel", nullable = false)
    private IngestChannel sourceChannel;

    // Transcript or pasted text the proposal was derived from
    @Column(name = "source_text", nullable = false, columnDefinition = "TEXT")
    private String sourceText;

    // Proposed operations; shape depends on kind, parsed into a typed record by ProposalService
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", nullable = false, columnDefinition = "jsonb")
    private String payload;

    @Column(name = "summary", nullable = false)
    private String summary;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "decided_at")
    private Instant decidedAt;
}
