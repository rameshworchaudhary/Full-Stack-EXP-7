package com.secureapi.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MarkRequest {
    @NotNull private Long studentId;
    @NotBlank @Size(max = 100) private String subject;
    @NotBlank @Size(max = 100) private String assessment;
    @PositiveOrZero private double score;
    @Positive private double maxScore;
}
