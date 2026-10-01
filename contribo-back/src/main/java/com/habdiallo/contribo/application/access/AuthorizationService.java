package com.habdiallo.contribo.application.access;

import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.habdiallo.contribo.application.auth.AuthenticationAccountPort;
import com.habdiallo.contribo.application.auth.InvalidCredentialsException;
import com.habdiallo.contribo.domain.access.UserRole;
import com.habdiallo.contribo.domain.auth.AuthenticatedAccount;

@Service
public class AuthorizationService {

    private final AuthenticationAccountPort accountPort;

    public AuthorizationService(AuthenticationAccountPort accountPort) {
        this.accountPort = accountPort;
    }

    public AuthenticatedAccount requireRole(UUID userId, UserRole... roles) {
        AuthenticatedAccount account = accountPort.findById(userId)
                .filter(AuthenticatedAccount::active)
                .orElseThrow(InvalidCredentialsException::new);
        Set<UserRole> allowedRoles = Set.of(roles);
        if (!allowedRoles.contains(UserRole.fromValue(account.role()))) {
            throw new AccessDeniedException();
        }
        return account;
    }

    public AuthenticatedAccount requireAuthenticated(UUID userId) {
        return accountPort.findById(userId)
                .filter(AuthenticatedAccount::active)
                .orElseThrow(InvalidCredentialsException::new);
    }
}
