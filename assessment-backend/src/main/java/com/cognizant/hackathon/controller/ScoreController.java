package com.cognizant.hackathon.controller;

import com.cognizant.hackathon.dto.AssignScoreRequest;
import com.cognizant.hackathon.dto.ScoreResponse;
import com.cognizant.hackathon.service.ScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/scores")
@Tag(name = "Scores", description = "Assign scores to submissions")
@RequiredArgsConstructor
public class ScoreController {

    private final ScoreService scoreService;

    @Operation(summary = "Assign a score to a submission and rebuild its event leaderboard")
    @PostMapping
    public ResponseEntity<ScoreResponse> assignScore(@Valid @RequestBody AssignScoreRequest request) {
        ScoreResponse response = scoreService.assignScore(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
