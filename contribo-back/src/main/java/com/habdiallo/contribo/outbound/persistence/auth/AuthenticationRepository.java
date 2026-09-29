package com.habdiallo.contribo.outbound.persistence.auth;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.application.auth.AuthenticatedAccount;
import com.habdiallo.contribo.application.auth.AuthenticationAccountPort;

@Repository
public class AuthenticationRepository implements AuthenticationAccountPort {

    private static final String ACCOUNT_QUERY = """
            SELECT ua.id AS user_id, ua.password_hash, ua.active, ua.role,
                   ua.operator_can_record_payments, ua.must_change_password,
                   a.id AS association_id,
                   a.name AS association_name, a.currency, m.id AS member_id,
                   m.first_name, m.last_name, m.preferred_name, m.country,
                   m.city, m.phone, m.association_function, m.status AS member_status,
                   ic.id AS income_category_id, ic.label AS income_category_label
              FROM user_accounts ua
              JOIN associations a ON a.id = ua.association_id
              JOIN members m ON m.id = ua.member_id
              JOIN income_categories ic ON ic.id = m.income_category_id
             WHERE ua.identifier = ?
               AND ua.association_id = m.association_id
            """;

    private static final String ACCOUNT_BY_ID_QUERY = ACCOUNT_QUERY.replace(
            "WHERE ua.identifier = ?", "WHERE ua.id = ?");

    private final JdbcTemplate jdbcTemplate;

    public AuthenticationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<AuthenticatedAccount> findByIdentifier(String identifier) {
        return queryOne(ACCOUNT_QUERY, identifier);
    }

    @Override
    public Optional<AuthenticatedAccount> findById(UUID userId) {
        return queryOne(ACCOUNT_BY_ID_QUERY, userId);
    }

    private Optional<AuthenticatedAccount> queryOne(String sql, Object parameter) {
        return jdbcTemplate.query(sql, statement -> statement.setObject(1, parameter), resultSet ->
                resultSet.next() ? Optional.of(map(resultSet)) : Optional.empty());
    }

    private AuthenticatedAccount map(ResultSet resultSet) throws SQLException {
        return new AuthenticatedAccount(
                resultSet.getObject("user_id", UUID.class),
                resultSet.getString("password_hash"),
                resultSet.getBoolean("active"),
                resultSet.getObject("association_id", UUID.class),
                resultSet.getString("association_name"),
                resultSet.getString("currency"),
                resultSet.getObject("member_id", UUID.class),
                resultSet.getString("first_name"),
                resultSet.getString("last_name"),
                resultSet.getString("preferred_name"),
                resultSet.getString("country"),
                resultSet.getString("city"),
                resultSet.getString("phone"),
                resultSet.getString("association_function"),
                resultSet.getString("member_status"),
                resultSet.getObject("income_category_id", UUID.class),
                resultSet.getString("income_category_label"),
                resultSet.getString("role"),
                resultSet.getBoolean("operator_can_record_payments"),
                resultSet.getBoolean("must_change_password"));
    }

    @Override
    public boolean updatePassword(UUID userId, String passwordHash) {
        return jdbcTemplate.update("""
                UPDATE user_accounts
                   SET password_hash = ?, must_change_password = FALSE,
                       password_changed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND active = TRUE
                """, passwordHash, userId) == 1;
    }
}
