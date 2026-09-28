package com.habdiallo.contribo.outbound.persistence.socialfund;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.application.common.PageResult;
import com.habdiallo.contribo.application.socialfund.SocialFundRepository;

@Repository
public class JdbcSocialFundRepository implements SocialFundRepository {

    private static final String FUND_SELECT = """
            SELECT sf.id, sf.association_id, sf.title, sf.event_type, sf.description, sf.beneficiary,
                   sf.start_date, sf.end_date, sf.status, sf.target_amount, a.currency,
                   COALESCE(SUM(c.amount), 0) AS collected_amount,
                   COUNT(c.id) AS contribution_count,
                   COUNT(DISTINCT CASE WHEN c.member_id IS NOT NULL THEN CAST(c.member_id AS VARCHAR)
                       ELSE UPPER(TRIM(c.external_first_name)) || ':' || UPPER(TRIM(c.external_last_name)) END)
                       AS contributor_count
              FROM social_funds sf
              JOIN associations a ON a.id = sf.association_id
              LEFT JOIN contributions c ON c.social_fund_id = sf.id
            """;

    private static final String CONTRIBUTION_SELECT = """
            SELECT c.id, c.member_id,
                   CASE WHEN m.id IS NULL THEN NULL
                        ELSE COALESCE(NULLIF(TRIM(m.preferred_name), ''), m.first_name) || ' ' || m.last_name END
                       AS member_display_name,
                   c.external_first_name, c.external_last_name,
                   sf.id AS social_fund_id, sf.title AS social_fund_title,
                   sf.event_type AS social_fund_event_type, sf.status AS social_fund_status,
                   c.amount, c.contribution_date, c.method, c.recorded_by, c.recorded_at,
                   COALESCE(NULLIF(TRIM(rm.preferred_name), ''), rm.first_name) || ' ' || rm.last_name
                       AS recorded_by_display_name,
                   a.currency
              FROM contributions c
              JOIN social_funds sf ON sf.id = c.social_fund_id
              JOIN associations a ON a.id = sf.association_id
              LEFT JOIN members m ON m.id = c.member_id
              JOIN user_accounts ru ON ru.id = c.recorded_by
              JOIN members rm ON rm.id = ru.member_id
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcSocialFundRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public PageResult<SocialFundData> findFunds(UUID associationId, int page, int size, String query,
            String status, String eventType) {
        List<Object> params = new ArrayList<>();
        String where = fundWhere(associationId, query, status, eventType, params);
        long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM social_funds sf WHERE " + where, Long.class, params.toArray());
        params.add(size);
        params.add(page * size);
        List<SocialFundData> items = jdbcTemplate.query(
                FUND_SELECT + " WHERE " + where
                        + " GROUP BY sf.id, sf.association_id, sf.title, sf.event_type, sf.description,"
                        + " sf.beneficiary, sf.start_date, sf.end_date, sf.status, sf.target_amount, a.currency"
                        + " ORDER BY sf.start_date DESC, sf.created_at DESC, sf.id DESC LIMIT ? OFFSET ?",
                params.toArray(), (resultSet, rowNumber) -> mapFund(resultSet));
        return new PageResult<>(items, page, size, total);
    }

    @Override
    public SocialFundData findFund(UUID associationId, UUID fundId) {
        List<Object> params = new ArrayList<>();
        String where = "sf.association_id = ? AND sf.id = ?";
        params.add(associationId);
        params.add(fundId);
        return jdbcTemplate.query(FUND_SELECT + " WHERE " + where
                + " GROUP BY sf.id, sf.association_id, sf.title, sf.event_type, sf.description,"
                + " sf.beneficiary, sf.start_date, sf.end_date, sf.status, sf.target_amount, a.currency",
                params.toArray(), rows -> rows.next() ? mapFund(rows) : null);
    }

    @Override
    public UUID createFund(UUID associationId, String title, String eventType, String description,
            String beneficiary, LocalDate startDate, LocalDate endDate, Long targetAmount) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update("""
                INSERT INTO social_funds
                    (id, association_id, title, event_type, description, beneficiary, start_date, end_date,
                     status, target_amount)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)
                """, id, associationId, title, eventType, description, beneficiary, startDate, endDate, targetAmount);
        return id;
    }

    @Override
    public void closeFund(UUID associationId, UUID fundId, UUID closedBy, OffsetDateTime closedAt) {
        jdbcTemplate.update("""
                UPDATE social_funds
                   SET status = 'CLOSED', closed_at = ?, closed_by = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE association_id = ? AND id = ?
                """, closedAt, closedBy, associationId, fundId);
    }

    @Override
    public PageResult<ContributionData> findContributions(UUID associationId, int page, int size, String query,
            UUID memberId, UUID socialFundId) {
        List<Object> params = new ArrayList<>();
        String where = contributionWhere(associationId, query, memberId, socialFundId, params);
        long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM contributions c JOIN social_funds sf ON sf.id = c.social_fund_id"
                        + " LEFT JOIN members m ON m.id = c.member_id WHERE " + where,
                Long.class, params.toArray());
        params.add(size);
        params.add(page * size);
        List<ContributionData> items = jdbcTemplate.query(
                CONTRIBUTION_SELECT + " WHERE " + where
                        + " ORDER BY c.recorded_at DESC, c.id DESC LIMIT ? OFFSET ?",
                params.toArray(), (resultSet, rowNumber) -> mapContribution(resultSet));
        return new PageResult<>(items, page, size, total);
    }

    @Override
    public ContributionData findContribution(UUID associationId, UUID contributionId) {
        List<Object> params = List.of(associationId, contributionId);
        return jdbcTemplate.query(CONTRIBUTION_SELECT
                + " WHERE sf.association_id = ? AND c.id = ?", params.toArray(), rows ->
                rows.next() ? mapContribution(rows) : null);
    }

    @Override
    public UUID createContribution(UUID associationId, UUID socialFundId, UUID memberId,
            String externalFirstName, String externalLastName, long amount, LocalDate contributionDate,
            String method, UUID recordedBy, OffsetDateTime recordedAt) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update("""
                INSERT INTO contributions
                    (id, social_fund_id, member_id, external_first_name, external_last_name, amount,
                     contribution_date, method, recorded_by, recorded_at)
                SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                 WHERE EXISTS (SELECT 1 FROM social_funds WHERE id = ? AND association_id = ?)
                """, id, socialFundId, memberId, externalFirstName, externalLastName, amount,
                contributionDate, method, recordedBy, recordedAt, socialFundId, associationId);
        return id;
    }

    @Override
    public boolean memberExists(UUID associationId, UUID memberId) {
        Boolean exists = jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM members WHERE association_id = ? AND id = ?)",
                Boolean.class, associationId, memberId);
        return Boolean.TRUE.equals(exists);
    }

    private String fundWhere(UUID associationId, String query, String status, String eventType,
            List<Object> params) {
        StringBuilder where = new StringBuilder("sf.association_id = ?");
        params.add(associationId);
        if (query != null && !query.isBlank()) {
            where.append(" AND (LOWER(sf.title) LIKE ? OR LOWER(sf.beneficiary) LIKE ? OR LOWER(COALESCE(sf.description, '')) LIKE ?)");
            String like = "%" + query.trim().toLowerCase() + "%";
            params.add(like);
            params.add(like);
            params.add(like);
        }
        if (status != null) {
            where.append(" AND sf.status = ?");
            params.add(status);
        }
        if (eventType != null) {
            where.append(" AND sf.event_type = ?");
            params.add(eventType);
        }
        return where.toString();
    }

    private String contributionWhere(UUID associationId, String query, UUID memberId, UUID socialFundId,
            List<Object> params) {
        StringBuilder where = new StringBuilder("sf.association_id = ?");
        params.add(associationId);
        if (query != null && !query.isBlank()) {
            where.append(" AND (LOWER(sf.title) LIKE ? OR LOWER(sf.beneficiary) LIKE ?"
                    + " OR LOWER(COALESCE(m.first_name, '')) LIKE ? OR LOWER(COALESCE(m.last_name, '')) LIKE ?"
                    + " OR LOWER(COALESCE(c.external_first_name, '')) LIKE ?"
                    + " OR LOWER(COALESCE(c.external_last_name, '')) LIKE ?)");
            String like = "%" + query.trim().toLowerCase() + "%";
            for (int i = 0; i < 6; i++) {
                params.add(like);
            }
        }
        if (memberId != null) {
            where.append(" AND c.member_id = ?");
            params.add(memberId);
        }
        if (socialFundId != null) {
            where.append(" AND c.social_fund_id = ?");
            params.add(socialFundId);
        }
        return where.toString();
    }

    private SocialFundData mapFund(ResultSet resultSet) throws SQLException {
        return new SocialFundData(
                resultSet.getObject("id", UUID.class), resultSet.getObject("association_id", UUID.class),
                resultSet.getString("title"), resultSet.getString("event_type"), resultSet.getString("description"),
                resultSet.getString("beneficiary"), resultSet.getObject("start_date", LocalDate.class),
                resultSet.getObject("end_date", LocalDate.class), resultSet.getString("status"),
                resultSet.getObject("target_amount", Long.class), resultSet.getLong("collected_amount"),
                resultSet.getInt("contributor_count"), resultSet.getInt("contribution_count"),
                resultSet.getString("currency"));
    }

    private ContributionData mapContribution(ResultSet resultSet) throws SQLException {
        return new ContributionData(
                resultSet.getObject("id", UUID.class), resultSet.getObject("member_id", UUID.class),
                resultSet.getString("member_display_name"), resultSet.getString("external_first_name"),
                resultSet.getString("external_last_name"), resultSet.getObject("social_fund_id", UUID.class),
                resultSet.getString("social_fund_title"), resultSet.getString("social_fund_event_type"),
                resultSet.getString("social_fund_status"), resultSet.getLong("amount"),
                resultSet.getObject("contribution_date", LocalDate.class), resultSet.getString("method"),
                resultSet.getObject("recorded_by", UUID.class), resultSet.getString("recorded_by_display_name"),
                readOffsetDateTime(resultSet, "recorded_at"), resultSet.getString("currency"));
    }

    private OffsetDateTime readOffsetDateTime(ResultSet resultSet, String column) throws SQLException {
        Object value = resultSet.getObject(column);
        if (value instanceof OffsetDateTime offsetDateTime) {
            return offsetDateTime;
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toInstant().atOffset(ZoneOffset.UTC);
        }
        throw new SQLException("Valeur temporelle absente pour " + column);
    }

}
