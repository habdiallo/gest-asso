package com.habdiallo.contribo.application.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;
import com.habdiallo.contribo.api.generated.model.CampaignSummary;
import com.habdiallo.contribo.api.generated.model.CurrentUser;
import com.habdiallo.contribo.api.generated.model.DueCountSummary;
import com.habdiallo.contribo.api.generated.model.ManagementDashboard;
import com.habdiallo.contribo.api.generated.model.MemberDashboard;
import com.habdiallo.contribo.api.generated.model.PageMetadata;
import com.habdiallo.contribo.api.generated.model.PaymentPage;
import com.habdiallo.contribo.api.generated.model.SocialFundsAggregateOverview;
import com.habdiallo.contribo.api.rest.ApiException;
import com.habdiallo.contribo.application.access.AuthorizationService;
import com.habdiallo.contribo.application.auth.AuthenticationService;
import com.habdiallo.contribo.application.campaign.CampaignCatalogRepository;
import com.habdiallo.contribo.application.campaign.CampaignPaymentRepository;
import com.habdiallo.contribo.application.members.MemberDuesRepository;
import com.habdiallo.contribo.application.members.MemberRepository;
import com.habdiallo.contribo.application.socialfund.SocialFundRepository;
import com.habdiallo.contribo.domain.auth.AuthenticatedAccount;
import com.habdiallo.contribo.domain.campaign.CampaignReference;
import com.habdiallo.contribo.domain.campaign.Due;
import com.habdiallo.contribo.domain.campaign.DuePage;
import com.habdiallo.contribo.domain.campaign.DueStatus;
import com.habdiallo.contribo.domain.campaign.PersonSummary;
import com.habdiallo.contribo.domain.category.IncomeCategorySummary;
import com.habdiallo.contribo.domain.shared.CurrencyCode;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    private static final UUID USER_ID = UUID.fromString("00000000-0000-0000-0000-000000000101");
    private static final UUID ASSOCIATION_ID = UUID.fromString("00000000-0000-0000-0000-000000000102");
    private static final UUID MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000103");
    private static final UUID CATEGORY_ID = UUID.fromString("00000000-0000-0000-0000-000000000104");
    private static final UUID CAMPAIGN_ID = UUID.fromString("00000000-0000-0000-0000-000000000105");
    private static final UUID FUND_ID = UUID.fromString("00000000-0000-0000-0000-000000000106");

    @Mock
    private AuthorizationService authorizationService;

    @Mock
    private AuthenticationService authenticationService;

    @Mock
    private MemberRepository memberRepository;

    @Mock
    private MemberDuesRepository memberDuesRepository;

    @Mock
    private CampaignCatalogRepository campaignCatalogRepository;

    @Mock
    private CampaignPaymentRepository campaignPaymentRepository;

    @Mock
    private SocialFundRepository socialFundRepository;

    @Test
    void memberDashboardUsesOnlyMemberDataAndMapsRecentDues() {
        AuthenticatedAccount account = account("MEMBER", false);
        CurrentUser viewer = mock(CurrentUser.class);
        Due due = due();
        when(authorizationService.requireAuthenticated(USER_ID)).thenReturn(account);
        when(authenticationService.currentUser(USER_ID)).thenReturn(viewer);
        when(memberDuesRepository.dashboardStats(ASSOCIATION_ID, MEMBER_ID))
                .thenReturn(new MemberDuesRepository.DashboardStats(2, 900L, 1, 1500L, 1));
        when(memberDuesRepository.findPage(ASSOCIATION_ID, MEMBER_ID, 0, 5, null))
                .thenReturn(new DuePage(List.of(due), new com.habdiallo.contribo.domain.common.PageMetadata(0, 5, 1, 1)));

        Object result = newService().getDashboard(USER_ID, null, null);

        assertThat(result).isInstanceOf(MemberDashboard.class);
        MemberDashboard dashboard = (MemberDashboard) result;
        assertThat(dashboard.getView()).isEqualTo(MemberDashboard.ViewEnum.MEMBER);
        assertThat(dashboard.getUnpaidDueCount()).isEqualTo(2);
        assertThat(dashboard.getTotalRemainingAmount()).isEqualTo(900L);
        assertThat(dashboard.getPaidDueCount()).isEqualTo(1);
        assertThat(dashboard.getTotalContributionAmount()).isEqualTo(1500L);
        assertThat(dashboard.getContributedSocialFundCount()).isEqualTo(1);
        assertThat(dashboard.getRecentDues()).hasSize(1);
        assertThat(dashboard.getRecentDues().get(0).getId()).isEqualTo(due.id());
        verify(memberDuesRepository).findPage(ASSOCIATION_ID, MEMBER_ID, 0, 5, null);
        verifyNoInteractions(memberRepository, campaignCatalogRepository, campaignPaymentRepository, socialFundRepository);
    }

    @Test
    void unauthorizedOperatorDoesNotReceiveFinancialOverview() {
        AuthenticatedAccount account = account("OPERATOR", false);
        CurrentUser viewer = mock(CurrentUser.class);
        CampaignSummary campaign = new CampaignSummary(
                CAMPAIGN_ID, "Campagne ouverte", LocalDate.now(), LocalDate.now().plusDays(5),
                CampaignStatus.OPEN, 3);
        campaign.setFinancialSummary(mock(com.habdiallo.contribo.api.generated.model.CampaignFinancialSummary.class));
        when(authorizationService.requireAuthenticated(USER_ID)).thenReturn(account);
        when(authenticationService.currentUser(USER_ID)).thenReturn(viewer);
        when(campaignCatalogRepository.findCampaigns(ASSOCIATION_ID, 0, 5, null, CampaignStatus.OPEN))
                .thenReturn(new CampaignPage(List.of(campaign), new PageMetadata(0, 5, 1L, 1)));
        when(memberRepository.countByStatus(ASSOCIATION_ID, "ACTIVE")).thenReturn(4L);
        when(memberRepository.countAll(ASSOCIATION_ID)).thenReturn(6L);
        when(memberRepository.countCreatedSince(org.mockito.ArgumentMatchers.eq(ASSOCIATION_ID),
                org.mockito.ArgumentMatchers.any())).thenReturn(1L);

        ManagementDashboard dashboard = (ManagementDashboard) newService().getDashboard(USER_ID, null, null);

        assertThat(dashboard.getView()).isEqualTo(ManagementDashboard.ViewEnum.MANAGEMENT);
        assertThat(dashboard.getFinancialOverview()).isNull();
        assertThat(dashboard.getRecentCampaigns()).hasSize(1);
        assertThat(dashboard.getRecentCampaigns().get(0).getFinancialSummary()).isNull();
        verifyNoInteractions(campaignPaymentRepository, socialFundRepository);
    }

    @Test
    void administratorReceivesAggregatesAndSelectedFinancialScope() {
        AuthenticatedAccount account = account("ADMINISTRATOR", false);
        CurrentUser viewer = mock(CurrentUser.class);
        CampaignSummary campaign = new CampaignSummary(
                CAMPAIGN_ID, "Campagne ouverte", LocalDate.now(), LocalDate.now().plusDays(5),
                CampaignStatus.OPEN, 3);
        com.habdiallo.contribo.api.generated.model.CampaignFinancialSummary financialSummary =
                new com.habdiallo.contribo.api.generated.model.CampaignFinancialSummary(
                        1000L, 400L, 600L, 40d,
                        new DueCountSummary(2, 1, 1, 0),
                        com.habdiallo.contribo.api.generated.model.CurrencyCode.GNF);
        SocialFundRepository.SocialFundData fund = new SocialFundRepository.SocialFundData(
                FUND_ID, ASSOCIATION_ID, "Cagnotte", "WEDDING", null, "Famille", LocalDate.now(),
                LocalDate.now().plusDays(5), "OPEN", 1000L, 400L, 2, 3, "GNF");
        when(authorizationService.requireAuthenticated(USER_ID)).thenReturn(account);
        when(authenticationService.currentUser(USER_ID)).thenReturn(viewer);
        when(campaignCatalogRepository.findCampaigns(ASSOCIATION_ID, 0, 5, null, CampaignStatus.OPEN))
                .thenReturn(new CampaignPage(List.of(campaign), new PageMetadata(0, 5, 1L, 1)));
        when(memberRepository.countByStatus(ASSOCIATION_ID, "ACTIVE")).thenReturn(4L);
        when(memberRepository.countAll(ASSOCIATION_ID)).thenReturn(6L);
        when(memberRepository.countCreatedSince(org.mockito.ArgumentMatchers.eq(ASSOCIATION_ID),
                org.mockito.ArgumentMatchers.any())).thenReturn(1L);
        when(campaignPaymentRepository.findRecentOpenPayments(ASSOCIATION_ID, null))
                .thenReturn(new PaymentPage(List.of(), new PageMetadata(0, 5, 0L, 0)));
        when(campaignCatalogRepository.aggregateOpenCampaigns(ASSOCIATION_ID))
                .thenReturn(new CampaignCatalogRepository.CampaignAggregate(1L, financialSummary));
        when(socialFundRepository.findOpenFunds(ASSOCIATION_ID)).thenReturn(List.of(fund));

        ManagementDashboard dashboard = (ManagementDashboard) newService().getDashboard(USER_ID, null, null);

        assertThat(dashboard.getFinancialOverview()).isNotNull();
        assertThat(dashboard.getFinancialOverview().getRecentPayments()).isEmpty();
        assertThat(dashboard.getFinancialOverview().getAllOpenCampaignsSummary().getOpenCampaignCount()).isEqualTo(1);
        assertThat(dashboard.getFinancialOverview().getAllOpenCampaignsSummary().getFinancialSummary())
                .isEqualTo(financialSummary);
        SocialFundsAggregateOverview funds = dashboard.getFinancialOverview().getAllOpenSocialFundsSummary();
        assertThat(funds.getOpenSocialFundCount()).isEqualTo(1);
        assertThat(funds.getCollectedAmount()).isEqualTo(400L);
        assertThat(funds.getTargetAmount()).isEqualTo(1000L);
        assertThat(funds.getProgressRate()).isEqualTo(40d);
    }

    @Test
    void selectedCampaignOutsideTheAssociationIsNotFound() {
        AuthenticatedAccount account = account("TREASURER", false);
        when(authorizationService.requireAuthenticated(USER_ID)).thenReturn(account);
        when(authenticationService.currentUser(USER_ID)).thenReturn(mock(CurrentUser.class));
        when(campaignCatalogRepository.findCampaigns(ASSOCIATION_ID, 0, 5, null, CampaignStatus.OPEN))
                .thenReturn(new CampaignPage(List.of(), new PageMetadata(0, 5, 0L, 0)));
        when(memberRepository.countByStatus(ASSOCIATION_ID, "ACTIVE")).thenReturn(0L);
        when(memberRepository.countAll(ASSOCIATION_ID)).thenReturn(0L);
        when(memberRepository.countCreatedSince(org.mockito.ArgumentMatchers.eq(ASSOCIATION_ID),
                org.mockito.ArgumentMatchers.any())).thenReturn(0L);
        when(campaignPaymentRepository.findRecentOpenPayments(ASSOCIATION_ID, CAMPAIGN_ID))
                .thenReturn(new PaymentPage(List.of(), new PageMetadata(0, 5, 0L, 0)));
        when(campaignCatalogRepository.findOpenCampaign(ASSOCIATION_ID, CAMPAIGN_ID)).thenReturn(Optional.empty());

        ApiException exception = catchThrowableOfType(
                () -> newService().getDashboard(USER_ID, CAMPAIGN_ID, null), ApiException.class);

        assertThat(exception).isNotNull();
        assertThat(exception.status()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(exception.code().getValue()).isEqualTo("RESOURCE_NOT_FOUND");
        verifyNoInteractions(socialFundRepository);
    }

    private DashboardService newService() {
        return new DashboardService(
                authorizationService,
                authenticationService,
                memberRepository,
                memberDuesRepository,
                campaignCatalogRepository,
                campaignPaymentRepository,
                socialFundRepository);
    }

    private AuthenticatedAccount account(String role, boolean operatorCanRecordPayments) {
        return new AuthenticatedAccount(
                USER_ID,
                "hash",
                true,
                ASSOCIATION_ID,
                "Association test",
                "GNF",
                MEMBER_ID,
                "Amadou",
                "Diallo",
                null,
                null,
                null,
                null,
                null,
                "ACTIVE",
                CATEGORY_ID,
                "Standard",
                role,
                operatorCanRecordPayments,
                false);
    }

    private Due due() {
        return new Due(
                UUID.fromString("00000000-0000-0000-0000-000000000107"),
                new PersonSummary(MEMBER_ID, "Amadou Diallo"),
                new CampaignReference(
                        CAMPAIGN_ID,
                        "Campagne ouverte",
                        LocalDate.now(),
                        LocalDate.now().plusDays(5),
                        com.habdiallo.contribo.domain.campaign.CampaignStatus.OPEN),
                new IncomeCategorySummary(CATEGORY_ID, "Standard"),
                1000L,
                100L,
                900L,
                DueStatus.PARTIALLY_PAID,
                1,
                CurrencyCode.GNF);
    }
}
