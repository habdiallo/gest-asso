package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;

import java.util.UUID;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

class MemberIdentifierMigrationTest {

    @Test
    void repairsAccentedUppercaseNamesOnPostgresCLocale() {
        try (PostgreSQLContainer<?> postgres = newDatabase()) {
            postgres.start();
            migrateTo(postgres, "3");
            Seed seed = seedPhoneIdentifier(postgres);

            migrateTo(postgres, "4");
            JdbcTemplate jdbcTemplate = jdbcTemplate(postgres);
            String migratedIdentifier = jdbcTemplate.queryForObject(
                    "select identifier from user_accounts where id = ?",
                    String.class,
                    seed.accountId());
            String suffix = migratedIdentifier.substring(migratedIdentifier.length() - 4);

            migrateTo(postgres, null);

            assertThat(jdbcTemplate.queryForObject(
                    "select identifier from user_accounts where id = ?",
                    String.class,
                    seed.accountId())).isEqualTo("ejcamara-" + suffix);
            assertThat(jdbcTemplate.queryForObject(
                    "select count(*) from user_account_identifier_correction_t204 where account_id = ?",
                    Integer.class,
                    seed.accountId())).isEqualTo(1);
            assertThat(jdbcTemplate.queryForObject(
                    "select password_hash from user_accounts where id = ?",
                    String.class,
                    seed.accountId())).isEqualTo("hash-before-migration");
        }
    }

    @Test
    void leavesAnAlreadyCorrectIdentifierUntouched() {
        try (PostgreSQLContainer<?> postgres = newDatabase()) {
            postgres.start();
            migrateTo(postgres, "3");
            Seed seed = seedAlreadyCorrectIdentifier(postgres);

            migrateTo(postgres, "4");
            JdbcTemplate jdbcTemplate = jdbcTemplate(postgres);
            String migratedIdentifier = jdbcTemplate.queryForObject(
                    "select identifier from user_accounts where id = ?",
                    String.class,
                    seed.accountId());
            String suffix = migratedIdentifier.substring(migratedIdentifier.length() - 4);

            migrateTo(postgres, null);

            assertThat(migratedIdentifier).isEqualTo("acamara-" + suffix);
            assertThat(jdbcTemplate.queryForObject(
                    "select identifier from user_accounts where id = ?",
                    String.class,
                    seed.accountId())).isEqualTo(migratedIdentifier);
            assertThat(jdbcTemplate.queryForObject(
                    "select count(*) from user_account_identifier_correction_t204 where account_id = ?",
                    Integer.class,
                    seed.accountId())).isZero();
        }
    }

    @Test
    void rollsBackTheCorrectiveMigrationOnIdentifierCollision() {
        try (PostgreSQLContainer<?> postgres = newDatabase()) {
            postgres.start();
            migrateTo(postgres, "3");
            Seed seed = seedPhoneIdentifier(postgres);
            migrateTo(postgres, "4");

            JdbcTemplate jdbcTemplate = jdbcTemplate(postgres);
            String migratedIdentifier = jdbcTemplate.queryForObject(
                    "select identifier from user_accounts where id = ?",
                    String.class,
                    seed.accountId());
            String candidate = "ejcamara-" + migratedIdentifier.substring(migratedIdentifier.length() - 4);
            UUID conflictingMemberId = UUID.randomUUID();
            UUID conflictingAccountId = UUID.randomUUID();
            jdbcTemplate.update(
                    "insert into members (id, association_id, first_name, last_name, income_category_id, status) "
                            + "values (?, ?, ?, ?, ?, 'ACTIVE')",
                    conflictingMemberId,
                    seed.associationId(),
                    "Conforme",
                    "Compte",
                    seed.incomeCategoryId());
            jdbcTemplate.update(
                    "insert into user_accounts (id, association_id, member_id, identifier, password_hash, role) "
                            + "values (?, ?, ?, ?, ?, 'MEMBER')",
                    conflictingAccountId,
                    seed.associationId(),
                    conflictingMemberId,
                    candidate,
                    "hash-conflict");

            Throwable failure = catchThrowable(() -> migrateTo(postgres, null));

            assertThat(failure)
                    .isInstanceOf(FlywayException.class)
                    .hasMessageContaining("T-204: identifier collision");
            assertThat(jdbcTemplate.queryForObject(
                    "select identifier from user_accounts where id = ?",
                    String.class,
                    seed.accountId())).isEqualTo(migratedIdentifier);
            assertThat(jdbcTemplate.queryForObject(
                    "select count(*) from information_schema.tables "
                            + "where table_schema = 'public' and table_name = 'user_account_identifier_correction_t204'",
                    Integer.class)).isZero();
            assertThat(jdbcTemplate.queryForObject(
                    "select count(*) from flyway_schema_history where version = '5'",
                    Integer.class)).isZero();
        }
    }

