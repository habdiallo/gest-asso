package com.habdiallo.contribo.domain.campaign;

import java.time.LocalDate;
import java.util.UUID;

public record CampaignReference(
        UUID id, String name, LocalDate startDate, LocalDate endDate, CampaignStatus status) {
}
