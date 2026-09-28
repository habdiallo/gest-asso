package com.habdiallo.contribo;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
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
class CampaignPaymentHttpTest {

    private final UUID associationId = UUID.randomUUID();
    private final UUID categoryId = UUID.randomUUID();
    private final UUID memberId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenService tokenService;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("DELETE FROM payments");
        jdbcTemplate.update("DELETE FROM dues");
        jdbcTemplate.update("DELETE FROM campaign_category_amounts");
        jdbcTemplate.update("DELETE FROM campaigns");
        jdbcTemplate.update("DELETE FROM user_accounts");
        jdbcTemplate.update("DELETE FROM members");
        jdbcTemplate.update("DELETE FROM income_categories");
        jdbcTemplate.update("DELETE FROM associations");
        jdbcTemplate.update("INSERT INTO associations (id, name, currency) VALUES (?, 'Test', 'GNF')", associationId);
        jdbcTemplate.update(
                "INSERT INTO income_categories (id, association_id, label) VALUES (?, ?, 'Standard')",
                categoryId, associationId);
        jdbcTemplate.update(
                "INSERT INTO members (id, association_id, first_name, last_name, income_category_id, status) "
                        + "VALUES (?, ?, 'Amadou', 'Diallo', ?, 'ACTIVE')",
                memberId, associationId, categoryId);
        jdbcTemplate.update(
                "INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash, role) "
                        + "VALUES (?, ?, ?, 'admin', 'unused', 'ADMINISTRATOR')",
                userId, associationId, memberId);
    }

    @Test
    void createsOpensAndCollectsACampaignPayment() throws Exception {
        String token = tokenService.issue(userId);
        String body = """
                {
                  "name": "Cotisation septembre",
                  "startDate": "%s",
                  "endDate": "%s",
                  "memberSelection": "ALL_ACTIVE_MEMBERS",
                  "categoryAmounts": [{"incomeCategoryId": "%s", "amount": 100000}]
                }
                """.formatted(LocalDate.now(), LocalDate.now().plusDays(10), categoryId);

        String campaign = mockMvc.perform(post("/campaigns")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("UPCOMING"))
                .andExpect(jsonPath("$.memberCount").value(1))
                .andReturn().getResponse().getContentAsString();
        String campaignId = campaign.replaceFirst("^\\{\\\"id\\\":\\\"([^\\\"]+).*", "$1");

        String dueId = mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get(
                        "/campaigns/" + campaignId + "/dues")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].status").value("DUE"))
                .andReturn().getResponse().getContentAsString()
                .replaceFirst("^\\{\\\"items\\\":\\[\\{\\\"id\\\":\\\"([^\\\"]+).*", "$1");

        mockMvc.perform(post("/campaigns/" + campaignId + "/open")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("OPEN"));

        mockMvc.perform(post("/dues/" + dueId + "/payments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":100000,\"paymentDate\":\"" + LocalDate.now()
                                + "\",\"method\":\"CASH\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.due.status").value("PAID"))
                .andExpect(jsonPath("$.payment.amount").value(100000));
    }

    @Test
    void refusesPaymentBeforeCampaignIsOpen() throws Exception {
        String token = tokenService.issue(userId);
        UUID campaignId = UUID.randomUUID();
        UUID dueId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO campaigns (id, association_id, name, start_date, end_date, status) VALUES (?, ?, 'Campaign', ?, ?, 'UPCOMING')",
                campaignId, associationId, LocalDate.now(), LocalDate.now().plusDays(1));
        jdbcTemplate.update(
                "INSERT INTO campaign_category_amounts (campaign_id, income_category_id, amount) VALUES (?, ?, 100000)",
                campaignId, categoryId);
        jdbcTemplate.update(
                "INSERT INTO dues (id, campaign_id, member_id, income_category_id, income_category_label_snapshot, due_amount, status) "
                        + "VALUES (?, ?, ?, ?, 'Standard', 100000, 'DUE')",
                dueId, campaignId, memberId, categoryId);

        mockMvc.perform(post("/dues/" + dueId + "/payments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":1000,\"paymentDate\":\"" + LocalDate.now()
                                + "\",\"method\":\"CASH\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CAMPAIGN_NOT_OPEN"));
    }
}
