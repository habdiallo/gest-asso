package com.habdiallo.contribo.application.campaign;

import java.time.LocalDate;
import java.util.UUID;

import com.habdiallo.contribo.api.generated.model.PaymentPage;

public interface CampaignPaymentRepository {

    CampaignRepository.PaymentCreation createPayment(
            UUID associationId,
            UUID dueId,
            UUID recordedBy,
            long amount,
            LocalDate paymentDate,
            String method);

    PaymentPage findPayments(UUID associationId, int page, int size, String query, UUID memberId, UUID campaignId);

    PaymentPage findRecentOpenPayments(UUID associationId, UUID campaignId);
}
