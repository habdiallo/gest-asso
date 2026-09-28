package com.habdiallo.contribo.application.socialfund;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.habdiallo.contribo.api.generated.model.AuditActor;
import com.habdiallo.contribo.api.generated.model.Contribution;
import com.habdiallo.contribo.api.generated.model.ContributionCreationResponse;
import com.habdiallo.contribo.api.generated.model.ContributionPage;
import com.habdiallo.contribo.api.generated.model.CreateContributionRequest;
import com.habdiallo.contribo.api.generated.model.CreateSocialFundRequest;
import com.habdiallo.contribo.api.generated.model.CurrencyCode;
import com.habdiallo.contribo.api.generated.model.ExternalContributor;
import com.habdiallo.contribo.api.generated.model.PageMetadata;
import com.habdiallo.contribo.api.generated.model.PersonSummary;
import com.habdiallo.contribo.api.generated.model.SocialEventType;
import com.habdiallo.contribo.api.generated.model.SocialFund;
import com.habdiallo.contribo.api.generated.model.SocialFundPage;
import com.habdiallo.contribo.api.generated.model.SocialFundReference;
import com.habdiallo.contribo.api.generated.model.SocialFundStatus;
import com.habdiallo.contribo.api.generated.model.SocialFundSummary;
import com.habdiallo.contribo.api.generated.model.UserRole;
import com.habdiallo.contribo.application.auth.AuthenticatedAccount;
import com.habdiallo.contribo.application.auth.AuthenticationAccountPort;
import com.habdiallo.contribo.application.common.PageResult;

@Service
public class SocialFundService {

    private final SocialFundRepository repository;
    private final AuthenticationAccountPort accountRepository;

    public SocialFundService(
            SocialFundRepository repository,
            AuthenticationAccountPort accountRepository) {
        this.repository = repository;
        this.accountRepository = accountRepository;
    }

    public SocialFundPage listFunds(UUID userId, int page, int size, String query, SocialFundStatus status,
            SocialEventType eventType) {
        AuthenticatedAccount account = requireManager(userId, true);
        PageResult<SocialFundRepository.SocialFundData> result = repository.findFunds(
                account.associationId(), page, size, query,
                status == null ? null : status.getValue(),
                eventType == null ? null : eventType.getValue());
        return new SocialFundPage(result.items().stream().map(this::toSummary).toList(), pageMetadata(result));
    }

    @Transactional
    public SocialFund createFund(UUID userId, CreateSocialFundRequest request) {
        AuthenticatedAccount account = requireFundManager(userId);
        validateDateRange(request.getStartDate(), request.getEndDate());
        UUID fundId = repository.createFund(
                account.associationId(), request.getTitle(), request.getEventType().getValue(),
                request.getDescription(), request.getBeneficiary(), request.getStartDate(),
                request.getEndDate(), request.getTargetAmount());
        return toFund(repository.findFund(account.associationId(), fundId));
    }

    public SocialFund getFund(UUID userId, UUID fundId) {
        AuthenticatedAccount account = requireManager(userId, true);
        return toFund(requireFund(account.associationId(), fundId));
    }

