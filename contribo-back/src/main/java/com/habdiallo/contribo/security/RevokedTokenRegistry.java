package com.habdiallo.contribo.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

@Component
public class RevokedTokenRegistry {

    private final ConcurrentHashMap<String, Instant> revoked = new ConcurrentHashMap<>();

    public void revoke(String token, Instant expiresAt) {
        revoked.put(token, expiresAt);
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
