package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.habdiallo.contribo.api.generated.UtilisateursEtRolesApi;
import com.habdiallo.contribo.api.generated.model.UpdateUserAccessRequest;
import com.habdiallo.contribo.api.generated.model.UserAccount;
import com.habdiallo.contribo.api.generated.model.UserAccountPage;
import com.habdiallo.contribo.api.generated.model.UserRole;
import com.habdiallo.contribo.api.generated.model.TemporaryCredentials;
import com.habdiallo.contribo.application.access.CurrentUserId;
import com.habdiallo.contribo.application.users.UserAccountService;

@RestController
public class UserAccountController implements UtilisateursEtRolesApi {

    private final UserAccountService userAccountService;

    public UserAccountController(UserAccountService userAccountService) {
        this.userAccountService = userAccountService;
    }

    @Override
    public ResponseEntity<UserAccount> getUser(UUID userId) {
        return ResponseEntity.ok(userAccountService.get(CurrentUserId.get(), userId));
    }

    @Override
    public ResponseEntity<UserAccountPage> listUsers(
            Integer page, Integer size, String query, UserRole role) {
        return ResponseEntity.ok(
                userAccountService.list(CurrentUserId.get(), page, size, query, role));
    }

    @Override
    public ResponseEntity<UserAccount> updateUserAccess(
            UUID userId, UpdateUserAccessRequest request) {
        return ResponseEntity.ok(
                userAccountService.updateAccess(CurrentUserId.get(), userId, request));
    }

    @Override
    public ResponseEntity<TemporaryCredentials> resetUserCredentials(UUID userId) {
        return ResponseEntity.ok(
                userAccountService.resetCredentials(CurrentUserId.get(), userId));
    }
}
