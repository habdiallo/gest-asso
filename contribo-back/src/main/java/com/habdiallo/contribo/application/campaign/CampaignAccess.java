package com.habdiallo.contribo.application.campaign;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.habdiallo.contribo.api.rest.ApiErrors;
import com.habdiallo.contribo.application.auth.AuthenticatedAccount;
import com.habdiallo.contribo.application.auth.AuthenticationAccountPort;

@Component
public class CampaignAccess {

    private final AuthenticationAccountPort accounts;

    public CampaignAccess(AuthenticationAccountPort accounts) {
        this.accounts = accounts;
    }

    public AuthenticatedAccount currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw ApiErrors.forbidden();
        }
        return accounts.findById(userId)
                .filter(AuthenticatedAccount::active)
                .orElseThrow(ApiErrors::forbidden);
    }

    public AuthenticatedAccount requireManagementRead() {
        AuthenticatedAccount account = currentUser();
        if (isManagement(account)) {
            return account;
        }
        throw ApiErrors.forbidden();
    }

    public AuthenticatedAccount requireCampaignWrite() {
        AuthenticatedAccount account = currentUser();
        if ("ADMINISTRATOR".equals(account.role()) || "TREASURER".equals(account.role())) {
            return account;
        }
        throw ApiErrors.forbidden();
    }

    public AuthenticatedAccount requirePaymentWrite() {
        AuthenticatedAccount account = currentUser();
        if ("ADMINISTRATOR".equals(account.role())
                || "TREASURER".equals(account.role())
                || ("OPERATOR".equals(account.role()) && account.operatorCanRecordPayments())) {
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