    @Transactional
    public SocialFund closeFund(UUID userId, UUID fundId) {
        AuthenticatedAccount account = requireFundManager(userId);
        SocialFundRepository.SocialFundData fund = requireFund(account.associationId(), fundId);
        if ("CLOSED".equals(fund.status())) {
            throw conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.SOCIAL_FUND_ALREADY_CLOSED,
                    "La cagnotte est déjà clôturée.");
        }
        repository.closeFund(account.associationId(), fundId, userId, OffsetDateTime.now(ZoneOffset.UTC));
        return toFund(requireFund(account.associationId(), fundId));
    }

    @Transactional
    public ContributionCreationResponse createContribution(UUID userId, UUID fundId,
            CreateContributionRequest request) {
        AuthenticatedAccount account = requireContributionWriter(userId);
        SocialFundRepository.SocialFundData fund = requireFund(account.associationId(), fundId);
        if ("CLOSED".equals(fund.status())) {
            throw conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.RESOURCE_CLOSED,
                    "La cagnotte est clôturée et n'accepte plus de contribution.");
        }
        boolean hasMember = request.getMemberId() != null;
        boolean hasExternal = request.getExternalContributor() != null;
        if (hasMember == hasExternal) {
            throw validation("Une contribution doit contenir exactement une identité contributrice.");
        }
        if (hasMember && !memberBelongsToAssociation(account.associationId(), request.getMemberId())) {
            throw notFound("Le membre demandé est introuvable.");
        }
        ExternalContributor external = request.getExternalContributor();
        OffsetDateTime recordedAt = OffsetDateTime.now(ZoneOffset.UTC);
        UUID contributionId = repository.createContribution(
                account.associationId(), fundId, request.getMemberId(),
                external == null ? null : external.getFirstName().trim(),
                external == null ? null : external.getLastName().trim(),
                request.getAmount(), request.getContributionDate(), request.getMethod().getValue(),
                userId, recordedAt);
        Contribution contribution = toContribution(
                repository.findContribution(account.associationId(), contributionId));
        SocialFund updatedFund = toFund(requireFund(account.associationId(), fundId));
        return new ContributionCreationResponse(contribution, updatedFund);
    }

    public ContributionPage listContributions(UUID userId, int page, int size, String query,
            UUID memberId, UUID socialFundId) {
        AuthenticatedAccount account = requireManager(userId, false);
        PageResult<SocialFundRepository.ContributionData> result = repository.findContributions(
                account.associationId(), page, size, query, memberId, socialFundId);
        return new ContributionPage(result.items().stream().map(this::toContribution).toList(), pageMetadata(result));
    }

    public ContributionPage listFundContributions(UUID userId, UUID fundId, int page, int size, String query) {
        AuthenticatedAccount account = requireManager(userId, true);
        requireFund(account.associationId(), fundId);
        PageResult<SocialFundRepository.ContributionData> result = repository.findContributions(
                account.associationId(), page, size, query, null, fundId);
        return new ContributionPage(result.items().stream().map(this::toContribution).toList(), pageMetadata(result));
    }

    public Contribution getContribution(UUID userId, UUID contributionId) {
        AuthenticatedAccount account = requireAccount(userId);
        SocialFundRepository.ContributionData contribution = requireContribution(account.associationId(), contributionId);
        if (role(account) == UserRole.MEMBER && !account.memberId().equals(contribution.memberId())) {
            throw forbidden();
        }
        if (role(account) == UserRole.MEMBER) {
            return toContribution(contribution);
        }
        requireManager(userId, false);
        return toContribution(contribution);
    }

    public ContributionPage listMyContributions(UUID userId, int page, int size) {
        AuthenticatedAccount account = requireAccount(userId);
        PageResult<SocialFundRepository.ContributionData> result = repository.findContributions(
                account.associationId(), page, size, null, account.memberId(), null);
        return new ContributionPage(result.items().stream().map(this::toContribution).toList(), pageMetadata(result));
    }

    private boolean memberBelongsToAssociation(UUID associationId, UUID memberId) {
        return repository.memberExists(associationId, memberId);
    }

    private AuthenticatedAccount requireAccount(UUID userId) {
        return accountRepository.findById(userId)
                .filter(AuthenticatedAccount::active)
                .orElseThrow(() -> new SocialFundException(HttpStatus.UNAUTHORIZED,
                        com.habdiallo.contribo.api.generated.model.ErrorCode.AUTHENTICATION_REQUIRED,
                        "Authentification requise."));
    }

    private AuthenticatedAccount requireManager(UUID userId, boolean operatorPermissionRequired) {
        AuthenticatedAccount account = requireAccount(userId);
        UserRole role = role(account);
        boolean allowed = role == UserRole.ADMINISTRATOR || role == UserRole.TREASURER
                || (role == UserRole.OPERATOR && (!operatorPermissionRequired || account.operatorCanRecordPayments()));
        if (!allowed) {
            throw forbidden();
        }
        return account;
    }

    private AuthenticatedAccount requireFundManager(UUID userId) {
        AuthenticatedAccount account = requireAccount(userId);
        UserRole role = role(account);
        if (role != UserRole.ADMINISTRATOR && role != UserRole.TREASURER) {
            throw forbidden();
        }
        return account;
    }

    private AuthenticatedAccount requireContributionWriter(UUID userId) {
        AuthenticatedAccount account = requireAccount(userId);
        UserRole role = role(account);
        if (role != UserRole.ADMINISTRATOR && role != UserRole.TREASURER
                && !(role == UserRole.OPERATOR && account.operatorCanRecordPayments())) {
            throw forbidden();
        }
        return account;
    }

    private UserRole role(AuthenticatedAccount account) {
        return UserRole.fromValue(account.role());
    }

    private SocialFundRepository.SocialFundData requireFund(UUID associationId, UUID fundId) {
        SocialFundRepository.SocialFundData fund = repository.findFund(associationId, fundId);
        if (fund == null) {
            throw notFound("La cagnotte demandée est introuvable.");
        }
        return fund;
    }

    private SocialFundRepository.ContributionData requireContribution(UUID associationId, UUID contributionId) {
        SocialFundRepository.ContributionData contribution = repository.findContribution(associationId, contributionId);
        if (contribution == null) {
            throw notFound("La contribution demandée est introuvable.");
        }
        return contribution;
    }

    private SocialFundSummary toSummary(SocialFundRepository.SocialFundData data) {
        SocialFundSummary summary = new SocialFundSummary(
                data.id(), data.title(), SocialEventType.fromValue(data.eventType()), data.beneficiary(),
                data.startDate(), data.endDate(), SocialFundStatus.fromValue(data.status()), data.collectedAmount(),
                data.contributorCount(), data.contributionCount(), CurrencyCode.fromValue(data.currency()));
        return addProgress(summary, data);
    }

    private SocialFund toFund(SocialFundRepository.SocialFundData data) {
        SocialFund fund = new SocialFund(
                data.id(), data.title(), SocialEventType.fromValue(data.eventType()), data.beneficiary(),
                data.startDate(), data.endDate(), SocialFundStatus.fromValue(data.status()), data.collectedAmount(),
                data.contributorCount(), data.contributionCount(), CurrencyCode.fromValue(data.currency()));
        fund.setDescription(data.description());
        return addProgress(fund, data);
    }

    private SocialFundSummary addProgress(SocialFundSummary model, SocialFundRepository.SocialFundData data) {
        if (data.targetAmount() != null) {
            long remaining = Math.max(0, data.targetAmount() - data.collectedAmount());
            double rate = BigDecimal.valueOf(data.collectedAmount())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(data.targetAmount()), 2, RoundingMode.HALF_UP)
                    .doubleValue();
            model.setTargetAmount(data.targetAmount());
            model.setRemainingToTargetAmount(remaining);
            model.setProgressRate(rate);
        }
        return model;
    }

    private SocialFund addProgress(SocialFund model, SocialFundRepository.SocialFundData data) {
        if (data.targetAmount() != null) {
            long remaining = Math.max(0, data.targetAmount() - data.collectedAmount());
            double rate = BigDecimal.valueOf(data.collectedAmount())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(data.targetAmount()), 2, RoundingMode.HALF_UP)
                    .doubleValue();
            model.setTargetAmount(data.targetAmount());
            model.setRemainingToTargetAmount(remaining);
            model.setProgressRate(rate);
        }
        return model;
    }

    private Contribution toContribution(SocialFundRepository.ContributionData data) {
        PersonSummary member = data.memberId() == null ? null
                : new PersonSummary(data.memberId(), data.memberDisplayName());
        ExternalContributor external = data.externalFirstName() == null ? null
                : new ExternalContributor(data.externalFirstName(), data.externalLastName());
        SocialFundReference fund = new SocialFundReference(
                data.socialFundId(), data.socialFundTitle(), SocialEventType.fromValue(data.socialFundEventType()),
                SocialFundStatus.fromValue(data.socialFundStatus()));
        return new Contribution(
                data.id(), member, external, fund, data.amount(), data.contributionDate(),
                com.habdiallo.contribo.api.generated.model.PaymentMethod.fromValue(data.method()),
                new AuditActor(data.recordedBy(), data.recordedByDisplayName()), data.recordedAt(),
                CurrencyCode.fromValue(data.currency()));
    }

    private PageMetadata pageMetadata(PageResult<?> result) {
        return new PageMetadata(result.page(), result.size(), result.totalElements(), result.totalPages());
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw validation("La date de fin doit être postérieure ou égale à la date de début.",
                    com.habdiallo.contribo.api.generated.model.ErrorCode.DATE_RANGE_INVALID);
        }
    }

    private SocialFundException validation(String message) {
        return validation(message, com.habdiallo.contribo.api.generated.model.ErrorCode.VALIDATION_ERROR);
    }

    private SocialFundException validation(String message, com.habdiallo.contribo.api.generated.model.ErrorCode code) {
        return new SocialFundException(HttpStatus.BAD_REQUEST, code, message);
    }

    private SocialFundException notFound(String message) {
        return new SocialFundException(HttpStatus.NOT_FOUND,
                com.habdiallo.contribo.api.generated.model.ErrorCode.RESOURCE_NOT_FOUND, message);
    }

    private SocialFundException forbidden() {
        return new SocialFundException(HttpStatus.FORBIDDEN,
                com.habdiallo.contribo.api.generated.model.ErrorCode.ACCESS_DENIED,
                "Le rôle ou l'autorisation du compte ne permet pas cette action.");
    }

    private SocialFundException conflict(com.habdiallo.contribo.api.generated.model.ErrorCode code, String message) {
        return new SocialFundException(HttpStatus.CONFLICT, code, message);
    }
}
