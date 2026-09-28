package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import javax.sql.DataSource;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.habdiallo.contribo.security.JwtTokenService;

@SpringBootTest
@AutoConfigureMockMvc
class MemberCategoryAccountHttpTest {

    private static final UUID ASSOCIATION_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private static final UUID CATEGORY_ID = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private static final UUID ADMIN_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000003");
    private static final UUID OPERATOR_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000004");
    private static final UUID ADMIN_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000005");
    private static final UUID OPERATOR_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000006");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JwtTokenService tokenService;

    @BeforeEach
    void setUp() {
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
                ASSOCIATION_ID, "Association de test");
        jdbcTemplate.update(
                "INSERT INTO income_categories (id, association_id, label) VALUES (?, ?, ?)",
                CATEGORY_ID, ASSOCIATION_ID, "Catégorie A");
        insertMember(ADMIN_MEMBER_ID, "Aminata", "Touré");
        insertMember(OPERATOR_MEMBER_ID, "Moussa", "Bah");
        jdbcTemplate.update(
                "UPDATE members SET preferred_name = ? WHERE id = ?", "Ami", ADMIN_MEMBER_ID);
        jdbcTemplate.update("""
                INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash,
                    role, operator_can_record_payments, active)
                VALUES (?, ?, ?, ?, ?, 'ADMINISTRATOR', FALSE, TRUE)
                """, ADMIN_USER_ID, ASSOCIATION_ID, ADMIN_MEMBER_ID, "admin", "not-used");
        jdbcTemplate.update("""
                INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash,
                    role, operator_can_record_payments, active)
                VALUES (?, ?, ?, ?, ?, 'OPERATOR', FALSE, TRUE)
                """, OPERATOR_USER_ID, ASSOCIATION_ID, OPERATOR_MEMBER_ID, "operator", "not-used");
    }

    @Test
    void administratorCreatesMemberAndItsAccountInTheSameUseCase() throws Exception {
        mockMvc.perform(post("/members")
                        .header("Authorization", bearer(ADMIN_USER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"Fatoumata","lastName":"Diallo",
                                 "incomeCategoryId":"00000000-0000-0000-0000-000000000002",
                                 "city":"Conakry"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.account.role").value("MEMBER"));

        Integer memberCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM members WHERE first_name = 'Fatoumata'", Integer.class);
        Integer accountCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user_accounts ua JOIN members m ON m.id = ua.member_id"
                        + " WHERE m.first_name = 'Fatoumata'", Integer.class);
        org.assertj.core.api.Assertions.assertThat(memberCount).isEqualTo(1);
        org.assertj.core.api.Assertions.assertThat(accountCount).isEqualTo(1);
    }

    @Test
    void operatorCanListMembersButCannotCreateOne() throws Exception {
                mockMvc.perform(get("/members")
                        .header("Authorization", bearer(OPERATOR_USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].displayName").value("Moussa Bah"));

        mockMvc.perform(post("/members")
                        .header("Authorization", bearer(OPERATOR_USER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"firstName":"Refus","lastName":"Operateur",
                                 "incomeCategoryId":"00000000-0000-0000-0000-000000000002"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void memberStatusTransitionsAreIdempotencyConflicts() throws Exception {
        mockMvc.perform(post("/members/{memberId}/deactivation", ADMIN_MEMBER_ID)
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        mockMvc.perform(post("/members/{memberId}/deactivation", ADMIN_MEMBER_ID)
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("MEMBER_ALREADY_INACTIVE"));

        mockMvc.perform(post("/members/{memberId}/reactivation", ADMIN_MEMBER_ID)
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void memberPatchDistinguishesAnAbsentNameFromAnExplicitNull() throws Exception {
        mockMvc.perform(patch("/members/{memberId}/contact", ADMIN_MEMBER_ID)
                        .header("Authorization", bearer(ADMIN_USER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"city\":\"Conakry\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredName").value("Ami"));

        mockMvc.perform(patch("/members/{memberId}/contact", ADMIN_MEMBER_ID)
                        .header("Authorization", bearer(ADMIN_USER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"preferredName\":null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredName").doesNotExist());
    }

    @Test
    void categoryAndOperatorBusinessRulesUseContractErrors() throws Exception {
        mockMvc.perform(get("/users")
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page.totalElements").value(2));

        mockMvc.perform(post("/income-categories")
                        .header("Authorization", bearer(ADMIN_USER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"label\":\"Catégorie A\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_CATEGORY_LABEL"));

        mockMvc.perform(put("/users/{userId}", OPERATOR_USER_ID)
                        .header("Authorization", bearer(ADMIN_USER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"TREASURER\",\"operatorCanRecordPayments\":true}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_OPERATOR_CONFIGURATION"));

        mockMvc.perform(put("/users/{userId}", OPERATOR_USER_ID)
                        .header("Authorization", bearer(ADMIN_USER_ID))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"TREASURER\",\"operatorCanRecordPayments\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("TREASURER"));
    }

    @Test
    void accountAndCategoryReadsAreScopedToTheAuthenticatedAssociation() throws Exception {
        UUID otherAssociation = UUID.fromString("00000000-0000-0000-0000-000000000010");
        UUID otherCategory = UUID.fromString("00000000-0000-0000-0000-000000000011");
        jdbcTemplate.update(
                "INSERT INTO associations (id, name, currency) VALUES (?, ?, 'GNF')",
                otherAssociation, "Autre association");
        jdbcTemplate.update(
                "INSERT INTO income_categories (id, association_id, label) VALUES (?, ?, ?)",
                otherCategory, otherAssociation, "Catégorie étrangère");

        mockMvc.perform(get("/income-categories/{categoryId}", otherCategory)
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    private void insertMember(UUID memberId, String firstName, String lastName) {
        jdbcTemplate.update("""
                INSERT INTO members (id, association_id, first_name, last_name, income_category_id, status)
                VALUES (?, ?, ?, ?, ?, 'ACTIVE')
                """, memberId, ASSOCIATION_ID, firstName, lastName, CATEGORY_ID);
    }

    private String bearer(UUID userId) {
        return "Bearer " + tokenService.issue(userId);
    }
}
