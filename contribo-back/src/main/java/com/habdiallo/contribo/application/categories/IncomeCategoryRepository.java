package com.habdiallo.contribo.application.categories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.habdiallo.contribo.domain.category.IncomeCategoryRecord;

public interface IncomeCategoryRepository {

    List<IncomeCategoryRecord> findAll(UUID associationId);

    Optional<IncomeCategoryRecord> findById(UUID associationId, UUID categoryId);

    boolean existsByLabel(UUID associationId, String label, UUID excludedId);

    UUID create(UUID associationId, String label);

    void update(UUID associationId, UUID categoryId, String label);
}
