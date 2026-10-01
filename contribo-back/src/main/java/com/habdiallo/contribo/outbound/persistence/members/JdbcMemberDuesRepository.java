package com.habdiallo.contribo.outbound.persistence.members;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.application.members.MemberDuesRepository;
import com.habdiallo.contribo.domain.campaign.CampaignReference;
import com.habdiallo.contribo.domain.campaign.CampaignStatus;
import com.habdiallo.contribo.domain.campaign.Due;
import com.habdiallo.contribo.domain.campaign.DuePage;
import com.habdiallo.contribo.domain.campaign.DueStatus;
import com.habdiallo.contribo.domain.category.IncomeCategorySummary;
import com.habdiallo.contribo.domain.common.PageMetadata;
import com.habdiallo.contribo.domain.campaign.PersonSummary;
import com.habdiallo.contribo.domain.shared.CurrencyCode;

@Repository
public class JdbcMemberDuesRepository implements MemberDuesRepository {

    private static final String DUE_SELECT = "SELECT d.id, d.member_id, m.first_name, m.last_name, "
            + "m.preferred_name, d.income_category_id, d.income_category_label_snapshot, d.due_amount, "
            + "c.id AS campaign_id, c.name AS campaign_name, c.start_date, c.end_date, "
            + "c.status AS campaign_status, COALESCE(SUM(p.amount), 0) AS paid_amount, COUNT(p.id) AS payment_count "
            + "FROM dues d JOIN campaigns c ON c.id = d.campaign_id JOIN members m ON m.id = d.member_id "
            + "JOIN income_categories ic ON ic.id = d.income_category_id LEFT JOIN payments p ON p.due_id = d.id ";

    private final JdbcTemplate jdbcTemplate;

    public JdbcMemberDuesRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public boolean exists(UUID associationId, UUID memberId) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM members WHERE association_id = ? AND id = ?)",
                Boolean.class, associationId, memberId));
    }

    @Override
    public DuePage findPage(UUID associationId, UUID memberId, int page, int size, DueStatus status) {
        List<Object> parameters = new ArrayList<>();
        String filters = filters(associationId, memberId, status, parameters);
        long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM dues d JOIN campaigns c ON c.id = d.campaign_id "
                        + "JOIN members m ON m.id = d.member_id " + filters,
                Long.class, parameters.toArray());
        parameters.add(size);
        parameters.add((long) page * size);
        List<Due> items = jdbcTemplate.query(
                DUE_SELECT + filters + " GROUP BY d.id, c.id, m.id, ic.id "
                        + "ORDER BY c.start_date DESC, d.id DESC LIMIT ? OFFSET ?",
                DUE_ROW_MAPPER, parameters.toArray());
        return new DuePage(items, new PageMetadata(page, size, total,
                total == 0 ? 0 : (int) ((total + size - 1) / size)));
    }

    @Override
    public DashboardStats dashboardStats(UUID associationId, UUID memberId) {
        DashboardStats dueStats = jdbcTemplate.queryForObject(
                "SELECT "
                        + "COUNT(*) FILTER (WHERE paid_amount < due_amount) AS unpaid_due_count, "
                        + "COALESCE(SUM(GREATEST(due_amount - paid_amount, 0)), 0) AS remaining_amount, "
                        + "COUNT(*) FILTER (WHERE paid_amount >= due_amount) AS paid_due_count "
                        + "FROM (SELECT d.id, d.due_amount, COALESCE(SUM(p.amount), 0) AS paid_amount "
                        + "FROM dues d JOIN campaigns c ON c.id = d.campaign_id "
                        + "LEFT JOIN payments p ON p.due_id = d.id "
                        + "WHERE c.association_id = ? AND d.member_id = ? "
                        + "GROUP BY d.id, d.due_amount) due_totals",
                (resultSet, rowNumber) -> new DashboardStats(
                        resultSet.getInt("unpaid_due_count"),
                        resultSet.getLong("remaining_amount"),
                        resultSet.getInt("paid_due_count"),
                        0,
                        0),
                associationId,
                memberId);
        Long totalContributionAmount = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(c.amount), 0) FROM contributions c "
                        + "JOIN social_funds sf ON sf.id = c.social_fund_id "
                        + "WHERE sf.association_id = ? AND c.member_id = ?",
                Long.class,
                associationId,
                memberId);
        Integer contributedSocialFundCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(DISTINCT c.social_fund_id) FROM contributions c "
                        + "JOIN social_funds sf ON sf.id = c.social_fund_id "
                        + "WHERE sf.association_id = ? AND c.member_id = ?",
                Integer.class,
                associationId,
                memberId);
        return new DashboardStats(
                dueStats.unpaidDueCount(),
                dueStats.totalRemainingAmount(),
                dueStats.paidDueCount(),
                totalContributionAmount == null ? 0 : totalContributionAmount,
                contributedSocialFundCount == null ? 0 : contributedSocialFundCount);
    }

    private String filters(UUID associationId, UUID memberId, DueStatus status, List<Object> parameters) {
        StringBuilder filters = new StringBuilder("WHERE c.association_id = ? AND d.member_id = ?");
        parameters.add(associationId);
        parameters.add(memberId);
        if (status != null) {
            filters.append(" AND (CASE WHEN COALESCE((SELECT SUM(p2.amount) FROM payments p2 "
                    + "WHERE p2.due_id = d.id), 0) >= d.due_amount THEN 'PAID' "
                    + "WHEN c.end_date < CURRENT_DATE THEN 'OVERDUE' "
                    + "WHEN COALESCE((SELECT SUM(p2.amount) FROM payments p2 WHERE p2.due_id = d.id), 0) > 0 "
                    + "THEN 'PARTIALLY_PAID' ELSE 'DUE' END) = ?");
            parameters.add(status.getValue());
        }
        return filters.toString();
    }

    private static final RowMapper<Due> DUE_ROW_MAPPER = (resultSet, rowNumber) -> {
        long dueAmount = resultSet.getLong("due_amount");
        long paidAmount = resultSet.getLong("paid_amount");
        LocalDate endDate = resultSet.getObject("end_date", LocalDate.class);
        DueStatus status = paidAmount >= dueAmount
                ? DueStatus.PAID
                : endDate.isBefore(LocalDate.now())
                        ? DueStatus.OVERDUE
                        : paidAmount > 0 ? DueStatus.PARTIALLY_PAID : DueStatus.DUE;
        return new Due(
                resultSet.getObject("id", UUID.class),
                new PersonSummary(resultSet.getObject("member_id", UUID.class), displayName(
                        resultSet.getString("first_name"), resultSet.getString("last_name"),
                        resultSet.getString("preferred_name"))),
                new CampaignReference(
                        resultSet.getObject("campaign_id", UUID.class), resultSet.getString("campaign_name"),
                        resultSet.getObject("start_date", LocalDate.class), endDate,
                        CampaignStatus.fromValue(resultSet.getString("campaign_status"))),
                new IncomeCategorySummary(
                        resultSet.getObject("income_category_id", UUID.class),
                        resultSet.getString("income_category_label_snapshot")),
                dueAmount,
                paidAmount,
                Math.max(0, dueAmount - paidAmount),
                status,
                resultSet.getInt("payment_count"),
                CurrencyCode.GNF);
    };

    private static String displayName(String firstName, String lastName, String preferredName) {
        return preferredName == null || preferredName.isBlank()
                ? firstName + " " + lastName
                : preferredName + " " + lastName;
    }
}
