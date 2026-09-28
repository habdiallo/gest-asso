package com.habdiallo.contribo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.security.KeyPair;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.habdiallo.contribo.security.JwtTokenService;

class JwtTokenServiceTest {

    @Test
    void issuedTokenContainsTheAuthenticatedUser() {
        KeyPair keyPair = TestRsaKeyMaterial.generate();
        JwtTokenService tokenService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) keyPair.getPublic(),
                (java.security.interfaces.RSAPrivateKey) keyPair.getPrivate(), 3600);
        UUID userId = UUID.randomUUID();

        assertThat(tokenService.parseUserId(tokenService.issue(userId))).isEqualTo(userId);
    }

    @Test
    void rejectsTokenSignedByAnotherKey() {
        KeyPair trustedKeys = TestRsaKeyMaterial.generate();
        KeyPair otherKeys = TestRsaKeyMaterial.generate();
        JwtTokenService trustedService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) trustedKeys.getPublic(),
                (java.security.interfaces.RSAPrivateKey) trustedKeys.getPrivate(), 3600);
        JwtTokenService otherService = new JwtTokenService(
                (java.security.interfaces.RSAPublicKey) otherKeys.getPublic(),
                (java.security.interfaces.RSAPrivateKey) otherKeys.getPrivate(), 3600);

        assertThatThrownBy(() -> trustedService.parseUserId(otherService.issue(UUID.randomUUID())))
                .isInstanceOf(com.habdiallo.contribo.security.InvalidTokenException.class);
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
                .isInstanceOf(com.habdiallo.contribo.security.InvalidTokenException.class));
    }
}
