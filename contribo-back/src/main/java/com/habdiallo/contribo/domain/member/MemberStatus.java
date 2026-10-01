package com.habdiallo.contribo.domain.member;

/** Lifecycle state of a member. */
public enum MemberStatus {
    ACTIVE,
    INACTIVE;

    public static MemberStatus fromValue(String value) {
        for (MemberStatus status : values()) {
            if (status.name().equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unexpected member status '" + value + "'");
    }

    public String getValue() {
        return name();
    }
}
