package com.habdiallo.contribo.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class SecurityAuditLogger {

    private static final Logger LOGGER = LoggerFactory.getLogger("contribo.security.audit");

    public void loginSuccess(String identifier, String clientAddress, String userId) {
        event("login_success", "success", identifier, clientAddress, userId);
    }

    public void loginFailure(String identifier, String clientAddress) {
        event("login_failure", "failure", identifier, clientAddress, null);
    }

    public void rateLimited(String identifier, String clientAddress) {
        event("rate_limited", "denied", identifier, clientAddress, null);
    }

    public void invalidToken(String clientAddress) {
        LOGGER.warn("security_event type=invalid_token outcome=denied clientHash={}", hash(clientAddress));
    }

    public void authorizationDenied(String clientAddress, String userId) {
        LOGGER.warn("security_event type=authorization_denied outcome=denied clientHash={} userId={}",
                hash(clientAddress), userId == null ? "unknown" : userId);
    }

    private void event(
            String type,
            String outcome,
            String identifier,
            String clientAddress,
            String userId) {
        LOGGER.info(
                "security_event type={} outcome={} identifierHash={} clientHash={} userId={}",
                type,
                outcome,
                hash(identifier),
                hash(clientAddress),
                userId == null ? "unknown" : userId);
    }

    private String hash(String value) {
        if (value == null) {
            return "unknown";
        }
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte item : digest) {
                result.append(String.format("%02x", item));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
