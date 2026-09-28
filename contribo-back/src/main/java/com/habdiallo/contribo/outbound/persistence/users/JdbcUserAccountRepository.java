package com.habdiallo.contribo.outbound.persistence.users;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.api.generated.model.UserRole;
import com.habdiallo.contribo.application.users.UserAccountRecord;
import com.habdiallo.contribo.application.users.UserAccountRepository;

@Repository
public class JdbcUserAccountRepository implements UserAccountRepository {

    private static final String ACCOUNT_SELECT = """
            SELECT ua.id, ua.member_id, m.first_name, m.last_name, ua.role,
                   ua.operator_can_record_payments, ua.active
              FROM user_accounts ua
              JOIN members m ON m.id = ua.member_id
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcUserAccountRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<UserAccountRecord> findPage(
            UUID associationId, int page, int size, String query, UserRole role) {
        StringBuilder sql = new StringBuilder(ACCOUNT_SELECT)
                .append(" WHERE ua.association_id = ?");
        java.util.ArrayList<Object> parameters = new java.util.ArrayList<>();
        parameters.add(associationId);
        appendFilters(sql, parameters, query, role);
        sql.append(" ORDER BY LOWER(m.last_name), LOWER(m.first_name), ua.id LIMIT ? OFFSET ?");
        parameters.add(size);
        parameters.add((long) page * size);
        return jdbcTemplate.query(sql.toString(), this::map, parameters.toArray());
    }

    @Override
    public long count(UUID associationId, String query, UserRole role) {
        StringBuilder sql = new StringBuilder(
                "SELECT COUNT(*) FROM user_accounts ua JOIN members m ON m.id = ua.member_id")
                .append(" WHERE ua.association_id = ?");
        java.util.ArrayList<Object> parameters = new java.util.ArrayList<>();
        parameters.add(associationId);
        appendFilters(sql, parameters, query, role);
        return jdbcTemplate.queryForObject(sql.toString(), Long.class, parameters.toArray());
    }

    @Override
    public Optional<UserAccountRecord> findById(UUID associationId, UUID userId) {
        return jdbcTemplate.query(
                ACCOUNT_SELECT + " WHERE ua.association_id = ? AND ua.id = ?",
                this::map,
                associationId,
                userId).stream().findFirst();
    }

    @Override
    public boolean updateAccess(UUID associationId, UUID userId, String role, boolean operatorCanRecordPayments) {
        return jdbcTemplate.update("""
                UPDATE user_accounts
                   SET role = ?, operator_can_record_payments = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE association_id = ? AND id = ?
                """, role, operatorCanRecordPayments, associationId, userId) == 1;
    }

    private void appendFilters(
            StringBuilder sql, List<Object> parameters, String query, UserRole role) {
        if (query != null && !query.isBlank()) {
            sql.append(" AND (LOWER(m.first_name) LIKE LOWER(?) OR LOWER(m.last_name) LIKE LOWER(?))");
            String pattern = "%" + query.trim() + "%";
            parameters.add(pattern);
            parameters.add(pattern);
        }
        if (role != null) {
            sql.append(" AND ua.role = ?");
            parameters.add(role.getValue());
        }
    }

    private UserAccountRecord map(ResultSet resultSet, int rowNumber) throws SQLException {
        return new UserAccountRecord(
                resultSet.getObject("id", UUID.class),
                resultSet.getObject("member_id", UUID.class),
                resultSet.getString("first_name"),
                resultSet.getString("last_name"),
                resultSet.getString("role"),
                resultSet.getBoolean("operator_can_record_payments"),
                resultSet.getBoolean("active"));
    }
}
