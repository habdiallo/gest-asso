package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.habdiallo.contribo.api.generated.EspacePersonnelApi;
import com.habdiallo.contribo.api.generated.model.ContributionPage;
import com.habdiallo.contribo.api.generated.model.CurrentUser;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.application.auth.AuthenticationService;
import com.habdiallo.contribo.application.socialfund.SocialFundService;

@RestController
public class CurrentUserController implements EspacePersonnelApi {

    private final AuthenticationService authenticationService;
    private final SocialFundService socialFundService;

    public CurrentUserController(AuthenticationService authenticationService, SocialFundService socialFundService) {
        this.authenticationService = authenticationService;
        this.socialFundService = socialFundService;
    }

    @Override
    public ResponseEntity<CurrentUser> getCurrentUser() {
        return ResponseEntity.ok(authenticationService.currentUser(currentUserId()));
    }

    @Override
    public ResponseEntity<ContributionPage> listMyContributions(Integer page, Integer size) {
        return ResponseEntity.ok(socialFundService.listMyContributions(currentUserId(), page, size));
    }

    @Override
    public ResponseEntity<DuePage> listMyDues(Integer page, Integer size, DueStatus status) {
        throw notImplemented();
    }

    private UUID currentUserId() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userId;
    }

    private ResponseStatusException notImplemented() {
        return new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Cette opération sera livrée par un ticket métier.");
    }
}
