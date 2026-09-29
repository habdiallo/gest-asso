package com.habdiallo.contribo.bootstrap;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class BootstrapAdminInitializer implements ApplicationRunner {

    private final BootstrapAdminProperties properties;
    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;

    public BootstrapAdminInitializer(
            BootstrapAdminProperties properties,
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder) {
        this.properties = properties;
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!properties.isEnabled()) {
            return;
        }

        Integer administrators = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_accounts WHERE role = 'ADMINISTRATOR'", Integer.class);
        if (administrators != null && administrators > 0) {
            return;
        }
        Integer accounts = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_accounts", Integer.class);
        if (accounts != null && accounts > 0) {
            throw new IllegalStateException(
                    "Le bootstrap administrateur est réservé à une base sans compte utilisateur.");
        }

        String password = configuredPassword();
        if (password.length() < 12 || password.length() > 128) {
            throw new IllegalStateException(
                    "Le secret du bootstrap administrateur doit contenir entre 12 et 128 caractères.");
        }

        UUID associationId = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID memberId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO associations (id, name, currency) VALUES (?, ?, ?)",
                associationId, properties.getAssociationName(), properties.getCurrency());
        jdbcTemplate.update(
                "INSERT INTO income_categories (id, association_id, label) VALUES (?, ?, ?)",
                categoryId, associationId, properties.getIncomeCategoryLabel());
        jdbcTemplate.update("""
                INSERT INTO members (id, association_id, first_name, last_name, income_category_id, status)
                VALUES (?, ?, ?, ?, ?, 'ACTIVE')
                """, memberId, associationId, "Administrateur", "Initial", categoryId);
        jdbcTemplate.update("""
                INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash,
                    role, operator_can_record_payments, active, must_change_password)
                VALUES (?, ?, ?, ?, ?, 'ADMINISTRATOR', FALSE, TRUE, TRUE)
                """, UUID.randomUUID(), associationId, memberId, properties.getIdentifier(),
                passwordEncoder.encode(password));
    }

    private String configuredPassword() {
        String passwordFile = properties.getPasswordFile();
        if (passwordFile != null && !passwordFile.isBlank()) {
            try {
                return Files.readString(Path.of(passwordFile)).trim();
            } catch (IOException exception) {
                throw new IllegalStateException("Le secret du bootstrap administrateur est illisible.", exception);
            }
        }
        if (properties.getPassword() == null || properties.getPassword().isBlank()) {
            throw new IllegalStateException("Un secret est requis pour activer le bootstrap administrateur.");
        }
        return properties.getPassword().trim();
    }
}
