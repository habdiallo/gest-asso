package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.habdiallo.contribo.api.generated.ContributionsApi;
import com.habdiallo.contribo.api.generated.model.Contribution;
import com.habdiallo.contribo.api.generated.model.ContributionCreationResponse;
import com.habdiallo.contribo.api.generated.model.ContributionPage;
import com.habdiallo.contribo.api.generated.model.CreateContributionRequest;
import com.habdiallo.contribo.application.socialfund.SocialFundService;

@RestController
public class ContributionController implements ContributionsApi {

    private final SocialFundService service;

    public ContributionController(SocialFundService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<ContributionCreationResponse> createContribution(UUID socialFundId,
            @RequestBody CreateContributionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.createContribution(currentUserId(), socialFundId, request));
    }

    @Override
    public ResponseEntity<Contribution> getContribution(UUID contributionId) {
        return ResponseEntity.ok(service.getContribution(currentUserId(), contributionId));
    }

    @Override
    public ResponseEntity<ContributionPage> listContributions(Integer page, Integer size, String q,
            UUID memberId, UUID socialFundId) {
        return ResponseEntity.ok(service.listContributions(currentUserId(), page, size, q, memberId, socialFundId));
    }

    @Override
    public ResponseEntity<ContributionPage> listSocialFundContributions(UUID socialFundId, Integer page,
            Integer size, String q) {
        return ResponseEntity.ok(service.listFundContributions(currentUserId(), socialFundId, page, size, q));
    }

    private UUID currentUserId() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        return (UUID) authentication.getPrincipal();
    }
}
