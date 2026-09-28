package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest
class PersistenceMigrationTest {

    @Test
    void allMigrationsAreApplied(@Autowired DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .load();
        flyway.migrate();

        assertThat(flyway.info().applied()).hasSize(2);
        assertThat(new JdbcTemplate(dataSource).queryForObject(
                "select count(*) from information_schema.tables where table_schema = 'PUBLIC' and table_name = 'MEMBERS'",
                Integer.class)).isEqualTo(1);
    }
}
