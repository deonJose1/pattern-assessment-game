package com.cognizant.hackathon.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Human-in-the-loop evaluation payload: a map of criterion name to awarded
 * points, e.g. { "scores": { "Model Accuracy": 27, "Innovation": 24 } }.
 */
public record EvaluateRequest(
        @NotNull(message = "Scores are required")
        Map<String, Integer> scores
) {
}
