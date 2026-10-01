package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RestController;

import com.habdiallo.contribo.api.generated.CagnottesApi;
import com.habdiallo.contribo.api.generated.model.CreateSocialFundRequest;
import com.habdiallo.contribo.api.generated.model.SocialEventType;
import com.habdiallo.contribo.api.generated.model.SocialFund;
import com.habdiallo.contribo.api.generated.model.SocialFundPage;
import com.habdiallo.contribo.api.generated.model.SocialFundStatus;
import com.habdiallo.contribo.application.socialfund.SocialFundService;

@RestController
public class SocialFundController implements CagnottesApi {

    private final SocialFundService service;

    public SocialFundController(SocialFundService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<SocialFund> closeSocialFund(UUID socialFundId) {
        return ResponseEntity.ok(service.closeFund(currentUserId(), socialFundId));
    }

    @Override
    public ResponseEntity<SocialFund> createSocialFund(CreateSocialFundRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createFund(currentUserId(), request));
    }

    @Override
    public ResponseEntity<SocialFund> getSocialFund(UUID socialFundId) {
        return ResponseEntity.ok(service.getFund(currentUserId(), socialFundId));
    }

    @Override
    public ResponseEntity<SocialFundPage> listSocialFunds(Integer page, Integer size, String q,
            SocialFundStatus status, SocialEventType eventType) {
        return ResponseEntity.ok(service.listFunds(currentUserId(), page, size, q, status, eventType));
    }

    private UUID currentUserId() {
        Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        return (UUID) authentication.getPrincipal();
    }
}
