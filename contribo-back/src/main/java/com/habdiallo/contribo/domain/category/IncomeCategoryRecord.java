package com.habdiallo.contribo.domain.category;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Income category data used by application use cases and persistence adapters. */
public record IncomeCategoryRecord(
        UUID id, String label, int memberCount, OffsetDateTime updatedAt) {
}
