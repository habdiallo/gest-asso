package com.habdiallo.contribo.domain.user;

import java.util.UUID;

/** User account data returned by the persistence port. */
public record UserAccountRecord(
        UUID id,
        UUID memberId,
        String identifier,
        String firstName,
        String lastName,
        String role,
        boolean operatorCanRecordPayments,
        boolean active,
        boolean mustChangePassword) {
}
