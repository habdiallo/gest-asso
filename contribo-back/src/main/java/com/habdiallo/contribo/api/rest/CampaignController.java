package com.habdiallo.contribo.api.rest;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import com.habdiallo.contribo.api.generated.CampagnesApi;
import com.habdiallo.contribo.api.generated.model.Campaign;
import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;
import com.habdiallo.contribo.api.generated.model.CreateCampaignRequest;
import com.habdiallo.contribo.api.generated.model.DueDetails;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.api.generated.model.UpdateCampaignCategoryAmountsRequest;
import com.habdiallo.contribo.application.access.CurrentUserId;
import com.habdiallo.contribo.application.campaign.CampaignService;

@RestController
public class CampaignController implements CampagnesApi {

    private final CampaignService service;

    public CampaignController(CampaignService service) {
        this.service = service;
    }

    @Override
    public ResponseEntity<CampaignPage> listCampaigns(
            Integer page, Integer size, String q, CampaignStatus status) {
        return ResponseEntity.ok(service.listCampaigns(CurrentUserId.get(), page, size, q, status));
    }

    @Override
    public ResponseEntity<Campaign> createCampaign(CreateCampaignRequest request) {
        return ResponseEntity.status(201).body(service.createCampaign(CurrentUserId.get(), request));
    }

    @Override
    public ResponseEntity<Campaign> getCampaign(UUID campaignId) {
        return ResponseEntity.ok(service.getCampaign(CurrentUserId.get(), campaignId));
    }

    @Override
    public ResponseEntity<Campaign> updateCampaignCategoryAmounts(
            UUID campaignId, UpdateCampaignCategoryAmountsRequest request) {
        return ResponseEntity.ok(service.updateCategoryAmounts(CurrentUserId.get(), campaignId, request));
    }

    @Override
    public ResponseEntity<DuePage> listCampaignDues(
            UUID campaignId, Integer page, Integer size, String q, DueStatus status) {
        return ResponseEntity.ok(service.listCampaignDues(CurrentUserId.get(), campaignId, page, size, q, status));
    }

    @Override
    public ResponseEntity<Campaign> openCampaign(UUID campaignId) {
        return ResponseEntity.ok(service.openCampaign(CurrentUserId.get(), campaignId));
    }

    @Override
    public ResponseEntity<Campaign> closeCampaign(UUID campaignId) {
        return ResponseEntity.ok(service.closeCampaign(CurrentUserId.get(), campaignId));
    }

    @Override
    public ResponseEntity<DueDetails> getDue(UUID dueId) {
        return ResponseEntity.ok(service.getDue(CurrentUserId.get(), dueId));
    }
}
