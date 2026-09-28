package com.habdiallo.contribo.outbound.persistence.campaign;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.habdiallo.contribo.api.generated.model.AuditActor;
import com.habdiallo.contribo.api.generated.model.Campaign;
import com.habdiallo.contribo.api.generated.model.CampaignCategoryAmount;
import com.habdiallo.contribo.api.generated.model.CampaignFinancialSummary;
import com.habdiallo.contribo.api.generated.model.CampaignOpeningReadiness;
import com.habdiallo.contribo.api.generated.model.CampaignPage;
import com.habdiallo.contribo.api.generated.model.CampaignReference;
import com.habdiallo.contribo.api.generated.model.CampaignStatus;
import com.habdiallo.contribo.api.generated.model.CampaignSummary;
import com.habdiallo.contribo.api.generated.model.CurrencyCode;
import com.habdiallo.contribo.api.generated.model.Due;
import com.habdiallo.contribo.api.generated.model.DueCountSummary;
import com.habdiallo.contribo.api.generated.model.DueDetails;
import com.habdiallo.contribo.api.generated.model.DuePage;
import com.habdiallo.contribo.api.generated.model.DueStatus;
import com.habdiallo.contribo.api.generated.model.IncomeCategorySummary;
import com.habdiallo.contribo.api.generated.model.PageMetadata;
import com.habdiallo.contribo.api.generated.model.Payment;
import com.habdiallo.contribo.api.generated.model.PaymentPage;
import com.habdiallo.contribo.api.generated.model.PaymentMethod;
import com.habdiallo.contribo.api.rest.ApiErrors;
import com.habdiallo.contribo.application.campaign.CampaignRepository;

@Repository
public class JdbcCampaignRepository implements CampaignRepository {

    private static final RowMapper<CampaignSummaryRow> CAMPAIGN_SUMMARY_ROW = (rs, rowNum) ->
            new CampaignSummaryRow(
                    rs.getObject("id", UUID.class),
                    rs.getString("name"),
                    rs.getString("description"),
                    rs.getObject("start_date", LocalDate.class),
                    rs.getObject("end_date", LocalDate.class),
                    CampaignStatus.fromValue(rs.getString("status")),
                    rs.getInt("member_count"),
                    nullableOffsetDateTime(rs, "opened_at"),
                    nullableUuid(rs, "opened_by"),
                    nullableOffsetDateTime(rs, "closed_at"),
                    nullableUuid(rs, "closed_by"));

    private final JdbcTemplate jdbcTemplate;

    public JdbcCampaignRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public CampaignPage findCampaigns(UUID associationId, int page, int size, String query, CampaignStatus status) {
        List<Object> parameters = new ArrayList<>();
        String filters = campaignFilters(associationId, query, status, parameters);
        long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM campaigns c " + filters, Long.class, parameters.toArray());
        parameters.add(size);
        parameters.add(page * size);
        List<CampaignSummary> items = jdbcTemplate.query(
                "SELECT c.id, c.name, c.description, c.start_date, c.end_date, c.status, "
                        + "c.opened_at, c.opened_by, c.closed_at, c.closed_by, "
                        + "(SELECT COUNT(*) FROM dues d WHERE d.campaign_id = c.id) AS member_count "
                        + "FROM campaigns c " + filters
                        + " ORDER BY c.start_date DESC, c.created_at DESC LIMIT ? OFFSET ?",
                CAMPAIGN_SUMMARY_ROW,
                parameters.toArray()).stream().map(this::toCampaignSummary).toList();
        return new CampaignPage(items, pageMetadata(page, size, total));
    }

