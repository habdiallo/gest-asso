package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.habdiallo.contribo.security.JwtTokenService;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardHttpTest extends RsaIntegrationTestSupport {

    private static final UUID ASSOCIATION_ID = UUID.fromString("00000000-0000-0000-0000-000000000201");
    private static final UUID OTHER_ASSOCIATION_ID = UUID.fromString("00000000-0000-0000-0000-000000000202");
    private static final UUID CATEGORY_ID = UUID.fromString("00000000-0000-0000-0000-000000000203");
    private static final UUID OTHER_CATEGORY_ID = UUID.fromString("00000000-0000-0000-0000-000000000204");

    private static final UUID ADMIN_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000205");
    private static final UUID TREASURER_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000206");
    private static final UUID AUTHORIZED_OPERATOR_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000207");
    private static final UUID UNAUTHORIZED_OPERATOR_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000208");
    private static final UUID MEMBER_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000209");
    private static final UUID INACTIVE_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000210");
    private static final UUID OTHER_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000211");

    private static final UUID ADMIN_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000212");
    private static final UUID TREASURER_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000213");
    private static final UUID AUTHORIZED_OPERATOR_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000214");
    private static final UUID UNAUTHORIZED_OPERATOR_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000215");
    private static final UUID MEMBER_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000216");
    private static final UUID OTHER_USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000217");

    private static final UUID CAMPAIGN_ONE_ID = UUID.fromString("00000000-0000-0000-0000-000000000221");
    private static final UUID CAMPAIGN_TWO_ID = UUID.fromString("00000000-0000-0000-0000-000000000222");
    private static final UUID CAMPAIGN_THREE_ID = UUID.fromString("00000000-0000-0000-0000-000000000223");
    private static final UUID CAMPAIGN_FOUR_ID = UUID.fromString("00000000-0000-0000-0000-000000000224");
    private static final UUID CAMPAIGN_FIVE_ID = UUID.fromString("00000000-0000-0000-0000-000000000225");
    private static final UUID CAMPAIGN_SIX_ID = UUID.fromString("00000000-0000-0000-0000-000000000226");
    private static final UUID OTHER_CAMPAIGN_ID = UUID.fromString("00000000-0000-0000-0000-000000000227");

    private static final UUID FIRST_DUE_ID = UUID.fromString("00000000-0000-0000-0000-000000000231");
    private static final UUID SECOND_DUE_ID = UUID.fromString("00000000-0000-0000-0000-000000000232");
    private static final UUID FUND_ONE_ID = UUID.fromString("00000000-0000-0000-0000-000000000241");
    private static final UUID FUND_TWO_ID = UUID.fromString("00000000-0000-0000-0000-000000000242");
    private static final UUID OTHER_FUND_ID = UUID.fromString("00000000-0000-0000-0000-000000000243");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService tokenService;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM payments");
        jdbcTemplate.update("DELETE FROM contributions");
        jdbcTemplate.update("DELETE FROM dues");
        jdbcTemplate.update("DELETE FROM campaign_category_amounts");
        jdbcTemplate.update("DELETE FROM campaigns");
        jdbcTemplate.update("DELETE FROM social_funds");
        jdbcTemplate.update("DELETE FROM user_accounts");
        jdbcTemplate.update("DELETE FROM members");
        jdbcTemplate.update("DELETE FROM income_categories");
        jdbcTemplate.update("DELETE FROM associations");

        jdbcTemplate.update(
                "INSERT INTO associations (id, name, currency) VALUES (?, 'Association test', 'GNF'), (?, 'Autre association', 'GNF')",
                ASSOCIATION_ID, OTHER_ASSOCIATION_ID);
        jdbcTemplate.update(
                "INSERT INTO income_categories (id, association_id, label) VALUES (?, ?, 'Standard'), (?, ?, 'Autre')",
                CATEGORY_ID, ASSOCIATION_ID, OTHER_CATEGORY_ID, OTHER_ASSOCIATION_ID);

        insertMemberAndAccount(ADMIN_MEMBER_ID, ADMIN_USER_ID, "Administrateur", "ADMINISTRATOR", false, true);
        insertMemberAndAccount(TREASURER_MEMBER_ID, TREASURER_USER_ID, "Tresorier", "TREASURER", false, true);
        insertMemberAndAccount(
                AUTHORIZED_OPERATOR_MEMBER_ID, AUTHORIZED_OPERATOR_USER_ID, "Operateur autorise", "OPERATOR", true, true);
        insertMemberAndAccount(
                UNAUTHORIZED_OPERATOR_MEMBER_ID, UNAUTHORIZED_OPERATOR_USER_ID, "Operateur limite", "OPERATOR", false, true);
        insertMemberAndAccount(MEMBER_MEMBER_ID, MEMBER_USER_ID, "Membre", "MEMBER", false, true);
        insertMember( INACTIVE_MEMBER_ID, "Membre inactif", "INACTIVE", ASSOCIATION_ID, CATEGORY_ID);
        insertMember(OTHER_MEMBER_ID, "Autre membre", "ACTIVE", OTHER_ASSOCIATION_ID, OTHER_CATEGORY_ID);
        insertAccount(OTHER_USER_ID, OTHER_MEMBER_ID, "Autre administrateur", "ADMINISTRATOR", false, OTHER_ASSOCIATION_ID);

        insertCampaign(CAMPAIGN_ONE_ID, ASSOCIATION_ID, "Campagne 1", 1);
        insertCampaign(CAMPAIGN_TWO_ID, ASSOCIATION_ID, "Campagne 2", 2);
        insertCampaign(CAMPAIGN_THREE_ID, ASSOCIATION_ID, "Campagne 3", 3);
        insertCampaign(CAMPAIGN_FOUR_ID, ASSOCIATION_ID, "Campagne 4", 4);
        insertCampaign(CAMPAIGN_FIVE_ID, ASSOCIATION_ID, "Campagne 5", 5);
        insertCampaign(CAMPAIGN_SIX_ID, ASSOCIATION_ID, "Campagne 6", 6);
        insertCampaign(OTHER_CAMPAIGN_ID, OTHER_ASSOCIATION_ID, "Campagne autre", 1);
        insertDue(FIRST_DUE_ID, CAMPAIGN_ONE_ID, MEMBER_MEMBER_ID, 1000L);
        insertDue(SECOND_DUE_ID, CAMPAIGN_TWO_ID, MEMBER_MEMBER_ID, 500L);
        insertPayment(FIRST_DUE_ID, 100L);
        insertPayment(SECOND_DUE_ID, 500L);
        for (int index = 0; index < 5; index++) {
            insertPayment(FIRST_DUE_ID, 10L);
        }

        insertFund(FUND_ONE_ID, ASSOCIATION_ID, "Cagnotte 1", 1000L);
        insertFund(FUND_TWO_ID, ASSOCIATION_ID, "Cagnotte 2", 2000L);
        insertFund(OTHER_FUND_ID, OTHER_ASSOCIATION_ID, "Cagnotte autre", 1000L);
        insertContribution(FUND_ONE_ID, 100L);
        insertContribution(FUND_TWO_ID, 200L);
    }

    @Test
    void unauthorizedOperatorGetsManagementIndicatorsWithoutFinancialOverview() throws Exception {
        mockMvc.perform(get("/dashboard").header("Authorization", bearer(UNAUTHORIZED_OPERATOR_USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.view").value("MANAGEMENT"))
                .andExpect(jsonPath("$.activeMemberCount").value(5))
                .andExpect(jsonPath("$.registeredMemberCount").value(6))
                .andExpect(jsonPath("$.recentCampaigns").isArray())
                .andExpect(jsonPath("$.recentCampaigns.length()").value(5))
                .andExpect(jsonPath("$.financialOverview").doesNotExist());
    }

    @Test
    void authorizedManagementRolesReceiveFinancialOverviewAndFiveRecentPayments() throws Exception {
        for (UUID userId : new UUID[] {ADMIN_USER_ID, TREASURER_USER_ID, AUTHORIZED_OPERATOR_USER_ID}) {
            mockMvc.perform(get("/dashboard").header("Authorization", bearer(userId)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.view").value("MANAGEMENT"))
                    .andExpect(jsonPath("$.financialOverview").exists())
                    .andExpect(jsonPath("$.financialOverview.recentPayments.length()").value(5))
                    .andExpect(jsonPath("$.financialOverview.allOpenCampaignsSummary.openCampaignCount").value(6))
                    .andExpect(jsonPath("$.financialOverview.allOpenSocialFundsSummary.openSocialFundCount").value(2))
                    .andExpect(jsonPath("$.financialOverview.allOpenSocialFundsSummary.collectedAmount").value(300));
        }
    }

    @Test
    void financialOverviewSupportsSelectedCampaignAndSocialFund() throws Exception {
        mockMvc.perform(get("/dashboard")
                        .param("campaignId", CAMPAIGN_ONE_ID.toString())
                        .param("socialFundId", FUND_ONE_ID.toString())
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.financialOverview.selectedCampaign.id").value(CAMPAIGN_ONE_ID.toString()))
                .andExpect(jsonPath("$.financialOverview.allOpenCampaignsSummary").doesNotExist())
                .andExpect(jsonPath("$.financialOverview.selectedSocialFund.id").value(FUND_ONE_ID.toString()))
                .andExpect(jsonPath("$.financialOverview.allOpenSocialFundsSummary").doesNotExist());
    }

    @Test
    void memberDashboardIncludesDueAndContributionAggregates() throws Exception {
        mockMvc.perform(get("/dashboard").header("Authorization", bearer(MEMBER_USER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.view").value("MEMBER"))
                .andExpect(jsonPath("$.unpaidDueCount").value(1))
                .andExpect(jsonPath("$.totalRemainingAmount").value(850))
                .andExpect(jsonPath("$.paidDueCount").value(1))
                .andExpect(jsonPath("$.totalContributionAmount").value(300))
                .andExpect(jsonPath("$.contributedSocialFundCount").value(2))
                .andExpect(jsonPath("$.recentDues.length()").value(2));
    }

    @Test
    void resourceFiltersDoNotRevealOtherAssociations() throws Exception {
        mockMvc.perform(get("/dashboard")
                        .param("campaignId", OTHER_CAMPAIGN_ID.toString())
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));

        mockMvc.perform(get("/dashboard")
                        .param("socialFundId", OTHER_FUND_ID.toString())
                        .header("Authorization", bearer(ADMIN_USER_ID)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RESOURCE_NOT_FOUND"));
    }

    @Test
    void dashboardRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
    }

    private void insertMemberAndAccount(
            UUID memberId,
            UUID userId,
            String name,
            String role,
            boolean operatorCanRecordPayments,
            boolean active) {
        insertMember(memberId, name, "ACTIVE", ASSOCIATION_ID, CATEGORY_ID);
        insertAccount(userId, memberId, name + " compte", role, operatorCanRecordPayments, ASSOCIATION_ID, active);
    }

    private void insertMember(UUID memberId, String name, String status, UUID associationId, UUID categoryId) {
        jdbcTemplate.update(
                "INSERT INTO members (id, association_id, first_name, last_name, income_category_id, status) "
                        + "VALUES (?, ?, ?, 'Test', ?, ?)",
                memberId, associationId, name, categoryId, status);
    }

    private void insertAccount(
            UUID userId,
            UUID memberId,
            String identifier,
            String role,
            boolean operatorCanRecordPayments,
            UUID associationId) {
        insertAccount(userId, memberId, identifier, role, operatorCanRecordPayments, associationId, true);
    }

    private void insertAccount(
            UUID userId,
            UUID memberId,
            String identifier,
            String role,
            boolean operatorCanRecordPayments,
            UUID associationId,
            boolean active) {
        jdbcTemplate.update(
                "INSERT INTO user_accounts "
                        + "(id, association_id, member_id, identifier, password_hash, role, operator_can_record_payments, active) "
                        + "VALUES (?, ?, ?, ?, 'unused', ?, ?, ?)",
                userId, associationId, memberId, identifier, role, operatorCanRecordPayments, active);
    }

    private void insertCampaign(UUID id, UUID associationId, String name, int daysAgo) {
        LocalDate startDate = LocalDate.now().minusDays(daysAgo);
        jdbcTemplate.update(
                "INSERT INTO campaigns (id, association_id, name, start_date, end_date, status) "
                        + "VALUES (?, ?, ?, ?, ?, 'OPEN')",
                id, associationId, name, startDate, startDate.plusDays(30));
    }

    private void insertDue(UUID id, UUID campaignId, UUID memberId, long amount) {
        jdbcTemplate.update(
                "INSERT INTO dues "
                        + "(id, campaign_id, member_id, income_category_id, income_category_label_snapshot, due_amount, status) "
                        + "VALUES (?, ?, ?, ?, 'Standard', ?, 'DUE')",
                id, campaignId, memberId, CATEGORY_ID, amount);
    }

    private void insertPayment(UUID dueId, long amount) {
        jdbcTemplate.update(
                "INSERT INTO payments (id, due_id, amount, payment_date, method, recorded_by) "
                        + "VALUES (?, ?, ?, CURRENT_DATE, 'CASH', ?)",
                UUID.randomUUID(), dueId, amount, ADMIN_USER_ID);
    }

    private void insertFund(UUID id, UUID associationId, String title, long targetAmount) {
        jdbcTemplate.update(
                "INSERT INTO social_funds "
                        + "(id, association_id, title, event_type, beneficiary, start_date, end_date, status, target_amount) "
                        + "VALUES (?, ?, ?, 'WEDDING', 'Famille', CURRENT_DATE, CURRENT_DATE + 30, 'OPEN', ?)",
                id, associationId, title, targetAmount);
    }

    private void insertContribution(UUID fundId, long amount) {
        jdbcTemplate.update(
                "INSERT INTO contributions "
                        + "(id, social_fund_id, member_id, amount, contribution_date, method, recorded_by) "
                        + "VALUES (?, ?, ?, ?, CURRENT_DATE, 'CASH', ?)",
                UUID.randomUUID(), fundId, MEMBER_MEMBER_ID, amount, ADMIN_USER_ID);
    }

    private String bearer(UUID userId) {
        return "Bearer " + tokenService.issue(userId);
    }
}
