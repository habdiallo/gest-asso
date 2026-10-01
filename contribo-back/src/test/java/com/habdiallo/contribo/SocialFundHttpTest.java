package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.habdiallo.contribo.security.JwtTokenService;

@SpringBootTest
@AutoConfigureMockMvc
class SocialFundHttpTest extends RsaIntegrationTestSupport {

    private static final UUID ASSOCIATION_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID CATEGORY_ID = UUID.fromString("10000000-0000-0000-0000-000000000002");
    private static final UUID RECORDER_MEMBER_ID = UUID.fromString("10000000-0000-0000-0000-000000000003");
    private static final UUID CONTRIBUTOR_MEMBER_ID = UUID.fromString("10000000-0000-0000-0000-000000000004");
    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000005");
    private static final UUID FUND_ID = UUID.fromString("10000000-0000-0000-0000-000000000006");
    private static final UUID OPERATOR_MEMBER_ID = UUID.fromString("10000000-0000-0000-0000-000000000007");
    private static final UUID OPERATOR_USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000008");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private JwtTokenService tokenService;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM contributions");
        jdbcTemplate.update("DELETE FROM social_funds");
        jdbcTemplate.update("DELETE FROM payments");
        jdbcTemplate.update("DELETE FROM dues");
        jdbcTemplate.update("DELETE FROM campaign_category_amounts");
        jdbcTemplate.update("DELETE FROM campaigns");
        jdbcTemplate.update("DELETE FROM user_accounts");
        jdbcTemplate.update("DELETE FROM members");
        jdbcTemplate.update("DELETE FROM income_categories");
        jdbcTemplate.update("DELETE FROM associations");
        jdbcTemplate.update("INSERT INTO associations (id, name, currency) VALUES (?, 'Contribo', 'GNF')",
                ASSOCIATION_ID);
        jdbcTemplate.update("INSERT INTO income_categories (id, association_id, label) VALUES (?, ?, 'Standard')",
                CATEGORY_ID, ASSOCIATION_ID);
        jdbcTemplate.update("""
                INSERT INTO members (id, association_id, first_name, last_name, income_category_id, status)
                VALUES (?, ?, 'Aminata', 'Recorder', ?, 'ACTIVE'),
                       (?, ?, 'Mamadou', 'Contributor', ?, 'ACTIVE')
                """, RECORDER_MEMBER_ID, ASSOCIATION_ID, CATEGORY_ID,
                CONTRIBUTOR_MEMBER_ID, ASSOCIATION_ID, CATEGORY_ID);
        jdbcTemplate.update("""
                INSERT INTO members (id, association_id, first_name, last_name, income_category_id, status)
                VALUES (?, ?, 'Oumar', 'Operator', ?, 'ACTIVE')
                """, OPERATOR_MEMBER_ID, ASSOCIATION_ID, CATEGORY_ID);
        jdbcTemplate.update("""
                INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash, role)
                VALUES (?, ?, ?, 'recorder', 'ignored', 'TREASURER')
                """, USER_ID, ASSOCIATION_ID, RECORDER_MEMBER_ID);
        jdbcTemplate.update("""
                INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash, role,
                    operator_can_record_payments)
                VALUES (?, ?, ?, 'operator', 'ignored', 'OPERATOR', FALSE)
                """, OPERATOR_USER_ID, ASSOCIATION_ID, OPERATOR_MEMBER_ID);
        jdbcTemplate.update("""
                INSERT INTO social_funds (id, association_id, title, event_type, beneficiary, start_date, end_date, status, target_amount)
                VALUES (?, ?, 'Soutien famille', 'WEDDING', 'Famille Camara', '2026-09-01', '2026-09-30', 'OPEN', 1000)
                """, FUND_ID, ASSOCIATION_ID);
    }

    @Test
    void contributionsUpdateFundSummaryAndClosedFundRejectsNewContribution() throws Exception {
        String authorization = "Bearer " + tokenService.issue(USER_ID);
        String memberContribution = """
                {"memberId":"10000000-0000-0000-0000-000000000004","amount":700,"contributionDate":"2026-09-14","method":"CASH"}
                """;
        String externalContribution = """
                {"externalContributor":{"firstName":"Fanta","lastName":"Camara"},"amount":500,"contributionDate":"2026-09-15","method":"BANK_TRANSFER"}
                """;

        mockMvc.perform(post("/social-funds/{id}/contributions", FUND_ID)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(memberContribution))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contribution.member.id").value(CONTRIBUTOR_MEMBER_ID.toString()))
                .andExpect(jsonPath("$.contribution.externalContributor").doesNotExist());

        mockMvc.perform(post("/social-funds/{id}/contributions", FUND_ID)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(externalContribution))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.contribution.member").doesNotExist())
                .andExpect(jsonPath("$.contribution.externalContributor.firstName").value("Fanta"));

        mockMvc.perform(get("/social-funds/{id}", FUND_ID).header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.collectedAmount").value(1200))
                .andExpect(jsonPath("$.contributionCount").value(2))
                .andExpect(jsonPath("$.contributorCount").value(2))
                .andExpect(jsonPath("$.remainingToTargetAmount").value(0))
                .andExpect(jsonPath("$.progressRate").value(120.0));

        mockMvc.perform(post("/social-funds/{id}/closure", FUND_ID)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"));

        mockMvc.perform(post("/social-funds/{id}/contributions", FUND_ID)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(memberContribution))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("RESOURCE_CLOSED"));
    }

    @Test
    void operatorWithoutFinancialPermissionCannotCreateOrCloseAFund() throws Exception {
        String authorization = "Bearer " + tokenService.issue(OPERATOR_USER_ID);
        String request = """
                {"title":"Collecte interdite","eventType":"WEDDING","beneficiary":"Famille Bah",
                 "startDate":"2026-09-01","endDate":"2026-09-30"}
                """;

        mockMvc.perform(post("/social-funds")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(request))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));

        mockMvc.perform(post("/social-funds/{id}/closure", FUND_ID)
                        .header("Authorization", authorization))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
    }

    @Test
    void largeSocialFundPageReturnsAnEmptyPage() throws Exception {
        mockMvc.perform(get("/social-funds?page=2147483647&size=100")
                        .header("Authorization", "Bearer " + tokenService.issue(USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isEmpty())
                .andExpect(jsonPath("$.page.totalElements").value(1));
    }
}
