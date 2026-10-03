package com.habdiallo.contribo.outbound.persistence.members;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.application.members.MemberRepository;
import com.habdiallo.contribo.domain.member.MemberRecord;
import com.habdiallo.contribo.domain.member.MemberStatus;
import com.habdiallo.contribo.outbound.persistence.DbTime;

@Repository
public class JdbcMemberRepository implements MemberRepository {

    private static final String MEMBER_SELECT = """
            SELECT m.id, m.association_id, a.currency, m.first_name, m.last_name,
                   m.preferred_name, m.country, m.city, m.phone,
                   m.income_category_id, ic.label AS income_category_label,
                   m.association_function, m.status, m.updated_at,
                   ua.id AS account_id, ua.role AS account_role,
                   ua.operator_can_record_payments, ua.active AS account_active,
                   ua.must_change_password,
                   COALESCE((SELECT SUM(d.due_amount) FROM dues d WHERE d.member_id = m.id), 0)
                       AS total_due_amount,
                   COALESCE((SELECT SUM(p.amount) FROM payments p
                             JOIN dues pd ON pd.id = p.due_id
                             WHERE pd.member_id = m.id), 0) AS total_paid_amount
              FROM members m
              JOIN associations a ON a.id = m.association_id
              JOIN income_categories ic ON ic.id = m.income_category_id
              LEFT JOIN user_accounts ua ON ua.member_id = m.id
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcMemberRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<MemberRecord> findPage(
            UUID associationId, int page, int size, String query, MemberStatus status) {
        StringBuilder sql = new StringBuilder(MEMBER_SELECT)
                .append(" WHERE m.association_id = ?");
        List<Object> parameters = new java.util.ArrayList<>();
        parameters.add(associationId);
        appendFilters(sql, parameters, query, status);
        sql.append(" ORDER BY LOWER(m.last_name), LOWER(m.first_name), m.id LIMIT ? OFFSET ?");
        parameters.add(size);
        parameters.add((long) page * size);
        return jdbcTemplate.query(sql.toString(), this::map, parameters.toArray());
    }

    @Override
    public long count(UUID associationId, String query, MemberStatus status) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM members m")
                .append(" JOIN income_categories ic ON ic.id = m.income_category_id")
                .append(" WHERE m.association_id = ?");
        List<Object> parameters = new java.util.ArrayList<>();
        parameters.add(associationId);
        appendFilters(sql, parameters, query, status);
        return jdbcTemplate.queryForObject(sql.toString(), Long.class, parameters.toArray());
    }

    @Override
    public long countAll(UUID associationId) {
        return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM members WHERE association_id = ?", Long.class, associationId);
    }

    @Override
    public long countByStatus(UUID associationId, String status) {
        return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM members WHERE association_id = ? AND status = ?",
                Long.class, associationId, status);
    }

    @Override
    public long countCreatedSince(UUID associationId, OffsetDateTime from) {
        return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM members WHERE association_id = ? AND created_at >= ?",
                Long.class,
                associationId,
                from);
    }

    @Override
    public Optional<MemberRecord> findById(UUID associationId, UUID memberId) {
        return jdbcTemplate.query(
                MEMBER_SELECT + " WHERE m.association_id = ? AND m.id = ?",
                this::map,
                associationId,
                memberId).stream().findFirst();
    }

    @Override
    public boolean incomeCategoryExists(UUID associationId, UUID incomeCategoryId) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM income_categories WHERE association_id = ? AND id = ?)",
                Boolean.class,
                associationId,
                incomeCategoryId));
    }

    @Override
    public boolean identifierExists(UUID associationId, String identifier) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM user_accounts WHERE association_id = ? AND identifier = ?)",
                Boolean.class,
                associationId,
                identifier));
    }

    @Override
    public UUID create(UUID associationId, String firstName, String lastName, String preferredName,
            String country, String city, String phone, UUID incomeCategoryId, String associationFunction,
            String identifier, String passwordHash, boolean mustChangePassword) {
        UUID memberId = UUID.randomUUID();
        jdbcTemplate.update("""
                INSERT INTO members (id, association_id, first_name, last_name, preferred_name,
                    country, city, phone, income_category_id, association_function, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
                """,
                memberId, associationId, firstName, lastName, preferredName, country, city, phone,
                incomeCategoryId, associationFunction);
        jdbcTemplate.update("""
                INSERT INTO user_accounts (id, association_id, member_id, identifier, password_hash,
                    role, operator_can_record_payments, active, must_change_password)
                VALUES (?, ?, ?, ?, ?, 'MEMBER', FALSE, TRUE, ?)
                """,
                UUID.randomUUID(), associationId, memberId, identifier, passwordHash, mustChangePassword);
        return memberId;
    }

    @Override
    public void update(UUID associationId, UUID memberId, String firstName, String lastName,
            String preferredName, String country, String city, String phone, UUID incomeCategoryId,
            String associationFunction) {
        jdbcTemplate.update("""
                UPDATE members
                   SET first_name = ?,
                       last_name = ?,
                       preferred_name = ?,
                       country = ?,
                       city = ?,
                       phone = ?,
                       income_category_id = ?,
                       association_function = ?,
                       updated_at = CURRENT_TIMESTAMP
                 WHERE association_id = ? AND id = ?
                """,
                firstName, lastName, preferredName, country, city, phone, incomeCategoryId,
                associationFunction, associationId, memberId);
    }

    @Override
    public boolean updateStatus(UUID associationId, UUID memberId, String expectedStatus, String newStatus) {
        return jdbcTemplate.update("""
                UPDATE members SET status = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE association_id = ? AND id = ? AND status = ?
                """, newStatus, associationId, memberId, expectedStatus) == 1;
    }

    private void appendFilters(
            StringBuilder sql, List<Object> parameters, String query, MemberStatus status) {
        if (query != null && !query.isBlank()) {
            sql.append(" AND (LOWER(m.first_name) LIKE LOWER(?) OR LOWER(m.last_name) LIKE LOWER(?)"
                    + " OR LOWER(COALESCE(m.preferred_name, '')) LIKE LOWER(?)"
                    + " OR LOWER(COALESCE(m.city, '')) LIKE LOWER(?)"
                    + " OR LOWER(COALESCE(m.country, '')) LIKE LOWER(?)"
                    + " OR LOWER(COALESCE(m.phone, '')) LIKE LOWER(?)"
                    + " OR LOWER(COALESCE(m.association_function, '')) LIKE LOWER(?)"
                    + " OR LOWER(ic.label) LIKE LOWER(?))");
            String pattern = "%" + query.trim() + "%";
            parameters.add(pattern);
            parameters.add(pattern);
            parameters.add(pattern);
            parameters.add(pattern);
            parameters.add(pattern);
            parameters.add(pattern);
            parameters.add(pattern);
            parameters.add(pattern);
        }
        if (status != null) {
            sql.append(" AND m.status = ?");
            parameters.add(status.getValue());
        }
    }

    private MemberRecord map(ResultSet resultSet, int rowNumber) throws SQLException {
        return new MemberRecord(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("association_id", UUID.class),
                resultSet.getString("currency"),
                resultSet.getString("first_name"),
                resultSet.getString("last_name"),
                resultSet.getString("preferred_name"),
                resultSet.getString("country"),
                resultSet.getString("city"),
                resultSet.getString("phone"),
                resultSet.getObject("income_category_id", UUID.class),
                resultSet.getString("income_category_label"),
                resultSet.getString("association_function"),
                resultSet.getString("status"),
                resultSet.getObject("account_id", UUID.class),
                resultSet.getString("account_role"),
                resultSet.getBoolean("operator_can_record_payments"),
                resultSet.getBoolean("account_active"),
                resultSet.getBoolean("must_change_password"),
                resultSet.getLong("total_due_amount"),
                resultSet.getLong("total_paid_amount"),
                DbTime.offsetDateTime(resultSet, "updated_at"));
    }
}
