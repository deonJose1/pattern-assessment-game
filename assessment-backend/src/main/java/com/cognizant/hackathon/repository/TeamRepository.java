package com.cognizant.hackathon.repository;

import com.cognizant.hackathon.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    Optional<Team> findFirstByName(String name);

    /** Scoped lookup: a team by name within a specific hackathon (multi-tenant isolation). */
    Optional<Team> findFirstByNameAndHackathonId(String name, Long hackathonId);
}
