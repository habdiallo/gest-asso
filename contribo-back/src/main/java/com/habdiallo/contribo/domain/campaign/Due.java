package com.habdiallo.contribo.domain.campaign;

import java.util.UUID;

import com.habdiallo.contribo.domain.category.IncomeCategorySummary;
import com.habdiallo.contribo.domain.shared.CurrencyCode;

public record Due(
        UUID id,
        PersonSummary member,
        CampaignReference campaign,
        IncomeCategorySummary category,
        long dueAmount,
        long paidAmount,
        long remainingAmount,
        DueStatus status,
        int paymentCount,
        CurrencyCode currency) {
}