    @Override
    public Campaign createCampaign(
            UUID associationId,
            UUID campaignId,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            Map<UUID, Long> categoryAmounts) {
        List<MemberSeed> members = jdbcTemplate.query(
                "SELECT m.id, m.income_category_id, ic.label "
                        + "FROM members m JOIN income_categories ic ON ic.id = m.income_category_id "
                        + "WHERE m.association_id = ? AND m.status = 'ACTIVE' "
                        + "ORDER BY m.last_name, m.first_name",
                (rs, rowNum) -> new MemberSeed(
                        rs.getObject("id", UUID.class),
                        rs.getObject("income_category_id", UUID.class),
                        rs.getString("label")),
                associationId);
        validateCategories(associationId, categoryAmounts, members);
        jdbcTemplate.update(
                "INSERT INTO campaigns (id, association_id, name, description, start_date, end_date, status) "
                        + "VALUES (?, ?, ?, ?, ?, ?, 'UPCOMING')",
                campaignId, associationId, name, description, startDate, endDate);
        insertCategoryAmounts(campaignId, categoryAmounts);
        for (MemberSeed member : members) {
            jdbcTemplate.update(
                    "INSERT INTO dues (id, campaign_id, member_id, income_category_id, "
                            + "income_category_label_snapshot, due_amount, status) VALUES (?, ?, ?, ?, ?, ?, 'DUE')",
                    UUID.randomUUID(), campaignId, member.id(), member.categoryId(), member.categoryLabel(),
                    categoryAmounts.get(member.categoryId()));
        }
        return findCampaignDetails(associationId, campaignId);
    }

    @Override
    public Optional<CampaignState> findCampaignState(UUID associationId, UUID campaignId) {
        List<CampaignState> states = jdbcTemplate.query(
                "SELECT c.id, c.association_id, c.name, c.description, c.start_date, c.end_date, c.status, "
                        + "c.opened_at, c.opened_by, c.closed_at, c.closed_by, "
                        + "EXISTS (SELECT 1 FROM payments p JOIN dues d ON d.id = p.due_id WHERE d.campaign_id = c.id) AS has_payments, "
                        + "NOT EXISTS (SELECT 1 FROM dues d WHERE d.campaign_id = c.id AND d.due_amount <= 0) AS bareme_complete, "
                        + "NOT EXISTS (SELECT 1 FROM dues d WHERE d.campaign_id = c.id AND d.due_amount IS NULL) AS dues_ready "
                        + "FROM campaigns c WHERE c.id = ? AND c.association_id = ?",
                (rs, rowNum) -> new CampaignState(
                        rs.getObject("id", UUID.class),
                        rs.getObject("association_id", UUID.class),
                        rs.getString("name"),
                        rs.getString("description"),
                        rs.getObject("start_date", LocalDate.class),
                        rs.getObject("end_date", LocalDate.class),
                        CampaignStatus.fromValue(rs.getString("status")),
                        nullableOffsetDateTime(rs, "opened_at"),
                        nullableUuid(rs, "opened_by"),
                        nullableOffsetDateTime(rs, "closed_at"),
                        nullableUuid(rs, "closed_by"),
                        rs.getBoolean("has_payments"),
                        rs.getBoolean("bareme_complete"),
                        rs.getBoolean("dues_ready")),
                campaignId, associationId);
        return states.stream().findFirst();
    }

    @Override
    public Campaign findCampaignDetails(UUID associationId, UUID campaignId) {
        CampaignSummaryRow row = jdbcTemplate.query(
                "SELECT c.id, c.name, c.description, c.start_date, c.end_date, c.status, "
                        + "c.opened_at, c.opened_by, c.closed_at, c.closed_by, "
                        + "(SELECT COUNT(*) FROM dues d WHERE d.campaign_id = c.id) AS member_count "
                        + "FROM campaigns c WHERE c.id = ? AND c.association_id = ?",
                CAMPAIGN_SUMMARY_ROW, campaignId, associationId).stream().findFirst().orElseThrow(ApiErrors::notFound);
        Campaign campaign = new Campaign(
                row.id(), row.name(), row.startDate(), row.endDate(), row.status(), row.memberCount(),
                categoryAmounts(campaignId));
        campaign.setDescription(row.description());
        campaign.setOpenedAt(row.openedAt());
        campaign.setOpenedBy(actor(row.openedBy()));
        campaign.setFinancialSummary(financialSummary(campaignId));
        campaign.setOpeningReadiness(openingReadiness(associationId, campaignId, row));
        return campaign;
    }

