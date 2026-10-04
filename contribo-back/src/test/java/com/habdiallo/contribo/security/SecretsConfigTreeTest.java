package com.habdiallo.contribo.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assumptions.assumeThat;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.env.ConfigTreePropertySource;
import org.springframework.boot.env.ConfigTreePropertySource.Option;

/** Documents how the mounted secrets directory is read by spring.config.import=configtree. */
class SecretsConfigTreeTest {

    @TempDir
    Path secretsDirectory;

    @Test
    void readsASecretFileAndTrimsItsTrailingNewLine() throws Exception {
        Files.writeString(secretsDirectory.resolve("db_password"), "s3cret\n");

        ConfigTreePropertySource source = new ConfigTreePropertySource(
                "secrets", secretsDirectory, Option.AUTO_TRIM_TRAILING_NEW_LINE);

        assertThat(String.valueOf(source.getProperty("db_password"))).isEqualTo("s3cret");
        assertThat(source.getProperty("bootstrap_admin_password")).isNull();
    }

    @Test
    void failsExplicitlyWhenASecretFileIsUnreadable() throws Exception {
        Path secret = secretsDirectory.resolve("db_password");
        Files.writeString(secret, "s3cret");
        Files.setPosixFilePermissions(secret, PosixFilePermissions.fromString("---------"));
        assumeThat(Files.isReadable(secret)).as("test non applicable sous root").isFalse();

        assertThatThrownBy(() -> new ConfigTreePropertySource(
                "secrets", secretsDirectory, Option.AUTO_TRIM_TRAILING_NEW_LINE).getProperty("db_password").toString())
                .hasStackTraceContaining("db_password")
                .satisfies(error -> assertThat(stackTraceOf(error)).doesNotContain("s3cret"));
    }

    private static String stackTraceOf(Throwable error) {
        StringWriter writer = new StringWriter();
        error.printStackTrace(new PrintWriter(writer));
        return writer.toString();
    }
}
