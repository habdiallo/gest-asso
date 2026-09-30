package com.habdiallo.contribo.application.auth;

import java.util.Optional;
import java.util.UUID;

import com.habdiallo.contribo.domain.auth.AuthenticatedAccount;

public interface AuthenticationAccountPort {

    Optional<AuthenticatedAccount> findByIdentifier(String identifier);

    Optional<AuthenticatedAccount> findById(UUID userId);

    boolean updatePassword(UUID userId, String passwordHash);
}
