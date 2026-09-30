package com.habdiallo.contribo.outbound.persistence.campaign;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.api.generated.model.PaymentPage;
import com.habdiallo.contribo.application.campaign.CampaignPaymentRepository;
import com.habdiallo.contribo.application.campaign.CampaignRepository;

@Repository
public class JdbcCampaignPaymentRepository implements CampaignPaymentRepository {

    private final JdbcCampaignRepository delegate;

    public JdbcCampaignPaymentRepository(JdbcCampaignRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public CampaignRepository.PaymentCreation createPayment(
            UUID associationId,
            UUID dueId,
            UUID recordedBy,
            long amount,
            LocalDate paymentDate,
            String method) {
        return delegate.createPayment(associationId, dueId, recordedBy, amount, paymentDate, method);
    }

    @Override
    public PaymentPage findPayments(
            UUID associationId, int page, int size, String query, UUID memberId, UUID campaignId) {
        return delegate.findPayments(associationId, page, size, query, memberId, campaignId);
    }

    @Override
    public PaymentPage findRecentOpenPayments(UUID associationId, UUID campaignId) {
        return delegate.findRecentOpenPayments(associationId, campaignId);
    }
}
