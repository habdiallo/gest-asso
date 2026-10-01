package com.habdiallo.contribo.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

@ExtendWith(OutputCaptureExtension.class)
class SecurityAuditLoggerTest {

    @Test
    void hashesIdentifiersAndAddressesInsteadOfLoggingRawValues(CapturedOutput output) {
        SecurityAuditLogger logger = new SecurityAuditLogger();

        logger.loginFailure("user@example.test", "198.51.100.10");
        logger.invalidToken("198.51.100.10");

        assertThat(output).doesNotContain("user@example.test");
        assertThat(output).doesNotContain("198.51.100.10");
        assertThat(output).contains("security_event");
    }
}
