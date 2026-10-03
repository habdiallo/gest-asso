package com.habdiallo.contribo.security;

final class SessionDurationPolicy {

    static final long MAX_EXPIRATION_SECONDS = 1_800;

    private SessionDurationPolicy() {
    }

    static long validate(long expirationSeconds) {
        if (expirationSeconds < 1 || expirationSeconds > MAX_EXPIRATION_SECONDS) {
            throw new IllegalArgumentException(
                    "Session expiration must be between 1 and 1800 seconds");
        }
        return expirationSeconds;
    }
}