    @Override
    public Campaign updateCategoryAmounts(UUID associationId, UUID campaignId, Map<UUID, Long> categoryAmounts) {
        List<MemberSeed> members = membersForCampaign(campaignId);
        validateCategories(associationId, categoryAmounts, members);
        jdbcTemplate.update("DELETE FROM campaign_category_amounts WHERE campaign_id = ?", campaignId);
        insertCategoryAmounts(campaignId, categoryAmounts);
        for (MemberSeed member : membersForCampaign(campaignId)) {
            Long amount = categoryAmounts.get(member.categoryId());
            if (amount != null) {
                jdbcTemplate.update(
                        "UPDATE dues SET due_amount = ?, status = 'DUE' WHERE id = ?",
                        amount, member.dueId());
            }
        }
        return findCampaignDetails(associationId, campaignId);
    }

    @Override
    public Campaign openCampaign(UUID associationId, UUID campaignId, UUID openedBy, OffsetDateTime openedAt) {
        int updated = jdbcTemplate.update(
                "UPDATE campaigns SET status = 'OPEN', opened_at = ?, opened_by = ?, updated_at = CURRENT_TIMESTAMP "
                        + "WHERE id = ? AND association_id = ? AND status = 'UPCOMING'",
                openedAt, openedBy, campaignId, associationId);
        if (updated != 1) {
            throw ApiErrors.notFound();
        }
        return findCampaignDetails(associationId, campaignId);
    }

    @Override
    public Campaign closeCampaign(UUID associationId, UUID campaignId, UUID closedBy, OffsetDateTime closedAt) {
        int updated = jdbcTemplate.update(
                "UPDATE campaigns SET status = 'CLOSED', closed_at = ?, closed_by = ?, updated_at = CURRENT_TIMESTAMP "
                        + "WHERE id = ? AND association_id = ? AND status = 'OPEN'",
                closedAt, closedBy, campaignId, associationId);
        if (updated != 1) {
            throw ApiErrors.notFound();
        }
        return findCampaignDetails(associationId, campaignId);
    }

