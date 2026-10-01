package com.habdiallo.contribo.security;

public class RateLimitExceededException extends RuntimeException {

    public RateLimitExceededException() {
        super("Trop de tentatives. Réessayez plus tard.");
    }
}
