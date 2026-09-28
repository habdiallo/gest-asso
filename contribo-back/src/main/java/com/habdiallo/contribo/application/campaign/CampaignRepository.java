package com.habdiallo.contribo.application.campaign;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import com.habdiallo.contribo.api.generated.model.Campaign;
import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;
import com.habdiallo.contribo.api.generated.model.Due;
import com.habdiallo.contribo.api.generated.model.DueDetails;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.api.generated.model.Payment;
import com.habdiallo.contribo.api.generated.model.PaymentPage;

public interface CampaignRepository {

    CampaignPage findCampaigns(UUID associationId, int page, int size, String query, CampaignStatus status);

    Campaign createCampaign(
            UUID associationId,
            UUID campaignId,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            Map<UUID, Long> categoryAmounts);

    Optional<CampaignState> findCampaignState(UUID associationId, UUID campaignId);

    Campaign findCampaignDetails(UUID associationId, UUID campaignId);

    Campaign updateCategoryAmounts(UUID associationId, UUID campaignId, Map<UUID, Long> categoryAmounts);

    Campaign openCampaign(UUID associationId, UUID campaignId, UUID openedBy, OffsetDateTime openedAt);

    Campaign closeCampaign(UUID associationId, UUID campaignId, UUID closedBy, OffsetDateTime closedAt);

    DuePage findCampaignDues(UUID associationId, UUID campaignId, int page, int size, String query, DueStatus status);

    Optional<DueDetails> findDue(UUID associationId, UUID dueId);

    DuePage findMemberDues(UUID associationId, UUID memberId, int page, int size, DueStatus status);

    PaymentCreation createPayment(
            UUID associationId,
            UUID dueId,
            UUID recordedBy,
            long amount,
            LocalDate paymentDate,
            String method);

    PaymentPage findPayments(
            UUID associationId,
            int page,
            int size,
            String query,
            UUID memberId,
            UUID campaignId);

    record CampaignState(
            UUID id,
            UUID associationId,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            CampaignStatus status,
            OffsetDateTime openedAt,
            UUID openedBy,
            OffsetDateTime closedAt,
            UUID closedBy,
            boolean hasPayments,
            boolean baremeComplete,
            boolean duesReady) {
    }

    record PaymentCreation(Payment payment, Due due) {
    }
}
