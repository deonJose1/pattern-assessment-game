package com.cognizant.hackathon.dto;

/**
 * Flattened submission view matching the shape the frontend expects:
 * team and hackathon are exposed as their display names.
 */
public record SubmissionDto(
        Long id,
        String team,
        String hackathon,
        String projectTitle,
        String repositoryUrl,
        String status,
        Integer score
) {
}
