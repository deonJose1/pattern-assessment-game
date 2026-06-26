package com.cognizant.hackathon.service;

import com.cognizant.hackathon.dto.RubricCriterionDto;
import com.cognizant.hackathon.exception.ResourceNotFoundException;
import com.cognizant.hackathon.repository.HackathonRepository;
import com.cognizant.hackathon.repository.RubricCriterionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RubricService {

    private final RubricCriterionRepository rubricCriterionRepository;
    private final HackathonRepository hackathonRepository;

    public List<RubricCriterionDto> getRubricForHackathon(Long hackathonId) {
        if (!hackathonRepository.existsById(hackathonId)) {
            throw new ResourceNotFoundException("Hackathon not found with id: " + hackathonId);
        }

        return rubricCriterionRepository.findByHackathonId(hackathonId).stream()
                .map(c -> new RubricCriterionDto(c.getName(), c.getMaxPoints()))
                .toList();
    }
}
