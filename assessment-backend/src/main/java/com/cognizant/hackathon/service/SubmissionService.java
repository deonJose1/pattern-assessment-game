package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.EvaluateResponse;
import com.cognizant.hackathon.dto.SubmissionDto;
import com.cognizant.hackathon.entity.Submission;
import com.cognizant.hackathon.entity.enums.SubmissionStatus;
import com.cognizant.hackathon.exception.ResourceNotFoundException;
import com.cognizant.hackathon.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public SubmissionDto updateScore(Long id, Integer score) {
        Submission submission = findById(id);
        submission.setScore(score);
        return toDto(submissionRepository.save(submission));
    }

    /**
     * Human-in-the-loop evaluation: persists the per-criterion breakdown and the
     * summed total, then returns the total to the caller.
     */
    public EvaluateResponse evaluate(Long id, Map<String, Integer> scores) {
        Submission submission = findById(id);

        int total = scores.values().stream()
                .filter(v -> v != null)
                .mapToInt(Integer::intValue)
                .sum();

        submission.setScoreBreakdown(new HashMap<>(scores));
        submission.setScore(total);
        submissionRepository.save(submission);

        return new EvaluateResponse(total);
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
