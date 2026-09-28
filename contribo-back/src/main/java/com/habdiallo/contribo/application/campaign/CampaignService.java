package com.habdiallo.contribo.application.campaign;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.habdiallo.contribo.api.generated.model.Campaign;
import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;
import com.habdiallo.contribo.api.generated.model.CreateCampaignRequest;
import com.habdiallo.contribo.api.generated.model.CreatePaymentRequest;
import com.habdiallo.contribo.api.generated.model.DueDetails;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.api.generated.model.PaymentCreationResponse;
import com.habdiallo.contribo.api.generated.model.PaymentPage;
import com.habdiallo.contribo.api.generated.model.UpdateCampaignCategoryAmountsRequest;
import com.habdiallo.contribo.api.rest.ApiErrors;
import com.habdiallo.contribo.application.auth.AuthenticatedAccount;

@Service
public class CampaignService {

    private static final String ALL_ACTIVE_MEMBERS = "ALL_ACTIVE_MEMBERS";

    private final CampaignRepository repository;
    private final CampaignAccess access;

    public CampaignService(CampaignRepository repository, CampaignAccess access) {
        this.repository = repository;
        this.access = access;
    }

    public CampaignPage listCampaigns(int page, int size, String query, CampaignStatus status) {
        AuthenticatedAccount account = access.requireManagementRead();
        return repository.findCampaigns(account.associationId(), page, size, query, status);
    }

    @Transactional
    public Campaign createCampaign(CreateCampaignRequest request) {
        AuthenticatedAccount account = access.requireCampaignWrite();
        validateDates(request.getStartDate(), request.getEndDate());
        if (request.getMemberSelection() == null
                || !ALL_ACTIVE_MEMBERS.equals(request.getMemberSelection().getValue())) {
            throw ApiErrors.badRequest(com.habdiallo.contribo.api.generated.model.ErrorCode.VALIDATION_ERROR,
                    "Le périmètre de membres est invalide.");
        }
        Map<UUID, Long> amounts = categoryAmounts(request.getCategoryAmounts());
        return repository.createCampaign(
                account.associationId(),
                UUID.randomUUID(),
                request.getName(),
                request.getDescription(),
                request.getStartDate(),
                request.getEndDate(),
                amounts);
    }

    public Campaign getCampaign(UUID campaignId) {
        AuthenticatedAccount account = access.requireManagementRead();
        campaign(account, campaignId);
        return repository.findCampaignDetails(account.associationId(), campaignId);
    }

