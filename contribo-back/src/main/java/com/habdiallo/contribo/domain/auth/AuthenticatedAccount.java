package com.habdiallo.contribo.domain.auth;

import java.util.UUID;

/** Account and member data required by authentication and authorization use cases. */
public record AuthenticatedAccount(
        UUID userId,
        String passwordHash,
        boolean active,
        UUID associationId,
        String associationName,
        String currency,
        UUID memberId,
        String firstName,
        String lastName,
        String preferredName,
        String country,
        String city,
        String phone,
        String associationFunction,
        String memberStatus,
        UUID incomeCategoryId,
        String incomeCategoryLabel,
        String role,
        boolean operatorCanRecordPayments,
        boolean mustChangePassword) {
}
