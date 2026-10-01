package com.habdiallo.contribo.application.dashboard;

import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.habdiallo.contribo.api.generated.model.CampaignFinancialSummary;
import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;
import com.habdiallo.contribo.api.generated.model.CampaignSummary;
import com.habdiallo.contribo.api.generated.model.CampaignsAggregateOverview;
import com.habdiallo.contribo.api.generated.model.CurrencyCode;
import com.habdiallo.contribo.api.generated.model.CurrentUser;
import com.habdiallo.contribo.api.generated.model.Due;
import com.habdiallo.contribo.api.generated.model.ManagementDashboard;
import com.habdiallo.contribo.api.generated.model.ManagementFinancialOverview;
import com.habdiallo.contribo.api.generated.model.MemberDashboard;
import com.habdiallo.contribo.api.generated.model.Payment;
import com.habdiallo.contribo.api.generated.model.PersonSummary;
import com.habdiallo.contribo.api.generated.model.SocialEventType;
import com.habdiallo.contribo.api.generated.model.SocialFundStatus;
import com.habdiallo.contribo.api.generated.model.SocialFundSummary;
import com.habdiallo.contribo.api.generated.model.SocialFundsAggregateOverview;
import com.habdiallo.contribo.api.generated.model.UserRole;
import com.habdiallo.contribo.application.access.AuthorizationService;
import com.habdiallo.contribo.application.auth.AuthenticationService;
import com.habdiallo.contribo.application.campaign.CampaignCatalogRepository;
import com.habdiallo.contribo.application.campaign.CampaignPaymentRepository;
import com.habdiallo.contribo.application.members.MemberDuesRepository;
import com.habdiallo.contribo.application.members.MemberRepository;
import com.habdiallo.contribo.application.socialfund.SocialFundRepository;
import com.habdiallo.contribo.domain.auth.AuthenticatedAccount;
import com.habdiallo.contribo.api.rest.ApiErrors;

@Service
public class DashboardService {

    private static final int RECENT_ITEMS_LIMIT = 5;

    private final AuthorizationService authorizationService;
    private final AuthenticationService authenticationService;
    private final MemberRepository memberRepository;
    private final MemberDuesRepository memberDuesRepository;
    private final CampaignCatalogRepository campaignCatalogRepository;
    private final CampaignPaymentRepository campaignPaymentRepository;
    private final SocialFundRepository socialFundRepository;

    public DashboardService(
            AuthorizationService authorizationService,
            AuthenticationService authenticationService,
            MemberRepository memberRepository,
            MemberDuesRepository memberDuesRepository,
            CampaignCatalogRepository campaignCatalogRepository,
            CampaignPaymentRepository campaignPaymentRepository,
            SocialFundRepository socialFundRepository) {
        this.authorizationService = authorizationService;
        this.authenticationService = authenticationService;
        this.memberRepository = memberRepository;
        this.memberDuesRepository = memberDuesRepository;
        this.campaignCatalogRepository = campaignCatalogRepository;
        this.campaignPaymentRepository = campaignPaymentRepository;
        this.socialFundRepository = socialFundRepository;
    }

    public Object getDashboard(UUID userId, UUID campaignId, UUID socialFundId) {
        AuthenticatedAccount account = authorizationService.requireAuthenticated(userId);
        CurrentUser viewer = authenticationService.currentUser(userId);
        UserRole role = UserRole.fromValue(account.role());
        return role == UserRole.MEMBER
                ? memberDashboard(account, viewer)
                : managementDashboard(account, viewer, campaignId, socialFundId);
    }

    private MemberDashboard memberDashboard(AuthenticatedAccount account, CurrentUser viewer) {
        MemberDuesRepository.DashboardStats stats = memberDuesRepository.dashboardStats(
                account.associationId(), account.memberId());
        List<Due> recentDues = memberDuesRepository.findPage(
                        account.associationId(), account.memberId(), 0, RECENT_ITEMS_LIMIT, null)
                .items().stream().map(this::toGeneratedDue).toList();
        return new MemberDashboard(
                MemberDashboard.ViewEnum.MEMBER,
                now(),
                viewer,
                stats.unpaidDueCount(),
                stats.totalRemainingAmount(),
                stats.paidDueCount(),
                stats.totalContributionAmount(),
                stats.contributedSocialFundCount(),
                currency(account),
                recentDues);
    }

    private ManagementDashboard managementDashboard(
            AuthenticatedAccount account,
            CurrentUser viewer,
            UUID campaignId,
            UUID socialFundId) {
        boolean financialAccess = hasFinancialAccess(account);
        CampaignPage page = campaignCatalogRepository.findCampaigns(
                account.associationId(), 0, RECENT_ITEMS_LIMIT, null, CampaignStatus.OPEN);
        List<CampaignSummary> recentCampaigns = new ArrayList<>(page.getItems());
        if (!financialAccess) {
            recentCampaigns.forEach(campaign -> campaign.setFinancialSummary(null));
        }
        int openCampaignCount = Math.toIntExact(page.getPage().getTotalElements());
        OffsetDateTime asOf = now();
        ManagementDashboard dashboard = new ManagementDashboard(
                ManagementDashboard.ViewEnum.MANAGEMENT,
                asOf,
                viewer,
                Math.toIntExact(memberRepository.countByStatus(account.associationId(), "ACTIVE")),
                Math.toIntExact(memberRepository.countAll(account.associationId())),
                Math.toIntExact(memberRepository.countCreatedSince(account.associationId(), startOfMonth(asOf))),
                openCampaignCount,
                recentCampaigns);
        if (financialAccess) {
            dashboard.setFinancialOverview(financialOverview(account, campaignId, socialFundId));
        }
        return dashboard;
    }

