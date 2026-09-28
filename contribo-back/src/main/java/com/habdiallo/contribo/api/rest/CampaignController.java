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
        return ResponseEntity.ok(service.listCampaigns(page, size, q, status));
    }

    @Override
    public ResponseEntity<Campaign> createCampaign(CreateCampaignRequest request) {
        return ResponseEntity.status(201).body(service.createCampaign(request));
    }

    @Override
    public ResponseEntity<Campaign> getCampaign(UUID campaignId) {
        return ResponseEntity.ok(service.getCampaign(campaignId));
    }

    @Override
    public ResponseEntity<Campaign> updateCampaignCategoryAmounts(
            UUID campaignId, UpdateCampaignCategoryAmountsRequest request) {
        return ResponseEntity.ok(service.updateCategoryAmounts(campaignId, request));
    }

    @Override
    public ResponseEntity<DuePage> listCampaignDues(
            UUID campaignId, Integer page, Integer size, String q, DueStatus status) {
        return ResponseEntity.ok(service.listCampaignDues(campaignId, page, size, q, status));
    }

    @Override
    public ResponseEntity<Campaign> openCampaign(UUID campaignId) {
        return ResponseEntity.ok(service.openCampaign(campaignId));
    }

    @Override
    public ResponseEntity<Campaign> closeCampaign(UUID campaignId) {
        return ResponseEntity.ok(service.closeCampaign(campaignId));
    }

    @Override
    public ResponseEntity<DueDetails> getDue(UUID dueId) {
        return ResponseEntity.ok(service.getDue(dueId));
    }
}
