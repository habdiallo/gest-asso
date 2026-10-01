CREATE INDEX members_association_status_idx ON members (association_id, status);
CREATE INDEX campaigns_association_status_idx ON campaigns (association_id, status);
CREATE INDEX dues_campaign_status_idx ON dues (campaign_id, status);
CREATE INDEX dues_member_idx ON dues (member_id);
CREATE INDEX payments_due_idx ON payments (due_id);
CREATE INDEX social_funds_association_status_idx ON social_funds (association_id, status);
CREATE INDEX contributions_social_fund_idx ON contributions (social_fund_id);
CREATE INDEX contributions_member_idx ON contributions (member_id);
