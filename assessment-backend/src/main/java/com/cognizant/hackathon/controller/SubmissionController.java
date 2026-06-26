package com.cognizant.hackathon.controller;

import com.cognizant.hackathon.dto.EvaluateRequest;
import com.cognizant.hackathon.dto.EvaluateResponse;
import com.cognizant.hackathon.dto.ScoreUpdateRequest;
import com.cognizant.hackathon.dto.StatusUpdateRequest;
import com.cognizant.hackathon.dto.SubmissionDto;
import com.cognizant.hackathon.service.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping
    public List<SubmissionDto> getAllSubmissions() {
        return submissionService.getAllSubmissions();
    }

    @PatchMapping("/{id}/status")
    public SubmissionDto updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return submissionService.updateStatus(id, request.status());
    }

    @PatchMapping("/{id}/score")
    public SubmissionDto updateScore(@PathVariable Long id, @Valid @RequestBody ScoreUpdateRequest request) {
        return submissionService.updateScore(id, request.score());
    }

    @PostMapping("/{id}/evaluate")
    public EvaluateResponse evaluate(@PathVariable Long id, @Valid @RequestBody EvaluateRequest request) {
        return submissionService.evaluate(id, request.scores());
    }
}