    private static PostgreSQLContainer<?> newDatabase() {
        return new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
                .withEnv("POSTGRES_INITDB_ARGS", "--locale=C");
    }

    private static void migrateTo(PostgreSQLContainer<?> postgres, String target) {
        var configuration = Flyway.configure()
                .dataSource(postgres.getJdbcUrl(), postgres.getUsername(), postgres.getPassword())
                .locations("classpath:db/migration");
        if (target != null) {
            configuration.target(target);
        }
        configuration.load().migrate();
    }

    private static JdbcTemplate jdbcTemplate(PostgreSQLContainer<?> postgres) {
        return new JdbcTemplate(new org.springframework.jdbc.datasource.DriverManagerDataSource(
                postgres.getJdbcUrl(),
                postgres.getUsername(),
                postgres.getPassword()));
    }

    private static Seed seedPhoneIdentifier(PostgreSQLContainer<?> postgres) {
        JdbcTemplate jdbcTemplate = jdbcTemplate(postgres);
        UUID associationId = UUID.randomUUID();
        UUID incomeCategoryId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        jdbcTemplate.update(
                "insert into associations (id, name, currency) values (?, ?, 'GNF')",
                associationId,
                "Association de test");
        jdbcTemplate.update(
                "insert into income_categories (id, association_id, label) values (?, ?, ?)",
                incomeCategoryId,
                associationId,
                "Cotisation");
        jdbcTemplate.update(
                "insert into members (id, association_id, first_name, last_name, phone, income_category_id, status) "
                        + "values (?, ?, ?, ?, ?, ?, 'ACTIVE')",
                memberId,
                associationId,
                "Élodie-Jane",
                "Çamara",
                "33600000000",
                incomeCategoryId);
        jdbcTemplate.update(
                "insert into user_accounts (id, association_id, member_id, identifier, password_hash, role) "
                        + "values (?, ?, ?, ?, ?, 'MEMBER')",
                accountId,
                associationId,
                memberId,
                "33600000000",
                "hash-before-migration");
        return new Seed(associationId, incomeCategoryId, accountId);
    }

    private static Seed seedAlreadyCorrectIdentifier(PostgreSQLContainer<?> postgres) {
        JdbcTemplate jdbcTemplate = jdbcTemplate(postgres);
        UUID associationId = UUID.randomUUID();
        UUID incomeCategoryId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        jdbcTemplate.update(
                "insert into associations (id, name, currency) values (?, ?, 'GNF')",
                associationId,
                "Association de test");
        jdbcTemplate.update(
                "insert into income_categories (id, association_id, label) values (?, ?, ?)",
                incomeCategoryId,
                associationId,
                "Cotisation");
        jdbcTemplate.update(
                "insert into members (id, association_id, first_name, last_name, phone, income_category_id, status) "
                        + "values (?, ?, ?, ?, ?, ?, 'ACTIVE')",
                memberId,
                associationId,
                "Awa",
                "Camara",
                "33600000001",
                incomeCategoryId);
        jdbcTemplate.update(
                "insert into user_accounts (id, association_id, member_id, identifier, password_hash, role) "
                        + "values (?, ?, ?, ?, ?, 'MEMBER')",
                accountId,
                associationId,
                memberId,
                "33600000001",
                "hash-before-migration");
        return new Seed(associationId, incomeCategoryId, accountId);
    }

    private record Seed(UUID associationId, UUID incomeCategoryId, UUID accountId) {
    }
}
