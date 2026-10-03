package com.habdiallo.contribo.application.members;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.OffsetDateTime;

import com.habdiallo.contribo.domain.member.MemberRecord;
import com.habdiallo.contribo.domain.member.MemberStatus;

public interface MemberRepository {

    List<MemberRecord> findPage(
            UUID associationId, int page, int size, String query, MemberStatus status);

    long count(UUID associationId, String query, MemberStatus status);

    long countAll(UUID associationId);

    long countByStatus(UUID associationId, String status);

    long countCreatedSince(UUID associationId, OffsetDateTime from);

    Optional<MemberRecord> findById(UUID associationId, UUID memberId);

    boolean incomeCategoryExists(UUID associationId, UUID incomeCategoryId);

    boolean identifierExists(UUID associationId, String identifier);

    UUID create(UUID associationId, String firstName, String lastName, String preferredName,
            String country, String city, String phone, UUID incomeCategoryId, String associationFunction,
            String identifier, String passwordHash, boolean mustChangePassword);

    void update(UUID associationId, UUID memberId, String firstName, String lastName, String preferredName,
            String country, String city, String phone, UUID incomeCategoryId, String associationFunction);

    boolean updateStatus(UUID associationId, UUID memberId, String expectedStatus, String newStatus);
}
