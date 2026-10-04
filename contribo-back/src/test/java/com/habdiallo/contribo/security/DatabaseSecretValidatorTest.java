package com.habdiallo.contribo.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.zaxxer.hikari.HikariConfig;
import org.junit.jupiter.api.Test;

class DatabaseSecretValidatorTest {

    private final DatabaseSecretValidator validator = new DatabaseSecretValidator();

    @Test
    void rejectsADataSourceWithoutPassword() {
        HikariConfig dataSource = new HikariConfig();

        assertThatThrownBy(() -> validator.postProcessAfterInitialization(dataSource, "dataSource"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("db_password");
    }

    @Test
    void rejectsABlankPasswordWithoutRevealingIt() {
        HikariConfig dataSource = new HikariConfig();
        dataSource.setPassword("   ");

        assertThatThrownBy(() -> validator.postProcessAfterInitialization(dataSource, "dataSource"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(DatabaseSecretValidator.MISSING_SECRET_MESSAGE);
    }

    @Test
    void acceptsAConfiguredPasswordAndIgnoresOtherBeans() {
        HikariConfig dataSource = new HikariConfig();
        dataSource.setPassword("s3cret");

        assertThat(validator.postProcessAfterInitialization(dataSource, "dataSource")).isSameAs(dataSource);
        assertThat(validator.postProcessAfterInitialization("other", "other")).isEqualTo("other");
    }
}
