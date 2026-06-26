package com.cognizant.hackathon.controller;

import com.cognizant.hackathon.dto.ParticipantDto;
import com.cognizant.hackathon.service.ParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/participants")
@RequiredArgsConstructor
public class ParticipantController {

    private final ParticipantService participantService;

    @GetMapping
    public List<ParticipantDto> getAllParticipants() {
        return participantService.getAllParticipants();
    }
}
