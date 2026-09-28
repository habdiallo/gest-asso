package com.habdiallo.contribo.outbound.persistence.categories;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.application.categories.IncomeCategoryRecord;
import com.habdiallo.contribo.application.categories.IncomeCategoryRepository;
import com.habdiallo.contribo.outbound.persistence.DbTime;

@Repository
public class JdbcIncomeCategoryRepository implements IncomeCategoryRepository {

    private static final String CATEGORY_SELECT = """
            SELECT ic.id, ic.label, ic.updated_at, COUNT(m.id) AS member_count
              FROM income_categories ic
              LEFT JOIN members m ON m.income_category_id = ic.id
                AND m.association_id = ic.association_id
            """;

    private final JdbcTemplate jdbcTemplate;

    public JdbcIncomeCategoryRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public List<IncomeCategoryRecord> findAll(UUID associationId) {
        return jdbcTemplate.query(
                CATEGORY_SELECT + " WHERE ic.association_id = ? GROUP BY ic.id, ic.label, ic.updated_at"
                        + " ORDER BY LOWER(ic.label), ic.id",
                this::map,
                associationId);
    }

    @Override
    public Optional<IncomeCategoryRecord> findById(UUID associationId, UUID categoryId) {
        return jdbcTemplate.query(
                CATEGORY_SELECT + " WHERE ic.association_id = ? AND ic.id = ?"
                        + " GROUP BY ic.id, ic.label, ic.updated_at",
                this::map,
                associationId,
                categoryId).stream().findFirst();
    }

    @Override
    public boolean existsByLabel(UUID associationId, String label, UUID excludedId) {
        String sql = "SELECT EXISTS (SELECT 1 FROM income_categories"
                + " WHERE association_id = ? AND LOWER(label) = LOWER(?)";
        if (excludedId != null) {
            sql += " AND id <> ?";
            return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                    sql + ")", Boolean.class, associationId, label, excludedId));
        }
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                sql + ")", Boolean.class, associationId, label));
    }

    @Override
    public UUID create(UUID associationId, String label) {
        UUID id = UUID.randomUUID();
        jdbcTemplate.update("""
                INSERT INTO income_categories (id, association_id, label)
                VALUES (?, ?, ?)
                """, id, associationId, label);
        return id;
    }

    @Override
    public void update(UUID associationId, UUID categoryId, String label) {
        jdbcTemplate.update("""
                UPDATE income_categories
                   SET label = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE association_id = ? AND id = ?
                """, label, associationId, categoryId);
    }

    private IncomeCategoryRecord map(ResultSet resultSet, int rowNumber) throws SQLException {
        return new IncomeCategoryRecord(
                resultSet.getObject("id", UUID.class),
                resultSet.getString("label"),
                resultSet.getInt("member_count"),
                DbTime.offsetDateTime(resultSet, "updated_at"));
    }
}
