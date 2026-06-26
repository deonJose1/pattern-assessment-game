package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.TeamDto;
import com.cognizant.hackathon.entity.Team;
import com.cognizant.hackathon.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;

    public List<TeamDto> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(TeamService::toDto)
                .toList();
    }

    private static TeamDto toDto(Team t) {
        return new TeamDto(
                t.getId(),
                t.getName(),
                t.getHackathon() != null ? t.getHackathon().getTitle() : null,
                t.getStatus() != null ? t.getStatus().name() : null
        );
    }
}
