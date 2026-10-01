package com.habdiallo.contribo.application.members;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.habdiallo.contribo.api.generated.model.CurrencyCode;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.api.generated.model.FieldError;
import com.habdiallo.contribo.api.generated.model.IncomeCategorySummary;
import com.habdiallo.contribo.api.generated.model.MemberCountSummary;
import com.habdiallo.contribo.api.generated.model.MemberDetails;
import com.habdiallo.contribo.api.generated.model.MemberCreationResponse;
import com.habdiallo.contribo.api.generated.model.MemberFinancialSummary;
import com.habdiallo.contribo.api.generated.model.MemberPage;
import com.habdiallo.contribo.api.generated.model.MemberStatus;
import com.habdiallo.contribo.api.generated.model.MemberSummary;
import com.habdiallo.contribo.api.generated.model.PageMetadata;
import com.habdiallo.contribo.api.generated.model.UpdateMemberContactRequest;
import com.habdiallo.contribo.api.generated.model.UpdateMemberRequest;
import com.habdiallo.contribo.application.access.AuthorizationService;
import com.habdiallo.contribo.application.access.BusinessConflictException;
import com.habdiallo.contribo.application.access.ResourceNotFoundException;
import com.habdiallo.contribo.api.generated.model.CreateMemberRequest;
import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.UserAccountSummary;
import com.habdiallo.contribo.api.generated.model.TemporaryCredentials;
import com.habdiallo.contribo.application.auth.TemporaryPasswordGenerator;
import com.habdiallo.contribo.domain.access.UserRole;
import com.habdiallo.contribo.domain.member.MemberRecord;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final MemberDuesRepository memberDuesRepository;
    private final AuthorizationService authorizationService;
    private final PasswordEncoder passwordEncoder;
    private final TemporaryPasswordGenerator temporaryPasswordGenerator;

    public MemberService(
            MemberRepository memberRepository,
            MemberDuesRepository memberDuesRepository,
            AuthorizationService authorizationService,
            PasswordEncoder passwordEncoder,
            TemporaryPasswordGenerator temporaryPasswordGenerator) {
        this.memberRepository = memberRepository;
        this.memberDuesRepository = memberDuesRepository;
        this.authorizationService = authorizationService;
        this.passwordEncoder = passwordEncoder;
        this.temporaryPasswordGenerator = temporaryPasswordGenerator;
    }

    public MemberPage list(
            UUID actorId, Integer page, Integer size, String query, MemberStatus status) {
        var actor = authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER, UserRole.OPERATOR);
        int pageNumber = page == null ? 0 : page;
        int pageSize = size == null ? 20 : size;
        List<MemberSummary> items = memberRepository.findPage(
                        actor.associationId(), pageNumber, pageSize, query, toDomainStatus(status))
                .stream()
                .map(this::toSummary)
                .toList();
        long total = memberRepository.count(
                actor.associationId(), query, toDomainStatus(status));
        return new MemberPage(
                items,
                new MemberCountSummary(
                        Math.toIntExact(memberRepository.countAll(actor.associationId())),
                        Math.toIntExact(memberRepository.countByStatus(actor.associationId(), "ACTIVE")),
                        Math.toIntExact(memberRepository.countByStatus(actor.associationId(), "INACTIVE"))),
                pageMetadata(pageNumber, pageSize, total));
    }

    public MemberDetails get(UUID actorId, UUID memberId) {
        var actor = authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER, UserRole.OPERATOR);
        return toDetails(find(actor.associationId(), memberId));
    }

    public DuePage listDues(UUID actorId, UUID memberId, Integer page, Integer size, DueStatus status) {
        var actor = authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER, UserRole.OPERATOR);
        if (!memberDuesRepository.exists(actor.associationId(), memberId)) {
            throw new ResourceNotFoundException();
        }
        return toApiDuePage(memberDuesRepository.findPage(
                actor.associationId(), memberId, page == null ? 0 : page, size == null ? 20 : size,
                toDomainDueStatus(status)));
    }

    @Transactional
    public MemberCreationResponse create(UUID actorId, CreateMemberRequest request) {
        var actor = authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER);
        if (!memberRepository.incomeCategoryExists(actor.associationId(), request.getIncomeCategoryId())) {
            throw new BusinessConflictException(
                    ErrorCode.VALIDATION_ERROR,
                    "La catégorie de revenu est invalide.",
                    List.of(new FieldError(
                            "incomeCategoryId", "VALIDATION_ERROR", "La catégorie de revenu est inconnue.")));
        }
        String identifier = request.getPhone() == null || request.getPhone().isBlank()
                ? "member-" + UUID.randomUUID()
                : request.getPhone();
        String temporaryPassword = temporaryPasswordGenerator.generate();
        String passwordHash = passwordEncoder.encode(temporaryPassword);
        UUID memberId = memberRepository.create(
                actor.associationId(),
                request.getFirstName(),
                request.getLastName(),
                request.getPreferredName(),
                request.getCountry(),
                request.getCity(),
                request.getPhone(),
                request.getIncomeCategoryId(),
                request.getAssociationFunction(),
                identifier,
                passwordHash,
                true);
        return new MemberCreationResponse(
                toDetails(find(actor.associationId(), memberId)),
                new TemporaryCredentials(identifier, temporaryPassword));
    }

    @Transactional
    public MemberDetails update(
            UUID actorId, UUID memberId, UpdateMemberRequest request, boolean preferredNamePresent) {
        var actor = authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER);
        MemberRecord existing = find(actor.associationId(), memberId);
        if (request.getIncomeCategoryId() != null
                && !memberRepository.incomeCategoryExists(actor.associationId(), request.getIncomeCategoryId())) {
            throw new ResourceNotFoundException();
        }
        if (!preferredNamePresent && allNull(
                request.getFirstName(), request.getLastName(), request.getCountry(), request.getCity(),
                request.getPhone(), request.getIncomeCategoryId(), request.getAssociationFunction())) {
            throw new BusinessConflictException(
                    ErrorCode.VALIDATION_ERROR, "La requête doit modifier au moins un champ.");
        }
        memberRepository.update(
                actor.associationId(),
                memberId,
                value(request.getFirstName(), existing.firstName()),
                value(request.getLastName(), existing.lastName()),
                preferredNamePresent ? request.getPreferredName() : existing.preferredName(),
                value(request.getCountry(), existing.country()),
                value(request.getCity(), existing.city()),
                value(request.getPhone(), existing.phone()),
                value(request.getIncomeCategoryId(), existing.incomeCategoryId()),
                value(request.getAssociationFunction(), existing.associationFunction()));
        return toDetails(find(actor.associationId(), existing.id()));
    }

    @Transactional
    public MemberDetails updateContact(
            UUID actorId, UUID memberId, UpdateMemberContactRequest request, boolean preferredNamePresent) {
        var actor = authorizationService.requireRole(
                actorId, UserRole.ADMINISTRATOR, UserRole.TREASURER, UserRole.OPERATOR);
        MemberRecord existing = find(actor.associationId(), memberId);
        if (!preferredNamePresent
                && request.getPreferredName() == null && request.getCountry() == null
                && request.getCity() == null && request.getPhone() == null) {
            throw new BusinessConflictException(
                    ErrorCode.VALIDATION_ERROR, "La requête doit modifier au moins un champ.");
        }
        memberRepository.update(
                actor.associationId(),
                memberId,
                existing.firstName(),
                existing.lastName(),
                preferredNamePresent ? request.getPreferredName() : existing.preferredName(),
                value(request.getCountry(), existing.country()),
                value(request.getCity(), existing.city()),
                value(request.getPhone(), existing.phone()),
                existing.incomeCategoryId(),
                existing.associationFunction());
        return toDetails(find(actor.associationId(), existing.id()));
    }

    @Transactional
    public MemberDetails deactivate(UUID actorId, UUID memberId) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        find(actor.associationId(), memberId);
        if (!memberRepository.updateStatus(actor.associationId(), memberId, "ACTIVE", "INACTIVE")) {
            throw new BusinessConflictException(
                    ErrorCode.MEMBER_ALREADY_INACTIVE, "Le membre est déjà inactif.");
        }
        return toDetails(find(actor.associationId(), memberId));
    }

    @Transactional
    public MemberDetails reactivate(UUID actorId, UUID memberId) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        find(actor.associationId(), memberId);
        if (!memberRepository.updateStatus(actor.associationId(), memberId, "INACTIVE", "ACTIVE")) {
            throw new BusinessConflictException(
                    ErrorCode.MEMBER_ALREADY_ACTIVE, "Le membre est déjà actif.");
        }
        return toDetails(find(actor.associationId(), memberId));
    }

    private MemberRecord find(UUID associationId, UUID memberId) {
        return memberRepository.findById(associationId, memberId)
                .orElseThrow(ResourceNotFoundException::new);
    }

    private MemberSummary toSummary(MemberRecord member) {
        return new MemberSummary(
                member.id(),
                member.firstName(),
                member.lastName(),
                displayName(member),
                new IncomeCategorySummary(member.incomeCategoryId(), member.incomeCategoryLabel()),
                MemberStatus.fromValue(member.status()))
                .preferredName(member.preferredName())
                .country(member.country())
                .city(member.city())
                .phone(member.phone())
                .associationFunction(member.associationFunction());
    }

    private MemberDetails toDetails(MemberRecord member) {
        UserAccountSummary account = new UserAccountSummary(
                member.accountId(),
                com.habdiallo.contribo.api.generated.model.UserRole.fromValue(member.accountRole()),
                member.operatorCanRecordPayments(),
                member.accountActive())
                .mustChangePassword(member.mustChangePassword());
        long remaining = Math.max(0L, member.totalDueAmount() - member.totalPaidAmount());
        MemberFinancialSummary financialSummary = new MemberFinancialSummary(
                member.totalDueAmount(), member.totalPaidAmount(), remaining,
                CurrencyCode.fromValue(member.currency()));
        MemberSummary summary = toSummary(member);
        return new MemberDetails(
                summary.getId(),
                summary.getFirstName(),
                summary.getLastName(),
                summary.getDisplayName(),
                summary.getIncomeCategory(),
                summary.getStatus(),
                account,
                financialSummary)
                .preferredName(summary.getPreferredName())
                .country(summary.getCountry())
                .city(summary.getCity())
                .phone(summary.getPhone())
                .associationFunction(summary.getAssociationFunction());
    }

    private PageMetadata pageMetadata(int page, int size, long total) {
        int pages = total == 0 ? 0 : Math.toIntExact((total + size - 1) / size);
        return new PageMetadata(page, size, total, pages);
    }

    private String displayName(MemberRecord member) {
        return member.preferredName() == null || member.preferredName().isBlank()
                ? member.firstName() + " " + member.lastName()
                : member.preferredName() + " " + member.lastName();
    }

    private boolean allNull(Object... values) {
        for (Object value : values) {
            if (value != null) {
                return false;
            }
        }
        return true;
    }

    private <T> T value(T candidate, T existing) {
        return candidate == null ? existing : candidate;
    }

    private com.habdiallo.contribo.domain.member.MemberStatus toDomainStatus(
            com.habdiallo.contribo.api.generated.model.MemberStatus status) {
        return status == null ? null
                : com.habdiallo.contribo.domain.member.MemberStatus.fromValue(status.getValue());
    }

    private com.habdiallo.contribo.domain.campaign.DueStatus toDomainDueStatus(
            com.habdiallo.contribo.api.generated.model.DueStatus status) {
        return status == null ? null
                : com.habdiallo.contribo.domain.campaign.DueStatus.fromValue(status.getValue());
    }

    private com.habdiallo.contribo.api.generated.model.DuePage toApiDuePage(
            com.habdiallo.contribo.domain.campaign.DuePage page) {
        return new com.habdiallo.contribo.api.generated.model.DuePage(
                page.items().stream().map(this::toApiDue).toList(),
                new com.habdiallo.contribo.api.generated.model.PageMetadata(
                        page.page().page(), page.page().size(), page.page().totalElements(),
                        page.page().totalPages()));
    }

    private com.habdiallo.contribo.api.generated.model.Due toApiDue(
            com.habdiallo.contribo.domain.campaign.Due due) {
        return new com.habdiallo.contribo.api.generated.model.Due(
                due.id(),
                new com.habdiallo.contribo.api.generated.model.PersonSummary(
                        due.member().id(), due.member().displayName()),
                new com.habdiallo.contribo.api.generated.model.CampaignReference(
                        due.campaign().id(), due.campaign().name(), due.campaign().startDate(),
                        due.campaign().endDate(),
                        com.habdiallo.contribo.api.generated.model.CampaignStatus.fromValue(
                                due.campaign().status().name())),
                new com.habdiallo.contribo.api.generated.model.IncomeCategorySummary(
                        due.category().id(), due.category().label()),
                due.dueAmount(), due.paidAmount(), due.remainingAmount(),
                com.habdiallo.contribo.api.generated.model.DueStatus.fromValue(due.status().name()),
                due.paymentCount(),
                com.habdiallo.contribo.api.generated.model.CurrencyCode.fromValue(
                        due.currency().getValue()));
    }

}
