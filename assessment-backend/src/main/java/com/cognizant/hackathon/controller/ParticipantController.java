package com.cognizant.hackathon.controller;

import com.cognizant.hackathon.dto.ImportResult;
import com.cognizant.hackathon.dto.ParticipantDto;
import com.cognizant.hackathon.service.ParticipantImportService;
import com.cognizant.hackathon.service.ParticipantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/participants")
@Tag(name = "Participants", description = "Registered hackathon participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;
    private final ParticipantImportService participantImportService;

    @Operation(summary = "List all participants")
    @GetMapping
    public List<ParticipantDto> getAllParticipants() {
        return participantService.getAllParticipants();
    }

    @Operation(summary = "Bulk-import participants from a CSV file (columns: Name, Email, TeamName)")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportResult importParticipants(@RequestParam("file") MultipartFile file) {
        return participantImportService.importParticipants(file);
    }
}
