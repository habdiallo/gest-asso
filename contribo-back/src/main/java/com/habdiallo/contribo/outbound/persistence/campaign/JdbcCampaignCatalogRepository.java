package com.habdiallo.contribo.outbound.persistence.campaign;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.api.generated.model.Campaign;
import com.habdiallo.contribo.api.generated.model.CampaignSummary;
import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;
import com.habdiallo.contribo.application.campaign.CampaignCatalogRepository;
import com.habdiallo.contribo.application.campaign.CampaignRepository;

@Repository
public class JdbcCampaignCatalogRepository implements CampaignCatalogRepository {

    private final JdbcCampaignRepository delegate;

    public JdbcCampaignCatalogRepository(JdbcCampaignRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public CampaignPage findCampaigns(UUID associationId, int page, int size, String query, CampaignStatus status) {
        return delegate.findCampaigns(associationId, page, size, query, status);
    }

    @Override
    public java.util.Optional<CampaignSummary> findOpenCampaign(UUID associationId, UUID campaignId) {
        return delegate.findOpenCampaign(associationId, campaignId);
    }

    @Override
    public CampaignAggregate aggregateOpenCampaigns(UUID associationId) {
        return delegate.aggregateOpenCampaigns(associationId);
    }

    @Override
    public Campaign createCampaign(
            UUID associationId,
            UUID campaignId,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            Map<UUID, Long> categoryAmounts) {
        return delegate.createCampaign(
                associationId, campaignId, name, description, startDate, endDate, categoryAmounts);
    }

    @Override
    public Optional<CampaignRepository.CampaignState> findCampaignState(UUID associationId, UUID campaignId) {
        return delegate.findCampaignState(associationId, campaignId);
    }

    @Override
    public Campaign findCampaignDetails(UUID associationId, UUID campaignId) {
        return delegate.findCampaignDetails(associationId, campaignId);
    }

    @Override
    public Campaign updateCategoryAmounts(UUID associationId, UUID campaignId, Map<UUID, Long> categoryAmounts) {
        return delegate.updateCategoryAmounts(associationId, campaignId, categoryAmounts);
    }

    @Override
    public Campaign openCampaign(UUID associationId, UUID campaignId, UUID openedBy, OffsetDateTime openedAt) {
        return delegate.openCampaign(associationId, campaignId, openedBy, openedAt);
    }

    @Override
    public Campaign closeCampaign(UUID associationId, UUID campaignId, UUID closedBy, OffsetDateTime closedAt) {
        return delegate.closeCampaign(associationId, campaignId, closedBy, closedAt);
    }
}
