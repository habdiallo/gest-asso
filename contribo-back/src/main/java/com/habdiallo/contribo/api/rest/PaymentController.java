package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.habdiallo.contribo.api.generated.RglementsApi;
import com.habdiallo.contribo.api.generated.model.CreatePaymentRequest;
import com.habdiallo.contribo.api.generated.model.PaymentCreationResponse;
import com.habdiallo.contribo.api.generated.model.PaymentPage;
import com.habdiallo.contribo.application.access.CurrentUserId;
import com.habdiallo.contribo.application.campaign.CampaignService;

@RestController
public class PaymentController implements RglementsApi {

    private final CampaignService service;

    public PaymentController(CampaignService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<PaymentCreationResponse> createPayment(UUID dueId, CreatePaymentRequest request) {
        return ResponseEntity.status(201).body(service.createPayment(CurrentUserId.get(), dueId, request));
    }

    @Override
    public ResponseEntity<PaymentPage> listPayments(
            Integer page, Integer size, String q, UUID memberId, UUID campaignId) {
        return ResponseEntity.ok(service.listPayments(CurrentUserId.get(), page, size, q, memberId, campaignId));
    }
}
