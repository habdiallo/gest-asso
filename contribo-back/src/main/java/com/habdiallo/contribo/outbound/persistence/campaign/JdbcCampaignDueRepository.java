package com.habdiallo.contribo.outbound.persistence.campaign;

import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.api.generated.model.DueDetails;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.application.campaign.CampaignDueRepository;

@Repository
public class JdbcCampaignDueRepository implements CampaignDueRepository {

    private final JdbcCampaignRepository delegate;

    public JdbcCampaignDueRepository(JdbcCampaignRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public DuePage findCampaignDues(UUID associationId, UUID campaignId, int page, int size, String query, DueStatus status) {
        return delegate.findCampaignDues(associationId, campaignId, page, size, query, status);
    }

    @Override
    public Optional<DueDetails> findDue(UUID associationId, UUID dueId) {
        return delegate.findDue(associationId, dueId);
    }

    @Override
    public DuePage findMemberDues(UUID associationId, UUID memberId, int page, int size, DueStatus status) {
        return delegate.findMemberDues(associationId, memberId, page, size, status);
    }
}
