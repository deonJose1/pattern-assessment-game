package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.ParticipantDto;
import com.cognizant.hackathon.entity.Participant;
import com.cognizant.hackathon.entity.Team;
import com.cognizant.hackathon.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    public List<ParticipantDto> getAllParticipants() {
        return participantRepository.findAll().stream()
                .map(ParticipantService::toDto)
                .toList();
    }

    private static ParticipantDto toDto(Participant p) {
        Team team = p.getTeam();
        String teamName = team != null ? team.getName() : null;
        String hackathon = (team != null && team.getHackathon() != null)
                ? team.getHackathon().getTitle()
                : null;

        return new ParticipantDto(
                p.getId(),
                p.getName(),
                p.getEmail(),
                teamName,
                hackathon,
                p.getRole() != null ? p.getRole().name() : null
        );
    }
}
