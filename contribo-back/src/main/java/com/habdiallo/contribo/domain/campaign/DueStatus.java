package com.habdiallo.contribo.domain.campaign;

public enum DueStatus {
    DUE,
    PARTIALLY_PAID,
    PAID,
    OVERDUE;

    public static DueStatus fromValue(String value) {
        for (DueStatus status : values()) {
            if (status.name().equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unexpected due status '" + value + "'");
    }

    public String getValue() {
        return name();
    }
}
