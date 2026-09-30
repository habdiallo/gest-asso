package com.habdiallo.contribo.domain.campaign;

public enum CampaignStatus {
    UPCOMING,
    OPEN,
    CLOSED;

    public static CampaignStatus fromValue(String value) {
        for (CampaignStatus status : values()) {
            if (status.name().equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unexpected campaign status '" + value + "'");
    }
}
