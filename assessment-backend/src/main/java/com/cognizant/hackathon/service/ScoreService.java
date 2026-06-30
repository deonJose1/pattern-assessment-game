package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.AssignScoreRequest;
import com.cognizant.hackathon.dto.ScoreResponse;
import com.cognizant.hackathon.entity.Score;
import com.cognizant.hackathon.entity.Submission;
import com.cognizant.hackathon.exception.ResourceNotFoundException;
import com.cognizant.hackathon.event.SubmissionScoredEvent;
import com.cognizant.hackathon.repository.ScoreRepository;
import com.cognizant.hackathon.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScoreService {

    private final SubmissionRepository submissionRepository;
    private final ScoreRepository scoreRepository;
    private final LeaderboardService leaderboardService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Assigns (or re-assigns) a submission's score: persists it in the scores
     * table, keeps the submission's own score in sync, and rebuilds the event
     * leaderboard so rankings stay current.
     */
    @Transactional
    public ScoreResponse assignScore(AssignScoreRequest request) {
        Submission submission = submissionRepository.findById(request.submissionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Submission not found with id: " + request.submissionId()));

        Score score = scoreRepository.findBySubmissionId(submission.getId())
                .orElseGet(Score::new);
        score.setSubmission(submission);
        score.setValue(request.score());
        scoreRepository.save(score);

        submission.setScore(request.score());
        submissionRepository.save(submission);

        Long eventId = submission.getHackathon() != null ? submission.getHackathon().getId() : null;
        if (eventId != null) {
            leaderboardService.recompute(eventId);
        }

        // Decoupled side effect: an AFTER_COMMIT listener turns this into an
        // activity-feed entry once the score is durably persisted.
        String teamName = submission.getTeam() != null ? submission.getTeam().getName() : "a team";
        eventPublisher.publishEvent(new SubmissionScoredEvent(submission.getId(), teamName, request.score()));

        return new ScoreResponse(submission.getId(), request.score(), eventId);
    }
}
