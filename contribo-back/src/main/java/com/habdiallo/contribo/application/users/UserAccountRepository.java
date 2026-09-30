package com.habdiallo.contribo.application.users;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.habdiallo.contribo.domain.access.UserRole;
import com.habdiallo.contribo.domain.user.UserAccountRecord;

public interface UserAccountRepository {

    List<UserAccountRecord> findPage(UUID associationId, int page, int size, String query, UserRole role);

    long count(UUID associationId, String query, UserRole role);

    Optional<UserAccountRecord> findById(UUID associationId, UUID userId);

    boolean updateAccess(UUID associationId, UUID userId, String role, boolean operatorCanRecordPayments);

    boolean updateCredentials(UUID associationId, UUID userId, String passwordHash);
}
