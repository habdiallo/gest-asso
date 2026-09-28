package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class PersistenceMigrationTest {

    @Test
    void allMigrationsAreApplied(@Autowired DataSource dataSource) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);

        assertThat(jdbcTemplate.queryForObject(
                "select count(*) from \"flyway_schema_history\"",
                Integer.class)).isGreaterThanOrEqualTo(2);
        assertThat(jdbcTemplate.queryForObject(
                "select count(*) from information_schema.tables where table_schema = 'PUBLIC' and table_name = 'MEMBERS'",
                Integer.class)).isEqualTo(1);
    }
}
