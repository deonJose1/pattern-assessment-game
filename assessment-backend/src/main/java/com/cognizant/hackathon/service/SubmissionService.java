package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.CreateSubmissionRequest;
import com.cognizant.hackathon.dto.HackathonOptionDto;
import com.cognizant.hackathon.dto.SubmissionDto;
import com.cognizant.hackathon.entity.Hackathon;
import com.cognizant.hackathon.entity.Submission;
import com.cognizant.hackathon.entity.Team;
import com.cognizant.hackathon.entity.enums.SubmissionStatus;
import com.cognizant.hackathon.event.SubmissionCreatedEvent;
import com.cognizant.hackathon.event.SubmissionStatusChangedEvent;
import com.cognizant.hackathon.exception.ResourceNotFoundException;
import com.cognizant.hackathon.repository.HackathonRepository;
import com.cognizant.hackathon.repository.SubmissionRepository;
import com.cognizant.hackathon.repository.TeamRepository;
import com.cognizant.hackathon.security.TeamSecretValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final HackathonRepository hackathonRepository;
    private final TeamSecretValidator teamSecretValidator;
    private final ApplicationEventPublisher eventPublisher;

    public List<SubmissionDto> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(SubmissionService::toDto)
                .toList();
    }

    /** Public-safe hackathon list (id + title only) for the submission form dropdown. */
    @Transactional(readOnly = true)
    public List<HackathonOptionDto> listHackathonOptions() {
        return hackathonRepository.findAll().stream()
                .map(h -> new HackathonOptionDto(h.getId(), h.getTitle()))
                .toList();
    }

    @Transactional
    public SubmissionDto updateStatus(Long id, String statusValue) {
        Submission submission = findById(id);
        submission.setStatus(parseStatus(statusValue));
        Submission saved = submissionRepository.save(submission);

        String teamName = saved.getTeam() != null ? saved.getTeam().getName() : "A team";
        eventPublisher.publishEvent(new SubmissionStatusChangedEvent(
                saved.getId(),
                teamName,
                saved.getProjectTitle(),
                saved.getStatus() != null ? saved.getStatus().name() : null));

        return toDto(saved);
    }

    /**
     * Creates a PENDING submission with per-hackathon (multi-tenant) secret scoping.
     * Strict order: (1) resolve the hackathon by name [404], (2) verify the
     * X-Team-Secret against THAT hackathon's secret [401], (3) only then resolve the
     * team within that hackathon [404]. Publishes a SubmissionCreatedEvent on success.
     *
     * @param providedSecret the raw X-Team-Secret header value from the request
     */
    @Transactional
    public SubmissionDto createSubmission(CreateSubmissionRequest request, String providedSecret) {
        String hackathonName = trimToNull(request.hackathonName());
        String teamName = trimToNull(request.teamName());
        String projectTitle = trimToNull(request.projectTitle());
        String repoLink = trimToNull(request.repoLink());

        if (hackathonName == null || teamName == null || projectTitle == null || repoLink == null) {
            throw new IllegalArgumentException(
                    "hackathonName, teamName, projectTitle and repoLink are all required");
        }

        // Step 1 — find the hackathon (404 if it doesn't exist).
        Hackathon hackathon = hackathonRepository.findFirstByTitle(hackathonName)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon not found with name: " + hackathonName));

        // Step 2 — verify the secret against THIS hackathon (401 on mismatch/missing).
        teamSecretValidator.validate(providedSecret, hackathon.getSubmissionSecret());

        // Step 3 — only now resolve the team, scoped to this hackathon (404 if absent here).
        Team team = teamRepository.findFirstByNameAndHackathonId(teamName, hackathon.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Team '" + teamName + "' not found in hackathon '" + hackathonName + "'"));

        Submission saved = submissionRepository.save(Submission.builder()
                .projectTitle(projectTitle)
                .repositoryUrl(repoLink)
                .status(SubmissionStatus.PENDING)
                .team(team)
                .hackathon(hackathon)
                .build());

        eventPublisher.publishEvent(
                new SubmissionCreatedEvent(saved.getId(), team.getName(), saved.getProjectTitle()));

        return toDto(saved);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
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
                s.getHackathon() != null ? s.getHackathon().getId() : null,
                s.getProjectTitle(),
                s.getRepositoryUrl(),
                s.getStatus() != null ? s.getStatus().name() : null,
                s.getScore()
        );
    }
}
