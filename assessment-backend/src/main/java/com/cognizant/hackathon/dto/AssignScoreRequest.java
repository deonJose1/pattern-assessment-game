package com.cognizant.hackathon.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/** Body for POST /admin/scores, e.g. { "submissionId": 3, "score": 90 }. */
public record AssignScoreRequest(
        @NotNull(message = "submissionId is required")
        Long submissionId,

        @NotNull(message = "score is required")
        @PositiveOrZero(message = "score must be zero or positive")
        Integer score
) {
}
