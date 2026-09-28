package com.habdiallo.contribo.application.categories;

import java.time.OffsetDateTime;
import java.util.UUID;

public record IncomeCategoryRecord(
        UUID id, String label, int memberCount, OffsetDateTime updatedAt) {
}
