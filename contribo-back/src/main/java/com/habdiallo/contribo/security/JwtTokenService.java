package com.habdiallo.contribo.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private static final long MAX_EXPIRATION_SECONDS = 900;

    private final SecretKey key;
    private final long expirationSeconds;

    public JwtTokenService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-seconds}") long expirationSeconds) {
        if (expirationSeconds < 1 || expirationSeconds > MAX_EXPIRATION_SECONDS) {
            throw new IllegalArgumentException("JWT expiration must be between 1 and 900 seconds");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
    }

    public String issue(UUID userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(key)
                .compact();
    }

    public UUID parseUserId(String token) {
        try {
            return UUID.fromString(parseClaims(token).getPayload().getSubject());
        } catch (JwtException | IllegalArgumentException exception) {
            throw new InvalidTokenException(exception);
        }
    }

    public Instant parseExpiration(String token) {
        try {
            return parseClaims(token).getPayload().getExpiration().toInstant();
        } catch (JwtException | IllegalArgumentException exception) {
            throw new InvalidTokenException(exception);
        }
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
    }

    public int expirationSeconds() {
        return Math.toIntExact(expirationSeconds);
    }
}
