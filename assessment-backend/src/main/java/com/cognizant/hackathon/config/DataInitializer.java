package com.cognizant.hackathon.config;

import com.cognizant.hackathon.entity.AdminUser;
import com.cognizant.hackathon.entity.Hackathon;
import com.cognizant.hackathon.entity.Participant;
import com.cognizant.hackathon.entity.RubricCriterion;
import com.cognizant.hackathon.entity.Submission;
import com.cognizant.hackathon.entity.Team;
import com.cognizant.hackathon.entity.enums.AdminRole;
import com.cognizant.hackathon.entity.enums.ParticipantRole;
import com.cognizant.hackathon.entity.enums.SubmissionStatus;
import com.cognizant.hackathon.entity.enums.TeamStatus;
import com.cognizant.hackathon.repository.AdminUserRepository;
import com.cognizant.hackathon.repository.HackathonRepository;
import com.cognizant.hackathon.repository.ParticipantRepository;
import com.cognizant.hackathon.repository.RubricCriterionRepository;
import com.cognizant.hackathon.repository.SubmissionRepository;
import com.cognizant.hackathon.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Seeds the in-memory H2 database on startup so the running app mirrors the
 * frontend's demo data (teams/submissions/rubrics) and ships with usable admin
 * logins. Idempotent: only seeds empty tables.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String DEMO_REPO = "https://github.com/cognizant-hackathon-demo/repo";

    // Per-hackathon submission secrets seeded for the demo events.
    private static final String SECRET_AI = "ai-sprint-2026";
    private static final String SECRET_FINTECH = "fintech-2026";
    private static final String SECRET_CLOUD = "cloud-native-2026";

    private final HackathonRepository hackathonRepository;
    private final TeamRepository teamRepository;
    private final ParticipantRepository participantRepository;
    private final SubmissionRepository submissionRepository;
    private final RubricCriterionRepository rubricCriterionRepository;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // IMPORTANT: all seeding goes through repositories directly — NEVER through
        // the event-publishing services (HackathonService, SubmissionService, etc.).
        // Bootstrap data is not a user action, so it must not emit activity events.
        // Combined with the idempotency guards below, a restart never floods the feed.
        if (hackathonRepository.count() == 0) {
            seedDomainData();
        } else {
            log.info("Demo data already present ({} hackathons) — skipping domain seeding.",
                    hackathonRepository.count());
        }

        if (adminUserRepository.count() == 0) {
            seedAdmins();
        }

        // Idempotent backfill: ensureCriteria() only inserts for hackathons that
        // currently have none, so re-running this on a seeded DB is a no-op.
        seedCriteria();

        // Idempotent backfill of per-hackathon submission secrets, so demo events
        // that predate the submissionSecret column (added via ddl-auto=update) can
        // still accept submissions.
        ensureSubmissionSecrets();
    }

    /** Sets a submission secret on each demo hackathon that currently lacks one. */
    private void ensureSubmissionSecrets() {
        setSecretIfMissing("AI Innovation Sprint", SECRET_AI);
        setSecretIfMissing("FinTech Build Weekend", SECRET_FINTECH);
        setSecretIfMissing("Cloud Native Challenge", SECRET_CLOUD);
    }

    private void setSecretIfMissing(String title, String secret) {
        hackathonRepository.findFirstByTitle(title).ifPresent(hackathon -> {
            if (hackathon.getSubmissionSecret() == null || hackathon.getSubmissionSecret().isBlank()) {
                hackathon.setSubmissionSecret(secret);
                hackathonRepository.save(hackathon);
            }
        });
    }

    private void seedDomainData() {
        Hackathon aiSprint = hackathonRepository.save(new Hackathon(
                null,
                "AI Innovation Sprint",
                "AI/ML for cloud cost optimization & ops tooling",
                LocalDate.now().plusDays(1),
                LocalDate.now().plusDays(3),
                "ACTIVE",
                SECRET_AI));

        Hackathon finTech = hackathonRepository.save(new Hackathon(
                null,
                "FinTech Build Weekend",
                "Payment & fraud-detection prototyping",
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(9),
                "UPCOMING",
                SECRET_FINTECH));

        Hackathon cloudNative = hackathonRepository.save(new Hackathon(
                null,
                "Cloud Native Challenge",
                "Legacy to Kubernetes-native microservices migration task.",
                LocalDate.now().minusDays(5),
                LocalDate.now().minusDays(2),
                "COMPLETED",
                SECRET_CLOUD));

        // Evaluation criteria are seeded separately by seedCriteria() so they're
        // also backfilled onto an already-populated database.

        // Teams + their two members + project submissions.
        seedTeam("Neural Ninjas", aiSprint, "CostGuard — AI Cloud Spend Optimizer", SubmissionStatus.PENDING,
                "Aarav Sharma", ParticipantRole.BACKEND, "Priya Nair", ParticipantRole.AI);
        seedTeam("Pixel Pioneers", finTech, "PayFlow — Instant Settlement Dashboard", SubmissionStatus.PENDING,
                "Rohan Mehta", ParticipantRole.FRONTEND, "Sneha Iyer", ParticipantRole.BACKEND);
        seedTeam("Cloud Crusaders", cloudNative, "K8s Migrator — Legacy to Microservices", SubmissionStatus.APPROVED,
                "Vikram Rao", ParticipantRole.BACKEND, "Ananya Das", ParticipantRole.FRONTEND);
        seedTeam("Data Dynamos", aiSprint, "InsightLens — Realtime Anomaly Detection", SubmissionStatus.REJECTED,
                "Karthik Menon", ParticipantRole.AI, "Divya Pillai", ParticipantRole.FRONTEND);
        seedTeam("Quantum Quokkas", finTech, "LedgerLink — Cross-Bank Reconciliation", SubmissionStatus.PENDING,
                "Aditya Verma", ParticipantRole.FRONTEND, "Meera Krishnan", ParticipantRole.BACKEND);
    }

    private void seedRubric(Hackathon hackathon, Object... nameMaxPairs) {
        for (int i = 0; i < nameMaxPairs.length; i += 2) {
            String name = (String) nameMaxPairs[i];
            int max = (Integer) nameMaxPairs[i + 1];
            rubricCriterionRepository.save(RubricCriterion.builder()
                    .name(name)
                    .maxPoints(max)
                    .hackathon(hackathon)
                    .build());
        }
    }

    /** Seeds default evaluation criteria for the demo hackathons (idempotent). */
    private void seedCriteria() {
        ensureCriteria("AI Innovation Sprint", "Model Accuracy", 30, "Innovation", 30, "Code Quality", 40);
        ensureCriteria("Cloud Native Challenge", "Scalability", 40, "Security", 30, "Implementation", 30);
        ensureCriteria("FinTech Build Weekend",
                "Innovation", 25, "Technical Complexity", 25, "UI/UX", 25, "Business Value", 25);
    }

    /** Adds the given criteria to the named hackathon only if it currently has none. */
    private void ensureCriteria(String hackathonTitle, Object... nameMaxPairs) {
        hackathonRepository.findAll().stream()
                .filter(h -> hackathonTitle.equals(h.getTitle()))
                .findFirst()
                .ifPresent(hackathon -> {
                    if (rubricCriterionRepository.findByHackathonId(hackathon.getId()).isEmpty()) {
                        seedRubric(hackathon, nameMaxPairs);
                    }
                });
    }

    private void seedTeam(String teamName, Hackathon hackathon, String projectTitle, SubmissionStatus status,
                          String member1, ParticipantRole role1, String member2, ParticipantRole role2) {
        Team team = teamRepository.save(Team.builder()
                .name(teamName)
                .status(TeamStatus.valueOf(status.name()))
                .hackathon(hackathon)
                .build());

        participantRepository.save(Participant.builder()
                .name(member1)
                .email(toEmail(member1))
                .role(role1)
                .team(team)
                .build());
        participantRepository.save(Participant.builder()
                .name(member2)
                .email(toEmail(member2))
                .role(role2)
                .team(team)
                .build());

        submissionRepository.save(Submission.builder()
                .projectTitle(projectTitle)
                .repositoryUrl(DEMO_REPO)
                .status(status)
                .score(null)
                .team(team)
                .hackathon(hackathon)
                .build());
    }

    private String toEmail(String fullName) {
        return fullName.trim().toLowerCase().replace(" ", ".") + "@cognizant.com";
    }

    private void seedAdmins() {
        adminUserRepository.save(AdminUser.builder()
                .email("deon.jose@cognizant.com")
                .password(passwordEncoder.encode("Password@123"))
                .role(AdminRole.ADMIN)
                .build());
        adminUserRepository.save(AdminUser.builder()
                .email("admin@cognizant.com")
                .password(passwordEncoder.encode("admin123"))
                .role(AdminRole.ADMIN)
                .build());
        adminUserRepository.save(AdminUser.builder()
                .email("judge@cognizant.com")
                .password(passwordEncoder.encode("judge123"))
                .role(AdminRole.JUDGE)
                .build());
    }
}
