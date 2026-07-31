package com.wziem.lancebackend.model.entity;


import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    // Null until the user sets it — "not configured" is distinct from a rate of 0
    @Column(name = "hourly_rate")
    private Double hourlyRate;

}