    @Override
    public DuePage findCampaignDues(UUID associationId, UUID campaignId, int page, int size, String query, DueStatus status) {
        List<Object> parameters = new ArrayList<>();
        String filters = dueFilters(associationId, campaignId, null, query, status, parameters);
        long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM dues d JOIN campaigns c ON c.id = d.campaign_id "
                        + "JOIN members m ON m.id = d.member_id " + filters,
                Long.class, parameters.toArray());
        parameters.add(size);
        parameters.add(page * size);
        List<Due> items = jdbcTemplate.query(
                dueSelect() + filters + " GROUP BY d.id, c.id, m.id, ic.id "
                        + "ORDER BY m.last_name, m.first_name LIMIT ? OFFSET ?",
                DUE_ROW_MAPPER,
                parameters.toArray()).stream().map(DueRow::toDue).toList();
        return new DuePage(items, pageMetadata(page, size, total));
    }

    @Override
    public Optional<DueDetails> findDue(UUID associationId, UUID dueId) {
        return jdbcTemplate.query(
                dueSelect() + " WHERE d.id = ? AND c.association_id = ? GROUP BY d.id, c.id, m.id, ic.id",
                DUE_ROW_MAPPER,
                dueId, associationId).stream().findFirst().map(row -> {
                    List<Payment> payments = jdbcTemplate.query(
                            paymentSelect() + " WHERE p.due_id = ? AND c.association_id = ? "
                                    + "ORDER BY p.recorded_at DESC",
                            PAYMENT_ROW_MAPPER,
                            dueId, associationId).stream().map(PaymentRow::toPayment).toList();
                    return row.toDetails(payments);
                });
    }

    @Override
    public DuePage findMemberDues(UUID associationId, UUID memberId, int page, int size, DueStatus status) {
        List<Object> parameters = new ArrayList<>();
        String filters = dueFilters(associationId, null, memberId, null, status, parameters);
        long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM dues d JOIN campaigns c ON c.id = d.campaign_id "
                        + "JOIN members m ON m.id = d.member_id " + filters,
                Long.class, parameters.toArray());
        parameters.add(size);
        parameters.add(page * size);
        List<Due> items = jdbcTemplate.query(
                dueSelect() + filters + " GROUP BY d.id, c.id, m.id, ic.id "
                        + "ORDER BY c.start_date DESC LIMIT ? OFFSET ?",
                DUE_ROW_MAPPER,
                parameters.toArray()).stream().map(DueRow::toDue).toList();
        return new DuePage(items, pageMetadata(page, size, total));
    }

    @Override
    public PaymentCreation createPayment(
            UUID associationId,
            UUID dueId,
            UUID recordedBy,
            long amount,
            LocalDate paymentDate,
            String method) {
        List<UUID> lockedDueIds = jdbcTemplate.query(
                "SELECT d.id FROM dues d JOIN campaigns c ON c.id = d.campaign_id "
                        + "WHERE d.id = ? AND c.association_id = ? FOR UPDATE",
                (rs, rowNum) -> rs.getObject("id", UUID.class),
                dueId,
                associationId);
        if (lockedDueIds.isEmpty()) {
            throw ApiErrors.notFound();
        }
        DueRow due = jdbcTemplate.query(
                dueSelect() + " WHERE d.id = ? AND c.association_id = ? GROUP BY d.id, c.id, m.id, ic.id",
                DUE_ROW_MAPPER,
                dueId, associationId).stream().findFirst().orElseThrow(ApiErrors::notFound);
        if (due.campaignStatus() != CampaignStatus.OPEN) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_NOT_OPEN,
                    "Un règlement ne peut être enregistré que sur une campagne ouverte.");
        }
        if (due.remainingAmount() == 0) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.DUE_ALREADY_PAID,
                    "Cette cotisation est déjà entièrement réglée.");
        }
        if (amount > due.remainingAmount()) {
            throw ApiErrors.conflict(
                    com.habdiallo.contribo.api.generated.model.ErrorCode.PAYMENT_EXCEEDS_REMAINING_AMOUNT,
                    "Le montant dépasse le reste à payer.");
        }
        UUID paymentId = UUID.randomUUID();
        jdbcTemplate.update(
                "INSERT INTO payments (id, due_id, amount, payment_date, method, recorded_by) "
                        + "VALUES (?, ?, ?, ?, ?, ?)",
                paymentId, dueId, amount, paymentDate, method, recordedBy);
        long newPaidAmount = due.paidAmount() + amount;
        String newStatus = newPaidAmount >= due.dueAmount()
                ? "PAID"
                : due.campaign().getEndDate().isBefore(LocalDate.now())
                        ? "OVERDUE"
                        : newPaidAmount > 0 ? "PARTIALLY_PAID" : "DUE";
        jdbcTemplate.update("UPDATE dues SET status = ? WHERE id = ?", newStatus, dueId);
        Payment payment = jdbcTemplate.query(
                paymentSelect() + " WHERE p.id = ? AND c.association_id = ?",
                PAYMENT_ROW_MAPPER,
                paymentId, associationId).stream().findFirst().orElseThrow(ApiErrors::notFound).toPayment();
        DueDetails updatedDueDetails = findDue(associationId, dueId).orElseThrow(ApiErrors::notFound);
        Due updatedDue = new Due(
                updatedDueDetails.getId(),
                updatedDueDetails.getMember(),
                updatedDueDetails.getCampaign(),
                updatedDueDetails.getIncomeCategorySnapshot(),
                updatedDueDetails.getDueAmount(),
                updatedDueDetails.getPaidAmount(),
                updatedDueDetails.getRemainingAmount(),
                updatedDueDetails.getStatus(),
                updatedDueDetails.getPaymentCount(),
                updatedDueDetails.getCurrency());
        return new PaymentCreation(payment, updatedDue);
    }

    @Override
    public PaymentPage findPayments(
            UUID associationId,
            int page,
            int size,
            String query,
            UUID memberId,
            UUID campaignId) {
        List<Object> parameters = new ArrayList<>();
        String filters = paymentFilters(associationId, query, memberId, campaignId, parameters);
        long total = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM payments p JOIN dues d ON d.id = p.due_id "
                        + "JOIN campaigns c ON c.id = d.campaign_id JOIN members m ON m.id = d.member_id "
                        + filters,
                Long.class, parameters.toArray());
        parameters.add(size);
        parameters.add(page * size);
        List<Payment> items = jdbcTemplate.query(
                paymentSelect() + filters + " ORDER BY p.recorded_at DESC LIMIT ? OFFSET ?",
                PAYMENT_ROW_MAPPER,
                parameters.toArray()).stream().map(PaymentRow::toPayment).toList();
        return new PaymentPage(items, pageMetadata(page, size, total));
    }

    private String campaignFilters(UUID associationId, String query, CampaignStatus status, List<Object> parameters) {
        StringBuilder filters = new StringBuilder("WHERE c.association_id = ?");
        parameters.add(associationId);
        if (query != null && !query.isBlank()) {
            filters.append(" AND LOWER(c.name) LIKE LOWER(?)");
            parameters.add("%" + query + "%");
        }
        if (status != null) {
            filters.append(" AND c.status = ?");
            parameters.add(status.getValue());
        }
        return filters.toString();
    }

    private String dueFilters(
            UUID associationId,
            UUID campaignId,
            UUID memberId,
            String query,
            DueStatus status,
            List<Object> parameters) {
        StringBuilder filters = new StringBuilder("WHERE c.association_id = ?");
        parameters.add(associationId);
        if (campaignId != null) {
            filters.append(" AND c.id = ?");
            parameters.add(campaignId);
        }
        if (memberId != null) {
            filters.append(" AND d.member_id = ?");
            parameters.add(memberId);
        }
        if (query != null && !query.isBlank()) {
            filters.append(" AND LOWER(CONCAT(m.first_name, ' ', m.last_name)) LIKE LOWER(?)");
            parameters.add("%" + query + "%");
        }
        if (status != null) {
            filters.append(" AND (CASE WHEN COALESCE((SELECT SUM(p2.amount) FROM payments p2 WHERE p2.due_id = d.id), 0) >= d.due_amount THEN 'PAID' "
                    + "WHEN c.end_date < CURRENT_DATE THEN 'OVERDUE' "
                    + "WHEN COALESCE((SELECT SUM(p2.amount) FROM payments p2 WHERE p2.due_id = d.id), 0) > 0 THEN 'PARTIALLY_PAID' "
                    + "ELSE 'DUE' END) = ?");
            parameters.add(status.getValue());
        }
        return filters.toString();
    }

    private String paymentFilters(UUID associationId, String query, UUID memberId, UUID campaignId, List<Object> parameters) {
        StringBuilder filters = new StringBuilder("WHERE c.association_id = ?");
        parameters.add(associationId);
        if (query != null && !query.isBlank()) {
            filters.append(" AND (LOWER(CONCAT(m.first_name, ' ', m.last_name)) LIKE LOWER(?) OR LOWER(c.name) LIKE LOWER(?))");
            parameters.add("%" + query + "%");
            parameters.add("%" + query + "%");
        }
        if (memberId != null) {
            filters.append(" AND d.member_id = ?");
            parameters.add(memberId);
        }
        if (campaignId != null) {
            filters.append(" AND c.id = ?");
            parameters.add(campaignId);
        }
        return filters.toString();
    }

    private String dueSelect() {
        return "SELECT d.id, d.member_id, m.first_name, m.last_name, m.preferred_name, "
                + "d.income_category_id, d.income_category_label_snapshot, d.due_amount, "
                + "c.id AS campaign_id, c.name AS campaign_name, c.start_date, c.end_date, c.status AS campaign_status, "
                + "COALESCE(SUM(p.amount), 0) AS paid_amount, COUNT(p.id) AS payment_count "
                + "FROM dues d JOIN campaigns c ON c.id = d.campaign_id JOIN members m ON m.id = d.member_id "
                + "JOIN income_categories ic ON ic.id = d.income_category_id LEFT JOIN payments p ON p.due_id = d.id ";
    }

    private String paymentSelect() {
        return "SELECT p.id, p.due_id, p.amount, p.payment_date, p.method, p.recorded_at, "
                + "m.id AS member_id, m.first_name, m.last_name, m.preferred_name, "
                + "c.id AS campaign_id, c.name AS campaign_name, c.start_date, c.end_date, c.status AS campaign_status, "
                + "ua.id AS recorded_by, rm.first_name AS recorder_first_name, rm.last_name AS recorder_last_name, "
                + "rm.preferred_name AS recorder_preferred_name "
                + "FROM payments p JOIN dues d ON d.id = p.due_id JOIN campaigns c ON c.id = d.campaign_id "
                + "JOIN members m ON m.id = d.member_id JOIN user_accounts ua ON ua.id = p.recorded_by "
                + "JOIN members rm ON rm.id = ua.member_id ";
    }

    private List<CampaignCategoryAmount> categoryAmounts(UUID campaignId) {
        return jdbcTemplate.query(
                "SELECT cca.amount, ic.id AS category_id, ic.label, COUNT(d.id) AS member_count "
                        + "FROM campaign_category_amounts cca JOIN income_categories ic ON ic.id = cca.income_category_id "
                        + "LEFT JOIN dues d ON d.campaign_id = cca.campaign_id AND d.income_category_id = cca.income_category_id "
                        + "WHERE cca.campaign_id = ? GROUP BY cca.amount, ic.id, ic.label ORDER BY ic.label",
                (rs, rowNum) -> {
                    long amount = rs.getLong("amount");
                    int members = rs.getInt("member_count");
                    return new CampaignCategoryAmount(
                            new IncomeCategorySummary(rs.getObject("category_id", UUID.class), rs.getString("label")),
                            amount,
                            members,
                            amount * members,
                            CurrencyCode.GNF);
                },
                campaignId);
    }

    private CampaignFinancialSummary financialSummary(UUID campaignId) {
        List<DueAggregate> aggregates = jdbcTemplate.query(
                "SELECT d.due_amount, COALESCE(SUM(p.amount), 0) AS paid_amount "
                        + "FROM dues d LEFT JOIN payments p ON p.due_id = d.id WHERE d.campaign_id = ? "
                        + "GROUP BY d.id, d.due_amount",
                (rs, rowNum) -> new DueAggregate(rs.getLong("due_amount"), rs.getLong("paid_amount")),
                campaignId);
        long expected = aggregates.stream().mapToLong(DueAggregate::dueAmount).sum();
        long collected = aggregates.stream().mapToLong(DueAggregate::paidAmount).sum();
        int paid = (int) aggregates.stream().filter(a -> a.paidAmount() >= a.dueAmount()).count();
        int partiallyPaid = (int) aggregates.stream().filter(a -> a.paidAmount() > 0 && a.paidAmount() < a.dueAmount()).count();
        int unpaid = aggregates.size() - paid - partiallyPaid;
        double rate = expected == 0 ? 0d : collected * 100d / expected;
        return new CampaignFinancialSummary(
                expected, collected, Math.max(0, expected - collected), rate,
                new DueCountSummary(aggregates.size(), paid, partiallyPaid, unpaid), CurrencyCode.GNF);
    }

    private CampaignOpeningReadiness openingReadiness(UUID associationId, UUID campaignId, CampaignSummaryRow row) {
        boolean baremeComplete = jdbcTemplate.queryForObject(
                "SELECT NOT EXISTS (SELECT 1 FROM dues WHERE campaign_id = ? AND due_amount <= 0)",
                Boolean.class, campaignId);
        boolean duesReady = jdbcTemplate.queryForObject(
                "SELECT NOT EXISTS (SELECT 1 FROM dues WHERE campaign_id = ? AND due_amount IS NULL)",
                Boolean.class, campaignId);
        boolean startDateReached = !row.startDate().isAfter(LocalDate.now());
        List<String> reasons = new ArrayList<>();
        if (!baremeComplete) {
            reasons.add("BAREME_INCOMPLETE");
        }
        if (!startDateReached) {
            reasons.add("CAMPAIGN_START_DATE_NOT_REACHED");
        }
        if (!duesReady) {
            reasons.add("DUES_NOT_READY");
        }
        return new CampaignOpeningReadiness(
                baremeComplete,
                true,
                startDateReached,
                duesReady,
                baremeComplete && startDateReached && duesReady,
                reasons);
    }

    private CampaignSummary toCampaignSummary(CampaignSummaryRow row) {
        CampaignSummary summary = new CampaignSummary(
                row.id(), row.name(), row.startDate(), row.endDate(), row.status(), row.memberCount());
        summary.setFinancialSummary(financialSummary(row.id()));
        return summary;
    }

    private AuditActor actor(UUID userId) {
        if (userId == null) {
            return null;
        }
        return jdbcTemplate.query(
                "SELECT ua.id, m.first_name, m.last_name, m.preferred_name FROM user_accounts ua "
                        + "JOIN members m ON m.id = ua.member_id WHERE ua.id = ?",
                (rs, rowNum) -> new AuditActor(userId, displayName(
                        rs.getString("first_name"), rs.getString("last_name"), rs.getString("preferred_name"))),
                userId).stream().findFirst().orElse(null);
    }

    private void validateCategories(UUID associationId, Map<UUID, Long> amounts, List<MemberSeed> members) {
        for (Map.Entry<UUID, Long> entry : amounts.entrySet()) {
            Long count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM income_categories WHERE id = ? AND association_id = ?",
                    Long.class, entry.getKey(), associationId);
            if (count == null || count != 1) {
                throw ApiErrors.notFound();
            }
        }
        if (members.stream().anyMatch(member -> !amounts.containsKey(member.categoryId()))) {
            throw ApiErrors.conflict(com.habdiallo.contribo.api.generated.model.ErrorCode.CAMPAIGN_NOT_READY,
                    "Le barème doit couvrir chaque catégorie des membres actifs.");
        }
    }

    private List<MemberSeed> membersForCampaign(UUID campaignId) {
        return jdbcTemplate.query(
                "SELECT d.id AS due_id, d.member_id AS id, d.income_category_id, d.income_category_label_snapshot "
                        + "FROM dues d WHERE d.campaign_id = ?",
                (rs, rowNum) -> new MemberSeed(
                        rs.getObject("id", UUID.class),
                        rs.getObject("income_category_id", UUID.class),
                        rs.getString("income_category_label_snapshot"),
                        rs.getObject("due_id", UUID.class)),
                campaignId);
    }

    private void insertCategoryAmounts(UUID campaignId, Map<UUID, Long> categoryAmounts) {
        categoryAmounts.forEach((categoryId, amount) -> jdbcTemplate.update(
                "INSERT INTO campaign_category_amounts (campaign_id, income_category_id, amount) VALUES (?, ?, ?)",
                campaignId, categoryId, amount));
    }

    private PageMetadata pageMetadata(int page, int size, long total) {
        return new PageMetadata(page, size, total, (int) ((total + size - 1) / size));
    }

    private static UUID nullableUuid(ResultSet rs, String column) throws SQLException {
        return rs.getObject(column, UUID.class);
    }

    private static OffsetDateTime nullableOffsetDateTime(ResultSet rs, String column) throws SQLException {
        return rs.getObject(column, OffsetDateTime.class);
    }

    private static String displayName(String firstName, String lastName, String preferredName) {
        return preferredName == null || preferredName.isBlank()
                ? firstName + " " + lastName
                : preferredName + " " + lastName;
    }

    private record CampaignSummaryRow(
            UUID id,
            String name,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            CampaignStatus status,
            int memberCount,
            OffsetDateTime openedAt,
            UUID openedBy,
            OffsetDateTime closedAt,
            UUID closedBy) {
    }

    private record MemberSeed(UUID id, UUID categoryId, String categoryLabel, UUID dueId) {
        private MemberSeed(UUID id, UUID categoryId, String categoryLabel) {
            this(id, categoryId, categoryLabel, null);
        }
    }

    private record DueAggregate(long dueAmount, long paidAmount) {
    }

    private static final RowMapper<DueRow> DUE_ROW_MAPPER = (rs, rowNum) -> {
        long dueAmount = rs.getLong("due_amount");
        long paidAmount = rs.getLong("paid_amount");
        CampaignStatus campaignStatus = CampaignStatus.fromValue(rs.getString("campaign_status"));
        LocalDate endDate = rs.getObject("end_date", LocalDate.class);
        DueStatus status = paidAmount >= dueAmount
                ? DueStatus.PAID
                : endDate.isBefore(LocalDate.now())
                        ? DueStatus.OVERDUE
                        : paidAmount > 0 ? DueStatus.PARTIALLY_PAID : DueStatus.DUE;
        return new DueRow(
                rs.getObject("id", UUID.class),
                new com.habdiallo.contribo.api.generated.model.PersonSummary(
                        rs.getObject("member_id", UUID.class),
                        displayName(rs.getString("first_name"), rs.getString("last_name"), rs.getString("preferred_name"))),
                new CampaignReference(
                        rs.getObject("campaign_id", UUID.class),
                        rs.getString("campaign_name"),
                        rs.getObject("start_date", LocalDate.class),
                        endDate,
                        campaignStatus),
                new IncomeCategorySummary(
                        rs.getObject("income_category_id", UUID.class),
                        rs.getString("income_category_label_snapshot")),
                dueAmount,
                paidAmount,
                Math.max(0, dueAmount - paidAmount),
                status,
                rs.getInt("payment_count"),
                CurrencyCode.GNF,
                campaignStatus);
    };

    private static final RowMapper<PaymentRow> PAYMENT_ROW_MAPPER = (rs, rowNum) ->
            new PaymentRow(
                    new Payment(
                            rs.getObject("id", UUID.class),
                            rs.getObject("due_id", UUID.class),
                            new com.habdiallo.contribo.api.generated.model.PersonSummary(
                                    rs.getObject("member_id", UUID.class),
                                    displayName(rs.getString("first_name"), rs.getString("last_name"), rs.getString("preferred_name"))),
                            new CampaignReference(
                                    rs.getObject("campaign_id", UUID.class),
                                    rs.getString("campaign_name"),
                                    rs.getObject("start_date", LocalDate.class),
                                    rs.getObject("end_date", LocalDate.class),
                                    CampaignStatus.fromValue(rs.getString("campaign_status"))),
                            rs.getLong("amount"),
                            rs.getObject("payment_date", LocalDate.class),
                            PaymentMethod.fromValue(rs.getString("method")),
                            new AuditActor(
                                    rs.getObject("recorded_by", UUID.class),
                                    displayName(rs.getString("recorder_first_name"), rs.getString("recorder_last_name"),
                                            rs.getString("recorder_preferred_name"))),
                            rs.getObject("recorded_at", OffsetDateTime.class),
                            CurrencyCode.GNF));

    private record DueRow(
            UUID id,
            com.habdiallo.contribo.api.generated.model.PersonSummary member,
            CampaignReference campaign,
            IncomeCategorySummary category,
            long dueAmount,
            long paidAmount,
            long remainingAmount,
            DueStatus status,
            int paymentCount,
            CurrencyCode currency,
            CampaignStatus campaignStatus) {

        private Due toDue() {
            return new Due(id, member, campaign, category, dueAmount, paidAmount, remainingAmount, status, paymentCount, currency);
        }

        private DueDetails toDetails(List<Payment> payments) {
            return new DueDetails(id, member, campaign, category, dueAmount, paidAmount, remainingAmount, status, paymentCount, currency, payments);
        }
    }

    private record PaymentRow(Payment payment) {
        private Payment toPayment() {
            return payment;
        }
    }
}
