package com.cognizant.hackathon.repository;

import com.cognizant.hackathon.entity.Submission;
import com.cognizant.hackathon.entity.enums.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByStatus(SubmissionStatus status);

    List<Submission> findByScoreIsNotNull();

    List<Submission> findByHackathonId(Long hackathonId);
}
