package com.habdiallo.contribo.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.UUID;
import java.util.Set;

import org.springframework.stereotype.Component;

@Component
public class RevokedTokenRegistry {

    private final ConcurrentHashMap<String, Instant> revoked = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<UUID, Set<String>> tokensByUser = new ConcurrentHashMap<>();

    public void register(UUID userId, String token, Instant expiresAt) {
        tokensByUser.computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet()).add(token);
    }

    public synchronized void revoke(String token, Instant expiresAt) {
        Instant now = Instant.now();
        revoked.entrySet().removeIf(entry -> entry.getValue().isBefore(now));
        revoked.put(token, expiresAt);
    }

    public synchronized void revokeUser(UUID userId) {
        Set<String> tokens = tokensByUser.remove(userId);
        if (tokens != null) {
            Instant expiresAt = Instant.now().plusSeconds(1);
            tokens.forEach(token -> revoked.put(token, expiresAt));
        }
    }

    public boolean isRevoked(String token) {
        Instant expiresAt = revoked.get(token);
        if (expiresAt == null) {
            return false;
        }
        if (expiresAt.isBefore(Instant.now())) {
            revoked.remove(token, expiresAt);
            return false;
        }
        return true;
    }
}
