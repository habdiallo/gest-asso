package com.habdiallo.contribo.application.socialfund;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import com.habdiallo.contribo.application.common.PageResult;

public interface SocialFundRepository {

    PageResult<SocialFundData> findFunds(
            UUID associationId,
            int page,
            int size,
            String query,
            String status,
            String eventType);

    SocialFundData findFund(UUID associationId, UUID fundId);

    java.util.List<SocialFundData> findOpenFunds(UUID associationId);

    SocialFundData findOpenFund(UUID associationId, UUID fundId);

    UUID createFund(
            UUID associationId,
            String title,
            String eventType,
            String description,
            String beneficiary,
            LocalDate startDate,
            LocalDate endDate,
            Long targetAmount);

    void closeFund(UUID associationId, UUID fundId, UUID closedBy, OffsetDateTime closedAt);

    PageResult<ContributionData> findContributions(
            UUID associationId,
            int page,
            int size,
            String query,
            UUID memberId,
            UUID socialFundId);

    ContributionData findContribution(UUID associationId, UUID contributionId);

    boolean memberExists(UUID associationId, UUID memberId);

    UUID createContribution(
            UUID associationId,
            UUID socialFundId,
            UUID memberId,
            String externalFirstName,
            String externalLastName,
            long amount,
            LocalDate contributionDate,
            String method,
            UUID recordedBy,
            OffsetDateTime recordedAt);

    record SocialFundData(
            UUID id,
            UUID associationId,
            String title,
            String eventType,
            String description,
            String beneficiary,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            Long targetAmount,
            long collectedAmount,
            int contributorCount,
            int contributionCount,
            String currency) {
    }

    record ContributionData(
            UUID id,
            UUID memberId,
            String memberDisplayName,
            String externalFirstName,
            String externalLastName,
            UUID socialFundId,
            String socialFundTitle,
            String socialFundEventType,
            String socialFundStatus,
            long amount,
            LocalDate contributionDate,
            String method,
            UUID recordedBy,
            String recordedByDisplayName,
            OffsetDateTime recordedAt,
            String currency) {
    }
}
