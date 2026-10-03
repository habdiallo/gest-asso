package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.KeyPair;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.habdiallo.contribo.security.InvalidTokenException;
import com.habdiallo.contribo.security.JwtTokenService;

class JwtTokenServiceTest {

    @Test
    void issuedTokenContainsTheAuthenticatedUser() {
        KeyPair keyPair = TestRsaKeyMaterial.generate();
        JwtTokenService tokenService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) keyPair.getPublic(),
                (java.security.interfaces.RSAPrivateKey) keyPair.getPrivate(), 900);
        UUID userId = UUID.randomUUID();

        assertThat(tokenService.parseUserId(tokenService.issue(userId))).isEqualTo(userId);
    }

    @Test
    void rejectsTokenSignedByAnotherKey() {
        KeyPair trustedKeys = TestRsaKeyMaterial.generate();
        KeyPair otherKeys = TestRsaKeyMaterial.generate();
        JwtTokenService trustedService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) trustedKeys.getPublic(),
                (java.security.interfaces.RSAPrivateKey) trustedKeys.getPrivate(), 900);
        JwtTokenService otherService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) otherKeys.getPublic(),
                (java.security.interfaces.RSAPrivateKey) otherKeys.getPrivate(), 900);

        assertThatThrownBy(() -> trustedService.parseUserId(otherService.issue(UUID.randomUUID())))
                .isInstanceOf(InvalidTokenException.class);
    }

    @Test
    void rejectsExpiredToken() {
        KeyPair keyPair = TestRsaKeyMaterial.generate();
        JwtTokenService tokenService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) keyPair.getPublic(),
                (java.security.interfaces.RSAPrivateKey) keyPair.getPrivate(), 1);
        String token = tokenService.issue(UUID.randomUUID());

        org.awaitility.Awaitility.await().atMost(java.time.Duration.ofSeconds(3))
                .untilAsserted(() -> assertThatThrownBy(() -> tokenService.parseUserId(token))
                        .isInstanceOf(InvalidTokenException.class));
    }

    @Test
    void acceptsTheThirtyMinuteSessionLimit() {
        KeyPair keyPair = TestRsaKeyMaterial.generate();
        JwtTokenService tokenService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) keyPair.getPublic(),
                (java.security.interfaces.RSAPrivateKey) keyPair.getPrivate(),
                1_800);

        assertThat(tokenService.expirationSeconds()).isEqualTo(1_800);
    }

    @Test
    void rejectsSessionDurationsAboveThirtyMinutes() {
        KeyPair keyPair = TestRsaKeyMaterial.generate();

        assertThatThrownBy(() -> new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) keyPair.getPublic(),
                (java.security.interfaces.RSAPrivateKey) keyPair.getPrivate(),
                1_801))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Session expiration must be between 1 and 1800 seconds");
    }
}
