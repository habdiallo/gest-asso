CREATE TABLE associations (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT associations_currency_ck CHECK (currency = 'GNF')
);

CREATE TABLE income_categories (
    id UUID PRIMARY KEY,
    association_id UUID NOT NULL,
    label VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT income_categories_association_fk FOREIGN KEY (association_id) REFERENCES associations (id),
    CONSTRAINT income_categories_label_uk UNIQUE (association_id, label)
);

CREATE TABLE members (
    id UUID PRIMARY KEY,
    association_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    preferred_name VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    phone VARCHAR(25),
    income_category_id UUID NOT NULL,
    association_function VARCHAR(100),
    status VARCHAR(8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT members_association_fk FOREIGN KEY (association_id) REFERENCES associations (id),
    CONSTRAINT members_income_category_fk FOREIGN KEY (income_category_id) REFERENCES income_categories (id),
    CONSTRAINT members_status_ck CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE user_accounts (
    id UUID PRIMARY KEY,
    association_id UUID NOT NULL,
    member_id UUID NOT NULL,
    identifier VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(13) NOT NULL,
    operator_can_record_payments BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_accounts_association_fk FOREIGN KEY (association_id) REFERENCES associations (id),
    CONSTRAINT user_accounts_member_fk FOREIGN KEY (member_id) REFERENCES members (id),
    CONSTRAINT user_accounts_identifier_uk UNIQUE (association_id, identifier),
    CONSTRAINT user_accounts_member_uk UNIQUE (member_id),
    CONSTRAINT user_accounts_role_ck CHECK (role IN ('ADMINISTRATOR', 'TREASURER', 'OPERATOR', 'MEMBER')),
    CONSTRAINT user_accounts_operator_permission_ck CHECK (
        role = 'OPERATOR' OR operator_can_record_payments = FALSE
    )
);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    association_id UUID NOT NULL,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(1000),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(8) NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    opened_by UUID,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaigns_association_fk FOREIGN KEY (association_id) REFERENCES associations (id),
    CONSTRAINT campaigns_opened_by_fk FOREIGN KEY (opened_by) REFERENCES user_accounts (id),
    CONSTRAINT campaigns_closed_by_fk FOREIGN KEY (closed_by) REFERENCES user_accounts (id),
    CONSTRAINT campaigns_status_ck CHECK (status IN ('UPCOMING', 'OPEN', 'CLOSED')),
    CONSTRAINT campaigns_dates_ck CHECK (end_date >= start_date)
);

CREATE TABLE campaign_category_amounts (
    campaign_id UUID NOT NULL,
    income_category_id UUID NOT NULL,
    amount BIGINT NOT NULL,
    PRIMARY KEY (campaign_id, income_category_id),
    CONSTRAINT campaign_category_amounts_campaign_fk FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
    CONSTRAINT campaign_category_amounts_category_fk FOREIGN KEY (income_category_id) REFERENCES income_categories (id),
    CONSTRAINT campaign_category_amounts_amount_ck CHECK (amount >= 0)
);

CREATE TABLE dues (
    id UUID PRIMARY KEY,
    campaign_id UUID NOT NULL,
    member_id UUID NOT NULL,
    income_category_id UUID NOT NULL,
    income_category_label_snapshot VARCHAR(100) NOT NULL,
    due_amount BIGINT NOT NULL,
    status VARCHAR(15) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT dues_campaign_fk FOREIGN KEY (campaign_id) REFERENCES campaigns (id),
    CONSTRAINT dues_member_fk FOREIGN KEY (member_id) REFERENCES members (id),
    CONSTRAINT dues_income_category_fk FOREIGN KEY (income_category_id) REFERENCES income_categories (id),
    CONSTRAINT dues_campaign_member_category_uk UNIQUE (campaign_id, member_id, income_category_id),
    CONSTRAINT dues_amount_ck CHECK (due_amount >= 0),
    CONSTRAINT dues_status_ck CHECK (status IN ('DUE', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'))
);

CREATE TABLE payments (
    id UUID PRIMARY KEY,
    due_id UUID NOT NULL,
    amount BIGINT NOT NULL,
    payment_date DATE NOT NULL,
    method VARCHAR(15) NOT NULL,
    recorded_by UUID NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_due_fk FOREIGN KEY (due_id) REFERENCES dues (id),
    CONSTRAINT payments_recorded_by_fk FOREIGN KEY (recorded_by) REFERENCES user_accounts (id),
    CONSTRAINT payments_amount_ck CHECK (amount > 0),
    CONSTRAINT payments_method_ck CHECK (method IN ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER'))
);

CREATE TABLE social_funds (
    id UUID PRIMARY KEY,
    association_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    event_type VARCHAR(8) NOT NULL,
    description VARCHAR(1000),
    beneficiary VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(6) NOT NULL,
    target_amount BIGINT,
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT social_funds_association_fk FOREIGN KEY (association_id) REFERENCES associations (id),
    CONSTRAINT social_funds_closed_by_fk FOREIGN KEY (closed_by) REFERENCES user_accounts (id),
    CONSTRAINT social_funds_event_type_ck CHECK (event_type IN ('WEDDING', 'BAPTISM', 'DEATH', 'BIRTH', 'OTHER')),
    CONSTRAINT social_funds_status_ck CHECK (status IN ('OPEN', 'CLOSED')),
    CONSTRAINT social_funds_target_ck CHECK (target_amount IS NULL OR target_amount > 0),
    CONSTRAINT social_funds_dates_ck CHECK (end_date >= start_date)
);

CREATE TABLE contributions (
    id UUID PRIMARY KEY,
    social_fund_id UUID NOT NULL,
    member_id UUID,
    external_first_name VARCHAR(100),
    external_last_name VARCHAR(100),
    amount BIGINT NOT NULL,
    contribution_date DATE NOT NULL,
    method VARCHAR(15) NOT NULL,
    recorded_by UUID NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contributions_social_fund_fk FOREIGN KEY (social_fund_id) REFERENCES social_funds (id),
    CONSTRAINT contributions_member_fk FOREIGN KEY (member_id) REFERENCES members (id),
    CONSTRAINT contributions_recorded_by_fk FOREIGN KEY (recorded_by) REFERENCES user_accounts (id),
    CONSTRAINT contributions_amount_ck CHECK (amount > 0),
    CONSTRAINT contributions_method_ck CHECK (method IN ('CASH', 'MOBILE_MONEY', 'BANK_TRANSFER')),
    CONSTRAINT contributions_identity_ck CHECK (
        (member_id IS NOT NULL AND external_first_name IS NULL AND external_last_name IS NULL)
        OR (member_id IS NULL AND external_first_name IS NOT NULL AND external_last_name IS NOT NULL)
    )
);
