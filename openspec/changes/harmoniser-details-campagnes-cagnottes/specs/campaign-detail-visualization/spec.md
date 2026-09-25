## ADDED Requirements

### Requirement: Campaign detail hero

The campaign detail page SHALL render the campaign kicker, name, formatted period, member count and status in the shared detail shell. It SHALL render the financial metrics expected by the prototype: total expected, total collected, remaining amount and payment progress.

#### Scenario: Open campaign is displayed

- **WHEN** the campaign API returns an open campaign with its financial summary
- **THEN** the page displays the campaign hero with the open status, the period and the four summary metrics
- **AND** the values are formatted from the API response without a second local financial calculation

#### Scenario: Campaign detail is loading or unavailable

- **WHEN** the campaign request is pending or fails before a campaign is available
- **THEN** the page displays the existing detail loading or error state with an accessible status

### Requirement: Campaign detail tabs and actions

The campaign detail page SHALL expose the tabs Situation des membres, Montants par catégorie and Règlements. It SHALL keep the existing authorization rules for registering a payment, closing a campaign and editing campaign amounts.

#### Scenario: Authorized user records or closes a campaign

- **WHEN** an authorized user selects Enregistrer un règlement or Clôturer
- **THEN** the corresponding existing dialog opens from the shared hero or tab action
- **AND** the action shows hover, focus-visible, pending and error states without submitting twice

#### Scenario: Unauthorized or closed campaign

- **WHEN** the current role cannot perform an action or the campaign is closed
- **THEN** that action is not offered in the hero or active tab
- **AND** direct method calls remain guarded by the same authorization conditions

#### Scenario: User changes campaign tab

- **WHEN** the user activates one of the three campaign tabs
- **THEN** only the selected panel is visible and the selected state is announced by the shared tabs primitive
- **AND** the existing query parameter used to open the cotisations panel remains supported

### Requirement: Campaign member and payment tables

The Situation des membres and Règlements panels SHALL use the shared data table presentation. The member table SHALL retain member, category, amount due, paid amount, remaining amount and status. The payment table SHALL retain member, amount, payment method and business date. Audit fields such as recorder and recorded-at timestamp SHALL remain out of the MVP table, with pagination and page-level loading or error handling where provided by the API.

#### Scenario: User filters the member situation

- **WHEN** the user enters a member search or selects a status filter
- **THEN** the campaign dues request is refreshed with the corresponding criteria
- **AND** the table displays the resulting rows or the accessible empty state

#### Scenario: User paginates campaign data

- **WHEN** a next or previous pagination control is available and the user activates it
- **THEN** the page requests the selected API page and updates the table when the response succeeds
- **AND** the control is pending and cannot be activated twice while the request is in flight

#### Scenario: Payment row is rendered

- **WHEN** a payment is returned by the campaign payment endpoint
- **THEN** the row renders the member identity, positive amount, payment method and business date in the prototype column order
- **AND** audit metadata such as recorder and recorded-at timestamp is not rendered in the table
- **AND** the row exposes consistent hover and keyboard focus behavior when a row action is supplied

### Requirement: Campaign category amounts panel

The Montants par catégorie panel SHALL render the category, campaign amount, concerned member count and expected total in the shared table surface. The existing edit mode SHALL remain available only to authorized users while the campaign is editable.

#### Scenario: User views the campaign amount scale

- **WHEN** the campaign provides category amounts
- **THEN** the panel renders every category and its associated amount and expected total
- **AND** an unconfigured amount remains visibly identifiable with text as well as styling

#### Scenario: User edits the campaign amount scale

- **WHEN** an authorized user activates the edit action on an editable campaign
- **THEN** the table switches to the existing form controls and keeps cancel, submit, validation and API error states accessible

#### Scenario: User cannot edit the amount scale

- **WHEN** the campaign is closed, already started, or the role is not authorized
- **THEN** the edit action is hidden or disabled according to the existing rule
- **AND** the read-only table remains available
