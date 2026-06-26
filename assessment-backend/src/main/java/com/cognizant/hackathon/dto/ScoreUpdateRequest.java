package com.cognizant.hackathon.dto;

import jakarta.validation.constraints.NotNull;

/** Body for directly setting a submission's total score, e.g. { "score": 87 }. */
public record ScoreUpdateRequest(
        @NotNull(message = "Score is required")
        Integer score
) {
}
