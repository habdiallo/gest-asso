package com.habdiallo.contribo.application.users;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.PageMetadata;
import com.habdiallo.contribo.api.generated.model.PersonSummary;
import com.habdiallo.contribo.api.generated.model.UpdateUserAccessRequest;
import com.habdiallo.contribo.api.generated.model.TemporaryCredentials;
import com.habdiallo.contribo.api.generated.model.UserAccount;
import com.habdiallo.contribo.api.generated.model.UserAccountPage;
import com.habdiallo.contribo.api.generated.model.UserRole;
import com.habdiallo.contribo.application.access.AuthorizationService;
import com.habdiallo.contribo.application.access.BusinessConflictException;
import com.habdiallo.contribo.application.access.ResourceNotFoundException;
import com.habdiallo.contribo.application.auth.TemporaryPasswordGenerator;
import com.habdiallo.contribo.security.RevokedTokenRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserAccountService {

    private final UserAccountRepository repository;
    private final AuthorizationService authorizationService;
    private final PasswordEncoder passwordEncoder;
    private final TemporaryPasswordGenerator temporaryPasswordGenerator;
    private final RevokedTokenRegistry revokedTokenRegistry;

    public UserAccountService(
            UserAccountRepository repository,
            AuthorizationService authorizationService,
            PasswordEncoder passwordEncoder,
            TemporaryPasswordGenerator temporaryPasswordGenerator,
            RevokedTokenRegistry revokedTokenRegistry) {
        this.repository = repository;
        this.authorizationService = authorizationService;
        this.passwordEncoder = passwordEncoder;
        this.temporaryPasswordGenerator = temporaryPasswordGenerator;
        this.revokedTokenRegistry = revokedTokenRegistry;
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

    @Transactional
    public TemporaryCredentials resetCredentials(UUID actorId, UUID userId) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        UserAccountRecord account = repository.findById(actor.associationId(), userId)
                .orElseThrow(ResourceNotFoundException::new);
        String temporaryPassword = temporaryPasswordGenerator.generate();
        if (!repository.updateCredentials(
                actor.associationId(), userId, passwordEncoder.encode(temporaryPassword))) {
            throw new ResourceNotFoundException();
        }
        revokedTokenRegistry.revokeUser(userId);
        return new TemporaryCredentials(account.identifier(), temporaryPassword);
    }

    private UserAccount toModel(UserAccountRecord account) {
        return new UserAccount(
                account.id(),
                UserRole.fromValue(account.role()),
                account.operatorCanRecordPayments(),
                account.active(),
                new PersonSummary(account.memberId(), account.firstName() + " " + account.lastName()))
                .mustChangePassword(account.mustChangePassword());
    }
}
