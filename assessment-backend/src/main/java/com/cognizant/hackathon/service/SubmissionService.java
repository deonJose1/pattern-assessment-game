package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.SubmissionDto;
import com.cognizant.hackathon.entity.Submission;
import com.cognizant.hackathon.entity.enums.SubmissionStatus;
import com.cognizant.hackathon.exception.ResourceNotFoundException;
import com.cognizant.hackathon.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;

    public List<SubmissionDto> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(SubmissionService::toDto)
                .toList();
    }

    public SubmissionDto updateStatus(Long id, String statusValue) {
        Submission submission = findById(id);
        submission.setStatus(parseStatus(statusValue));
        return toDto(submissionRepository.save(submission));
    }

    private Submission findById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));
    }

    private SubmissionStatus parseStatus(String value) {
        try {
            return SubmissionStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new IllegalArgumentException("Invalid submission status: " + value);
        }
    }

    private static SubmissionDto toDto(Submission s) {
        return new SubmissionDto(
                s.getId(),
                s.getTeam() != null ? s.getTeam().getName() : null,
                s.getHackathon() != null ? s.getHackathon().getTitle() : null,
                s.getProjectTitle(),
                s.getRepositoryUrl(),
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getScore()
        );
    }
}
