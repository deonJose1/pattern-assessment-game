package com.cognizant.hackathon.entity;

import com.cognizant.hackathon.entity.enums.SubmissionStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapKeyColumn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectTitle;

    private String repositoryUrl;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    /** Total evaluated score; null until the submission has been scored. */
    private Integer score;

    /** Per-criterion score breakdown captured during evaluation. */
    @ElementCollection
    @CollectionTable(name = "submission_score_breakdown", joinColumns = @JoinColumn(name = "submission_id"))
    @MapKeyColumn(name = "criterion")
    @Column(name = "points")
    @Builder.Default
    private Map<String, Integer> scoreBreakdown = new HashMap<>();

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    @JoinColumn(name = "hackathon_id")
    private Hackathon hackathon;
}
