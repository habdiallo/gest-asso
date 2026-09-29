package com.habdiallo.contribo.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class RevokedTokenRegistry {

    private final ConcurrentHashMap<String, Instant> revoked = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<UUID, ConcurrentHashMap<String, Instant>> tokensByUser =
            new ConcurrentHashMap<>();

    public synchronized void register(UUID userId, String token, Instant expiresAt) {
        Instant now = Instant.now();
        purgeRevokedExpiredTokens(now);
        purgeTrackedExpiredTokens(now);
        tokensByUser.computeIfAbsent(userId, ignored -> new ConcurrentHashMap<>()).put(token, expiresAt);
    }

    public synchronized void revoke(String token, Instant expiresAt) {
        Instant now = Instant.now();
        purgeRevokedExpiredTokens(now);
        removeTrackedToken(token);
        revoked.put(token, expiresAt);
    }

    public synchronized void revokeUser(UUID userId) {
        Instant now = Instant.now();
        purgeRevokedExpiredTokens(now);
        purgeTrackedExpiredTokens(now);
        Map<String, Instant> tokens = tokensByUser.remove(userId);
        if (tokens != null) {
            Instant expiresAt = now.plusSeconds(1);
            tokens.keySet().forEach(token -> revoked.put(token, expiresAt));
        }
    }

    public synchronized boolean isRevoked(String token) {
        purgeRevokedExpiredTokens(Instant.now());
        purgeTrackedExpiredTokens(Instant.now());
        Instant expiresAt = revoked.get(token);
        if (expiresAt == null) {
            return false;
        }
        return true;
    }

    private void purgeRevokedExpiredTokens(Instant now) {
        revoked.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
    }

    private void purgeTrackedExpiredTokens(Instant now) {
        tokensByUser.entrySet().removeIf(userEntry -> {
            userEntry.getValue().entrySet().removeIf(tokenEntry -> tokenEntry.getValue().isBefore(now));
            return userEntry.getValue().isEmpty();
        });
    }

    private void removeTrackedToken(String token) {
        tokensByUser.entrySet().removeIf(userEntry -> {
            userEntry.getValue().remove(token);
            return userEntry.getValue().isEmpty();
        });
    }
}
