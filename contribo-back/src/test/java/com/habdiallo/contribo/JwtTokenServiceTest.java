package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.habdiallo.contribo.security.JwtTokenService;

class JwtTokenServiceTest {

    @Test
    void issuedTokenContainsTheAuthenticatedUser() {
        JwtTokenService tokenService = new JwtTokenService(
                "contribo-test-secret-change-me-32-bytes", 3600);
        UUID userId = UUID.randomUUID();

        assertThat(tokenService.parseUserId(tokenService.issue(userId))).isEqualTo(userId);
    }
}