    private ManagementFinancialOverview financialOverview(
            AuthenticatedAccount account, UUID campaignId, UUID socialFundId) {
        ManagementFinancialOverview overview = new ManagementFinancialOverview(
                campaignPaymentRepository.findRecentOpenPayments(account.associationId(), campaignId).getItems());
        if (campaignId == null) {
            CampaignCatalogRepository.CampaignAggregate aggregate =
                    campaignCatalogRepository.aggregateOpenCampaigns(account.associationId());
            overview.setAllOpenCampaignsSummary(new CampaignsAggregateOverview(
                    Math.toIntExact(aggregate.openCampaignCount()), aggregate.financialSummary()));
        } else {
            overview.setSelectedCampaign(campaignCatalogRepository
                    .findOpenCampaign(account.associationId(), campaignId)
                    .orElseThrow(ApiErrors::notFound));
        }

        if (socialFundId == null) {
            overview.setAllOpenSocialFundsSummary(allOpenSocialFundsSummary(account));
        } else {
            SocialFundRepository.SocialFundData fund = socialFundRepository.findOpenFund(
                    account.associationId(), socialFundId);
            if (fund == null) {
                throw ApiErrors.notFound();
            }
            overview.setSelectedSocialFund(toSocialFundSummary(fund));
        }
        return overview;
    }

    private SocialFundsAggregateOverview allOpenSocialFundsSummary(AuthenticatedAccount account) {
        List<SocialFundRepository.SocialFundData> funds = socialFundRepository.findOpenFunds(account.associationId());
        long collectedAmount = funds.stream().mapToLong(SocialFundRepository.SocialFundData::collectedAmount).sum();
        int contributorCount = funds.stream().mapToInt(SocialFundRepository.SocialFundData::contributorCount).sum();
        List<Long> targets = funds.stream()
                .map(SocialFundRepository.SocialFundData::targetAmount)
                .filter(java.util.Objects::nonNull)
                .toList();
        Long targetAmount = targets.isEmpty() ? null : targets.stream().mapToLong(Long::longValue).sum();
        SocialFundsAggregateOverview overview = new SocialFundsAggregateOverview(
                funds.size(), collectedAmount, contributorCount, currency(account));
        overview.setTargetAmount(targetAmount);
        if (targetAmount != null && targetAmount > 0) {
            overview.setProgressRate(collectedAmount * 100d / targetAmount);
        }
        return overview;
    }

    private SocialFundSummary toSocialFundSummary(SocialFundRepository.SocialFundData fund) {
        SocialFundSummary summary = new SocialFundSummary(
                fund.id(),
                fund.title(),
                SocialEventType.fromValue(fund.eventType()),
                fund.beneficiary(),
                fund.startDate(),
                fund.endDate(),
                SocialFundStatus.fromValue(fund.status()),
                fund.collectedAmount(),
                fund.contributorCount(),
                fund.contributionCount(),
                CurrencyCode.fromValue(fund.currency()));
        summary.setTargetAmount(fund.targetAmount());
        if (fund.targetAmount() != null) {
            summary.setRemainingToTargetAmount(Math.max(0, fund.targetAmount() - fund.collectedAmount()));
            summary.setProgressRate(fund.collectedAmount() * 100d / fund.targetAmount());
        }
        return summary;
    }

    private Due toGeneratedDue(com.habdiallo.contribo.domain.campaign.Due due) {
        return new Due(
                due.id(),
                new PersonSummary(due.member().id(), due.member().displayName()),
                new com.habdiallo.contribo.api.generated.model.CampaignReference(
                        due.campaign().id(),
                        due.campaign().name(),
                        due.campaign().startDate(),
                        due.campaign().endDate(),
                        CampaignStatus.fromValue(due.campaign().status().name())),
                new com.habdiallo.contribo.api.generated.model.IncomeCategorySummary(
                        due.category().id(), due.category().label()),
                due.dueAmount(),
                due.paidAmount(),
                due.remainingAmount(),
                com.habdiallo.contribo.api.generated.model.DueStatus.fromValue(due.status().getValue()),
                due.paymentCount(),
                CurrencyCode.fromValue(due.currency().getValue()));
    }

    private boolean hasFinancialAccess(AuthenticatedAccount account) {
        UserRole role = UserRole.fromValue(account.role());
        return role == UserRole.ADMINISTRATOR
                || role == UserRole.TREASURER
                || (role == UserRole.OPERATOR && account.operatorCanRecordPayments());
    }

    private CurrencyCode currency(AuthenticatedAccount account) {
        return CurrencyCode.fromValue(account.currency());
    }

    private OffsetDateTime now() {
        return OffsetDateTime.now(ZoneOffset.UTC);
    }

    private OffsetDateTime startOfMonth(OffsetDateTime value) {
        return YearMonth.from(value).atDay(1).atStartOfDay().atOffset(ZoneOffset.UTC);
    }
}
