package com.habdiallo.contribo.application.auth;

import java.util.UUID;

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
        boolean operatorCanRecordPayments) {
}
