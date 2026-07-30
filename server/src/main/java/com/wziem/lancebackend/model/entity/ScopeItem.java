package com.wziem.lancebackend.model.entity;

import com.wziem.lancebackend.model.enums.ScopeItemSource;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "scope_items")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ScopeItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Commercial estimate - what was sold. Independent of Task.estimateHours by design.
    @Column(name = "estimate_hours", nullable = false)
    private Double estimateHours;

    @Column(name = "position", nullable = false)
    private int position;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    @Builder.Default
    private ScopeItemSource source = ScopeItemSource.MANUAL;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
