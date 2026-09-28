package com.habdiallo.contribo.application.auth;

import java.util.Optional;
import java.util.UUID;

public interface AuthenticationAccountPort {

    Optional<AuthenticatedAccount> findByIdentifier(String identifier);

    Optional<AuthenticatedAccount> findById(UUID userId);
}
