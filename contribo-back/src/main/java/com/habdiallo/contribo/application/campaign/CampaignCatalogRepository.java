package com.habdiallo.contribo.application.campaign;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.habdiallo.contribo.api.generated.model.Campaign;
import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;

public interface CampaignCatalogRepository {

    CampaignPage findCampaigns(UUID associationId, int page, int size, String query, CampaignStatus status);

    Campaign createCampaign(
            UUID associationId,
            UUID campaignId,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            Map<UUID, Long> categoryAmounts);

    Optional<CampaignRepository.CampaignState> findCampaignState(UUID associationId, UUID campaignId);

    Campaign findCampaignDetails(UUID associationId, UUID campaignId);

    Campaign updateCategoryAmounts(UUID associationId, UUID campaignId, Map<UUID, Long> categoryAmounts);

    Campaign openCampaign(UUID associationId, UUID campaignId, UUID openedBy, OffsetDateTime openedAt);

    Campaign closeCampaign(UUID associationId, UUID campaignId, UUID closedBy, OffsetDateTime closedAt);
}