    @Transactional
    public Campaign updateCategoryAmounts(UUID campaignId, UpdateCampaignCategoryAmountsRequest request) {
        AuthenticatedAccount account = access.requireCampaignWrite();
        CampaignRepository.CampaignState state = campaign(account, campaignId);
        if (state.status() != CampaignStatus.UPCOMING || state.startDate().isBefore(LocalDate.now())) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_NOT_EDITABLE,
                    "La campagne n'est plus modifiable.");
        }
        if (state.hasPayments()) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_NOT_EDITABLE,
                    "Une campagne ayant des règlements ne peut plus être modifiée.");
        }
        return repository.updateCategoryAmounts(
                account.associationId(), campaignId, categoryAmounts(request.getCategoryAmounts()));
    }

    @Transactional
    public Campaign openCampaign(UUID campaignId) {
        AuthenticatedAccount account = access.requireCampaignWrite();
        CampaignRepository.CampaignState state = campaign(account, campaignId);
        if (state.status() == CampaignStatus.OPEN) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_ALREADY_OPEN,
                    "La campagne est déjà ouverte.");
        }
        if (state.status() == CampaignStatus.CLOSED) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_CLOSED,
                    "La campagne est clôturée.");
        }
        if (state.startDate().isAfter(LocalDate.now())) {
            throw ApiErrors.conflict(
                    com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_START_DATE_NOT_REACHED,
                    "La date de début de la campagne n'est pas encore atteinte.");
        }
        if (!state.baremeComplete() || !state.duesReady()) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_NOT_READY,
                    "La campagne n'est pas prête à être ouverte.");
        }
        return repository.openCampaign(
                account.associationId(), campaignId, account.userId(), OffsetDateTime.now(ZoneOffset.UTC));
    }

    @Transactional
    public Campaign closeCampaign(UUID campaignId) {
        AuthenticatedAccount account = access.requireCampaignWrite();
        CampaignRepository.CampaignState state = campaign(account, campaignId);
        if (state.status() == CampaignStatus.CLOSED) {
            throw ApiErrors.conflict(
                    com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_ALREADY_CLOSED,
                    "La campagne est déjà clôturée.");
        }
        if (state.status() != CampaignStatus.OPEN) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_NOT_OPEN,
                    "Seule une campagne ouverte peut être clôturée.");
        }
        return repository.closeCampaign(
                account.associationId(), campaignId, account.userId(), OffsetDateTime.now(ZoneOffset.UTC));
    }

    public DuePage listCampaignDues(UUID campaignId, int page, int size, String query, DueStatus status) {
        AuthenticatedAccount account = access.requireManagementRead();
        campaign(account, campaignId);
        return repository.findCampaignDues(account.associationId(), campaignId, page, size, query, status);
    }

    public DueDetails getDue(UUID dueId) {
        AuthenticatedAccount account = access.currentUser();
        DueDetails due = repository.findDue(account.associationId(), dueId).orElseThrow(ApiErrors::notFound);
        if (!access.isManagement(account) && !account.memberId().equals(due.getMember().getId())) {
            throw ApiErrors.notFound();
        }
        return due;
    }

    public DuePage listMyDues(int page, int size, DueStatus status) {
        AuthenticatedAccount account = access.currentUser();
        return repository.findMemberDues(account.associationId(), account.memberId(), page, size, status);
    }

    @Transactional
    public PaymentCreationResponse createPayment(UUID dueId, CreatePaymentRequest request) {
        AuthenticatedAccount account = access.requirePaymentWrite();
        if (request.getAmount() == null || request.getAmount() <= 0
                || request.getPaymentDate() == null || request.getMethod() == null) {
            throw ApiErrors.badRequest(com.habdiallo.contribo.api.generated.model.ErrorCode.VALIDATION_ERROR,
                    "Le montant doit être strictement positif.");
        }
        CampaignRepository.PaymentCreation creation = repository.createPayment(
                account.associationId(),
                dueId,
                account.userId(),
                request.getAmount(),
                request.getPaymentDate(),
                request.getMethod() == null ? null : request.getMethod().getValue());
        return new PaymentCreationResponse(creation.payment(), creation.due());
    }

    public PaymentPage listPayments(int page, int size, String query, UUID memberId, UUID campaignId) {
        AuthenticatedAccount account = access.requireManagementRead();
        return repository.findPayments(account.associationId(), page, size, query, memberId, campaignId);
    }

    private CampaignRepository.CampaignState campaign(AuthenticatedAccount account, UUID campaignId) {
        return repository.findCampaignState(account.associationId(), campaignId).orElseThrow(ApiErrors::notFound);
    }

    private void validateDates(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw ApiErrors.badRequest(com.habdiallo.contribo.api.generated.model.ErrorCode.DATE_RANGE_INVALID,
                    "La date de fin doit être postérieure ou égale à la date de début.");
        }
    }

    private Map<UUID, Long> categoryAmounts(Iterable<com.habdiallo.contribo.api.generated.model.CampaignCategoryAmountInput> values) {
        Map<UUID, Long> amounts = new LinkedHashMap<>();
        if (values != null) {
            for (var value : values) {
                if (value.getIncomeCategoryId() == null || value.getAmount() == null || value.getAmount() < 0) {
                    throw ApiErrors.badRequest(
                            com.habdiallo.contribo.api.generated.model.ErrorCode.VALIDATION_ERROR,
                            "Le barème contient une valeur invalide.");
                }
                if (amounts.put(value.getIncomeCategoryId(), value.getAmount()) != null) {
                    throw ApiErrors.badRequest(
                            com.habdiallo.contribo.api.generated.model.ErrorCode.VALIDATION_ERROR,
                            "Une catégorie ne peut apparaître qu'une seule fois dans le barème.");
                }
            }
        }
        if (amounts.isEmpty()) {
            throw ApiErrors.badRequest(
                    com.habdiallo.contribo.api.generated.model.ErrorCode.VALIDATION_ERROR,
                    "Le barème doit contenir au moins une catégorie.");
        }
        return amounts;
    }
}
