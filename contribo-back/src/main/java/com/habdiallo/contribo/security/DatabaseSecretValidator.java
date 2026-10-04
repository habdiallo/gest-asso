package com.habdiallo.contribo.security;

import com.zaxxer.hikari.HikariConfig;

import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.stereotype.Component;

/** Fails before Flyway or any request when the PostgreSQL secret is missing or empty. */
@Component
public class DatabaseSecretValidator implements BeanPostProcessor {

    static final String MISSING_SECRET_MESSAGE =
            "Le secret PostgreSQL est absent ou vide : fournir DB_PASSWORD ou le fichier db_password "
                    + "dans le répertoire de secrets.";

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) {
        if (bean instanceof HikariConfig dataSource) {
            String password = dataSource.getPassword();
            if (password == null || password.isBlank()) {
                throw new IllegalStateException(MISSING_SECRET_MESSAGE);
            }
        }
        return bean;
    }
}
