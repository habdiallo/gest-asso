package com.habdiallo.contribo.domain.access;

/** Application role used by authorization rules. */
public enum UserRole {
    ADMINISTRATOR,
    TREASURER,
    OPERATOR,
    MEMBER;

    public static UserRole fromValue(String value) {
        for (UserRole role : values()) {
            if (role.name().equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unexpected user role '" + value + "'");
    }

    public String getValue() {
        return name();
    }
}
