package com.secureapi.dto;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class MarkResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String subject;
    private String assessment;
    private double score;
    private double maxScore;
    private String uploadedBy;
}
