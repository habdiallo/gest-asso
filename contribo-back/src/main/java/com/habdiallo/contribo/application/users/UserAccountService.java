package com.habdiallo.contribo.application.users;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.PageMetadata;
import com.habdiallo.contribo.api.generated.model.PersonSummary;
import com.habdiallo.contribo.api.generated.model.UpdateUserAccessRequest;
import com.habdiallo.contribo.api.generated.model.UserAccount;
import com.habdiallo.contribo.api.generated.model.UserAccountPage;
import com.habdiallo.contribo.api.generated.model.UserRole;
import com.habdiallo.contribo.application.access.AuthorizationService;
import com.habdiallo.contribo.application.access.BusinessConflictException;
import com.habdiallo.contribo.application.access.ResourceNotFoundException;

@Service
public class UserAccountService {

    private final UserAccountRepository repository;
    private final AuthorizationService authorizationService;

    public UserAccountService(
            UserAccountRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    public UserAccountPage list(UUID actorId, Integer page, Integer size, String query, UserRole role) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        int pageNumber = page == null ? 0 : page;
        int pageSize = size == null ? 20 : size;
        List<UserAccount> items = repository.findPage(
                        actor.associationId(), pageNumber, pageSize, query, role)
                .stream()
                .map(this::toModel)
                .toList();
        long total = repository.count(actor.associationId(), query, role);
        int totalPages = total == 0 ? 0 : Math.toIntExact((total + pageSize - 1) / pageSize);
        return new UserAccountPage(items, new PageMetadata(pageNumber, pageSize, total, totalPages));
    }

    public UserAccount get(UUID actorId, UUID userId) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        return toModel(repository.findById(actor.associationId(), userId)
                .orElseThrow(ResourceNotFoundException::new));
    }

    @Transactional
    public UserAccount updateAccess(UUID actorId, UUID userId, UpdateUserAccessRequest request) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        repository.findById(actor.associationId(), userId)
                .orElseThrow(ResourceNotFoundException::new);
        if (request.getRole() != UserRole.OPERATOR && request.getOperatorCanRecordPayments()) {
            throw new BusinessConflictException(
                    ErrorCode.INVALID_OPERATOR_CONFIGURATION,
                    "L'autorisation de saisie financière est réservée aux Opérateurs.");
        }
        if (!repository.updateAccess(
                actor.associationId(),
                userId,
                request.getRole().getValue(),
                request.getOperatorCanRecordPayments())) {
            throw new ResourceNotFoundException();
        }
        return get(actorId, userId);
    }

    private UserAccount toModel(UserAccountRecord account) {
        return new UserAccount(
                account.id(),
                UserRole.fromValue(account.role()),
                account.operatorCanRecordPayments(),
                account.active(),
                new PersonSummary(account.memberId(), account.firstName() + " " + account.lastName()));
    }
}
