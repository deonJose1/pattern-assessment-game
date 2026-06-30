package com.cognizant.hackathon.service;

import com.cognizant.hackathon.entity.Hackathon;
import com.cognizant.hackathon.event.HackathonCreatedEvent;
import com.cognizant.hackathon.event.HackathonDeletedEvent;
import com.cognizant.hackathon.event.HackathonUpdatedEvent;
import com.cognizant.hackathon.exception.ResourceNotFoundException;
import com.cognizant.hackathon.repository.HackathonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HackathonService {

    private final HackathonRepository hackathonRepository;
    private final ApplicationEventPublisher eventPublisher;

    public List<Hackathon> getAllHackathons() {
        return hackathonRepository.findAll();
    }

    public Hackathon getHackathonById(Long id) {
        return hackathonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon not found with id: " + id));
    }

    @Transactional
    public Hackathon createHackathon(Hackathon hackathon) {
        Hackathon saved = hackathonRepository.save(hackathon);
        eventPublisher.publishEvent(new HackathonCreatedEvent(saved.getId(), saved.getTitle()));
        return saved;
    }

    @Transactional
    public Hackathon updateHackathon(Long id, Hackathon updatedData) {
        Hackathon existing = getHackathonById(id);

        existing.setTitle(updatedData.getTitle());
        existing.setDescription(updatedData.getDescription());
        existing.setStartDate(updatedData.getStartDate());
        existing.setEndDate(updatedData.getEndDate());
        existing.setStatus(updatedData.getStatus());
        // Only rotate the per-hackathon submission secret when one is supplied, so an
        // update that omits it (the common case) doesn't accidentally wipe it.
        if (updatedData.getSubmissionSecret() != null) {
            existing.setSubmissionSecret(updatedData.getSubmissionSecret());
        }

        Hackathon saved = hackathonRepository.save(existing);
        eventPublisher.publishEvent(new HackathonUpdatedEvent(saved.getId(), saved.getTitle()));
        return saved;
    }

    @Transactional
    public void deleteHackathon(Long id) {
        Hackathon existing = getHackathonById(id);
        // Capture identity before deletion — the entity is gone once we delete.
        Long deletedId = existing.getId();
        String title = existing.getTitle();
        hackathonRepository.delete(existing);
        eventPublisher.publishEvent(new HackathonDeletedEvent(deletedId, title));
    }
}
