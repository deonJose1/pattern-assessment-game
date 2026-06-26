package com.cognizant.hackathon.controller;

import com.cognizant.hackathon.dto.StatusUpdateRequest;
import com.cognizant.hackathon.dto.SubmissionDto;
import com.cognizant.hackathon.service.SubmissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/submissions")
@Tag(name = "Submissions", description = "Review project submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @Operation(summary = "List all submissions")
    @GetMapping
    public List<SubmissionDto> getAllSubmissions() {
        return submissionService.getAllSubmissions();
    }

    @Operation(summary = "Update a submission's review status (approve/reject)")
    @PutMapping("/{id}/status")
    public SubmissionDto updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return submissionService.updateStatus(id, request.status());
    }
}
