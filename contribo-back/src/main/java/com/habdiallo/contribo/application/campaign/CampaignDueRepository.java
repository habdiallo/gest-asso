package com.habdiallo.contribo.application.campaign;

import java.util.Optional;
import java.util.UUID;

import com.habdiallo.contribo.api.generated.model.DueDetails;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;

public interface CampaignDueRepository {

    DuePage findCampaignDues(UUID associationId, UUID campaignId, int page, int size, String query, DueStatus status);

    Optional<DueDetails> findDue(UUID associationId, UUID dueId);

    DuePage findMemberDues(UUID associationId, UUID memberId, int page, int size, DueStatus status);
}
