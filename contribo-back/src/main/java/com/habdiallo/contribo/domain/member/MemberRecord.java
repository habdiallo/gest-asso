package com.habdiallo.contribo.domain.member;

import java.time.OffsetDateTime;
import java.util.UUID;

/** Member aggregate snapshot returned by the persistence port. */
public record MemberRecord(
        UUID id,
        UUID associationId,
        String currency,
        String firstName,
        String lastName,
        String preferredName,
        String country,
        String city,
        String phone,
        UUID incomeCategoryId,
        String incomeCategoryLabel,
        String associationFunction,
        String status,
        UUID accountId,
        String accountRole,
        boolean operatorCanRecordPayments,
        boolean accountActive,
        boolean mustChangePassword,
        long totalDueAmount,
        long totalPaidAmount,
        OffsetDateTime updatedAt) {
}
