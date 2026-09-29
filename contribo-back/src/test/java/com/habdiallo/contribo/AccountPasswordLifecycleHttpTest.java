package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.jayway.jsonpath.JsonPath;
import com.habdiallo.contribo.bootstrap.BootstrapAdminInitializer;
import com.habdiallo.contribo.bootstrap.BootstrapAdminProperties;
import com.habdiallo.contribo.security.JwtTokenService;

@SpringBootTest
@AutoConfigureMockMvc
class AccountPasswordLifecycleHttpTest extends RsaIntegrationTestSupport {

    private static final UUID ASSOCIATION_ID = UUID.fromString("00000000-0000-0000-0000-000000000021");
    private static final UUID CATEGORY_ID = UUID.fromString("00000000-0000-0000-0000-000000000022");
    private static final UUID ADMIN_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000023");
    private static final UUID ADMIN_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000024");
    private static final String INITIAL_PASSWORD = "Initial-Password-123!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JwtTokenService tokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BootstrapAdminInitializer bootstrapAdminInitializer;

    @Autowired
    private BootstrapAdminProperties bootstrapAdminProperties;

    @BeforeEach
    void setUp() {
        bootstrapAdminProperties.setEnabled(false);
        bootstrapAdminProperties.setPassword(null);
        jdbcTemplate.update("DELETE FROM payments");
        jdbcTemplate.update("DELETE FROM dues");
        jdbcTemplate.update("DELETE FROM contributions");
        jdbcTemplate.update("DELETE FROM social_funds");
        jdbcTemplate.update("DELETE FROM campaign_category_amounts");
        jdbcTemplate.update("DELETE FROM campaigns");
        jdbcTemplate.update("DELETE FROM user_accounts");
        jdbcTemplate.update("DELETE FROM members");
        jdbcTemplate.update("DELETE FROM income_categories");
        jdbcTemplate.update("DELETE FROM associations");

        jdbcTemplate.update(
                "INSERT INTO associations (id, name, currency) VALUES (?, ?, 'GNF')",
                ASSOCIATION_ID, "Association cycle comptes");
        jdbcTemplate.update(
                "INSERT INTO income_categories (id, association_id, label) VALUES (?, ?, ?)",
                CATEGORY_ID, ASSOCIATION_ID, "Catégorie test");
        jdbcTemplate.update(
                "INSERT INTO members (id, association_id, first_name, last_name, income_category_id, status)"
                        + " VALUES (?, ?, 'Admin', 'Test', ?, 'ACTIVE')",
                ADMIN_MEMBER_ID, ASSOCIATION_ID, CATEGORY_ID);
        jdbcTemplate.update("""
                INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash,
                    role, operator_can_record_payments, active, must_change_password)
                VALUES (?, ?, ?, 'admin-cycle', ?, 'ADMINISTRATOR', FALSE, TRUE, FALSE)
                """, ADMIN_USER_ID, ASSOCIATION_ID, ADMIN_MEMBER_ID,
                passwordEncoder.encode(INITIAL_PASSWORD));
    }

    @Test
    void temporaryLoginIsLimitedUntilPasswordChange() throws Exception {
        jdbcTemplate.update(
                "UPDATE user_accounts SET must_change_password = TRUE, password_changed_at = NULL WHERE id = ?",
                ADMIN_USER_ID);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"admin-cycle\",\"password\":\""
                                + INITIAL_PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.mustChangePassword").value(true));

        String temporaryToken = tokenService.issue(ADMIN_USER_ID, true);

        mockMvc.perform(get("/me")
                        .header("Authorization", bearer(temporaryToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mustChangePassword").value(true))
                .andExpect(jsonPath("$.temporaryPassword").doesNotExist());

        mockMvc.perform(get("/members")
                        .header("Authorization", bearer(temporaryToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("PASSWORD_CHANGE_REQUIRED"));

        mockMvc.perform(post("/auth/password/change")
                        .header("Authorization", bearer(temporaryToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"newPassword\":\"Changed-Password-123!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.mustChangePassword").value(false));

        mockMvc.perform(get("/members")
                        .header("Authorization", bearer(tokenService.issue(ADMIN_USER_ID))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/me")
                        .header("Authorization", bearer(temporaryToken)))
                .andExpect(status().isUnauthorized());

        Boolean mustChangePassword = jdbcTemplate.queryForObject(
                "SELECT must_change_password FROM user_accounts WHERE id = ?",
                Boolean.class, ADMIN_USER_ID);
        org.assertj.core.api.Assertions.assertThat(mustChangePassword).isFalse();
    }

    @Test
    void administratorCanResetCredentialsAndThePreviousTokenIsRevoked() throws Exception {
        String administratorToken = tokenService.issue(ADMIN_USER_ID);

        MvcResult resetResult = mockMvc.perform(post("/users/{userId}/credentials/reset", ADMIN_USER_ID)
                        .header("Authorization", bearer(administratorToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.identifier").value("admin-cycle"))
                .andExpect(jsonPath("$.temporaryPassword").isNotEmpty())
                .andReturn();

        String temporaryPassword = JsonPath.read(
                resetResult.getResponse().getContentAsString(), "$.temporaryPassword");

        mockMvc.perform(get("/users")
                        .header("Authorization", bearer(administratorToken)))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"identifier\":\"admin-cycle\",\"password\":\""
                                + temporaryPassword + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.mustChangePassword").value(true));

        Boolean mustChangePassword = jdbcTemplate.queryForObject(
                "SELECT must_change_password FROM user_accounts WHERE id = ?",
                Boolean.class, ADMIN_USER_ID);
        org.assertj.core.api.Assertions.assertThat(mustChangePassword).isTrue();
    }

    @Test
    void bootstrapCreatesOneAdministratorAndDoesNotResetItOnTheNextRun() {
        jdbcTemplate.update("DELETE FROM user_accounts");
        jdbcTemplate.update("DELETE FROM members");
        jdbcTemplate.update("DELETE FROM income_categories");
        jdbcTemplate.update("DELETE FROM associations");
        bootstrapAdminProperties.setEnabled(true);
        bootstrapAdminProperties.setIdentifier("bootstrap-admin");
        bootstrapAdminProperties.setPassword("Bootstrap-Password-123!");

        bootstrapAdminInitializer.run(new DefaultApplicationArguments());
        bootstrapAdminInitializer.run(new DefaultApplicationArguments());

        Integer administratorCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_accounts WHERE role = 'ADMINISTRATOR'", Integer.class);
        Integer accountCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_accounts", Integer.class);
        String passwordHash = jdbcTemplate.queryForObject(
                "SELECT password_hash FROM user_accounts WHERE identifier = ?",
                String.class, "bootstrap-admin");
        Boolean mustChangePassword = jdbcTemplate.queryForObject(
                "SELECT must_change_password FROM user_accounts WHERE identifier = ?",
                Boolean.class, "bootstrap-admin");

        org.assertj.core.api.Assertions.assertThat(administratorCount).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(accountCount).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(passwordEncoder.matches(
                "Bootstrap-Password-123!", passwordHash)).isTrue();
        org.assertj.core.api.Assertions.assertThat(mustChangePassword).isTrue();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }
}
