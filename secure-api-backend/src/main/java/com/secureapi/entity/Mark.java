package com.secureapi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "marks")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Mark {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    private User student;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String assessment;

    @Column(nullable = false)
    private double score;

    @Column(nullable = false)
    private double maxScore;

    @Column(nullable = false)
    private String uploadedBy;
}
