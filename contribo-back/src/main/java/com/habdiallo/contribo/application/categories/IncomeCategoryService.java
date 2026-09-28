package com.habdiallo.contribo.application.categories;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.habdiallo.contribo.api.generated.model.ErrorCode;
import com.habdiallo.contribo.api.generated.model.IncomeCategory;
import com.habdiallo.contribo.api.generated.model.IncomeCategoryRequest;
import com.habdiallo.contribo.application.access.AuthorizationService;
import com.habdiallo.contribo.application.access.BusinessConflictException;
import com.habdiallo.contribo.application.access.ResourceNotFoundException;
import com.habdiallo.contribo.api.generated.model.UserRole;

@Service
public class IncomeCategoryService {

    private final IncomeCategoryRepository repository;
    private final AuthorizationService authorizationService;

    public IncomeCategoryService(
            IncomeCategoryRepository repository, AuthorizationService authorizationService) {
        this.repository = repository;
        this.authorizationService = authorizationService;
    }

    public List<IncomeCategory> list(UUID actorId) {
        var actor = authorizationService.requireAuthenticated(actorId);
        return repository.findAll(actor.associationId()).stream().map(this::toModel).toList();
    }

    public IncomeCategory get(UUID actorId, UUID categoryId) {
        var actor = authorizationService.requireAuthenticated(actorId);
        return toModel(repository.findById(actor.associationId(), categoryId)
                .orElseThrow(ResourceNotFoundException::new));
    }

    @Transactional
    public IncomeCategory create(UUID actorId, IncomeCategoryRequest request) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        String label = normalize(request.getLabel());
        ensureLabelAvailable(actor.associationId(), label, null);
        UUID categoryId = repository.create(actor.associationId(), label);
        return get(actorId, categoryId);
    }

    @Transactional
    public IncomeCategory update(UUID actorId, UUID categoryId, IncomeCategoryRequest request) {
        var actor = authorizationService.requireRole(actorId, UserRole.ADMINISTRATOR);
        repository.findById(actor.associationId(), categoryId)
                .orElseThrow(ResourceNotFoundException::new);
        String label = normalize(request.getLabel());
        ensureLabelAvailable(actor.associationId(), label, categoryId);
        repository.update(actor.associationId(), categoryId, label);
        return get(actorId, categoryId);
    }

    private void ensureLabelAvailable(UUID associationId, String label, UUID excludedId) {
        if (label.isBlank()) {
            throw new BusinessConflictException(
                    ErrorCode.VALIDATION_ERROR, "Le libellé de la catégorie est obligatoire.");
        }
        if (repository.existsByLabel(associationId, label, excludedId)) {
            throw new BusinessConflictException(
                    ErrorCode.DUPLICATE_CATEGORY_LABEL, "Une catégorie porte déjà ce libellé.");
        }
    }

    private String normalize(String label) {
        return label == null ? "" : label.trim();
    }

    private IncomeCategory toModel(IncomeCategoryRecord category) {
        return new IncomeCategory(
                category.id(), category.label(), category.memberCount(), category.updatedAt());
    }
}
