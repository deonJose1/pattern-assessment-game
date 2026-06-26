package com.cognizant.hackathon.controller;

import com.cognizant.hackathon.entity.Hackathon;
import com.cognizant.hackathon.service.HackathonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/admin/events")
@Tag(name = "Events", description = "Manage hackathon events")
@RequiredArgsConstructor
public class AdminEventController {

    private final HackathonService hackathonService;

    @Operation(summary = "List all events")
    @GetMapping
    public List<Hackathon> getAllEvents() {
        return hackathonService.getAllHackathons();
    }

    @Operation(summary = "Get an event by id")
    @GetMapping("/{id}")
    public Hackathon getEventById(@PathVariable Long id) {
        return hackathonService.getHackathonById(id);
    }

    @Operation(summary = "Create a new event")
    @PostMapping
    public ResponseEntity<Hackathon> createEvent(@RequestBody Hackathon event) {
        Hackathon created = hackathonService.createHackathon(event);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing event")
    @PutMapping("/{id}")
    public Hackathon updateEvent(@PathVariable Long id, @RequestBody Hackathon event) {
        return hackathonService.updateHackathon(id, event);
    }

    @Operation(summary = "Delete an event")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        hackathonService.deleteHackathon(id);
        return ResponseEntity.noContent().build();
    }
}
