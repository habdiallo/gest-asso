package com.habdiallo.contribo.application.users;

import java.util.UUID;

public record UserAccountRecord(
        UUID id,
        UUID memberId,
        String firstName,
        String lastName,
        String role,
        boolean operatorCanRecordPayments,
        boolean active) {
}
