package com.habdiallo.contribo.application.members;

import java.util.UUID;

import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;

public interface MemberDuesRepository {

    boolean exists(UUID associationId, UUID memberId);

    DuePage findPage(UUID associationId, UUID memberId, int page, int size, DueStatus status);
}
