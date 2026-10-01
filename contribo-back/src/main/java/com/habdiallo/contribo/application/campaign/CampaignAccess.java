package com.habdiallo.contribo.application.campaign;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.habdiallo.contribo.api.rest.ApiErrors;
import com.habdiallo.contribo.application.access.AuthorizationService;
import com.habdiallo.contribo.domain.access.UserRole;
import com.habdiallo.contribo.domain.auth.AuthenticatedAccount;

@Component
public class CampaignAccess {

    private final AuthorizationService authorizationService;

    public CampaignAccess(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

    public AuthenticatedAccount currentUser(UUID actorId) {
        return authorizationService.requireAuthenticated(actorId);
    }

    public AuthenticatedAccount requireManagementRead(UUID actorId) {
        return authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER, UserRole.OPERATOR);
    }

    public AuthenticatedAccount requireCampaignWrite(UUID actorId) {
        return authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER);
    }

    public AuthenticatedAccount requirePaymentWrite(UUID actorId) {
        AuthenticatedAccount account = authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER, UserRole.OPERATOR);
        if ("ADMINISTRATOR".equals(account.role())
                || "TREASURER".equals(account.role())
                || account.operatorCanRecordPayments()) {
            return account;
        }
        throw ApiErrors.forbidden();
    }

    public boolean isManagement(AuthenticatedAccount account) {
        return "ADMINISTRATOR".equals(account.role())
                || "TREASURER".equals(account.role())
                || "OPERATOR".equals(account.role());
    }
}
