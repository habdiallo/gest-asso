## ADDED Requirements

### Requirement: Social fund detail hero

The social fund detail page SHALL render the event type, title, beneficiary, period and status in the shared detail shell. It SHALL render collected amount, optional target amount, remaining amount and contributor count using the existing social fund response.

#### Scenario: Social fund with an objective is displayed

- **WHEN** the social fund API returns a target amount and progress data
- **THEN** the hero displays the collected amount, objective, remaining amount, contributor count and progress indicator
- **AND** the progress indicator is bounded according to the existing progress helper

#### Scenario: Social fund without an objective is displayed

- **WHEN** the social fund API returns no target amount
- **THEN** the hero displays the collected amount and contributor count without inventing an objective or progress value

### Requirement: Social fund detail actions and information

The social fund detail page SHALL expose the Contributions and Informations tabs. It SHALL keep the existing authorization rules for recording a contribution and closing a social fund, including operator payment permission and the closed status.

#### Scenario: Authorized user records or closes a social fund

- **WHEN** an authorized user activates Enregistrer une contribution or Clôturer
- **THEN** the existing form or confirmation dialog opens from the shared action area or contribution panel
- **AND** its hover, focus-visible, pending, cancel and error states remain accessible

#### Scenario: Closed or unauthorized social fund

- **WHEN** the social fund is closed or the current role cannot perform the action
- **THEN** the corresponding action is not offered
- **AND** a direct handler call cannot submit the operation

#### Scenario: User opens the information tab

- **WHEN** the user activates Informations
- **THEN** the page displays the description, event type, beneficiary, period and target details in a readable panel
- **AND** the content remains usable when an optional description or target is absent

### Requirement: Social fund contributions table

The Contributions panel SHALL use the shared data table presentation and retain member, amount, payment method and business date. Audit fields such as recorder and recorded-at timestamp SHALL remain out of the MVP table. It SHALL preserve contribution pagination, loading, empty, initial error and page-change error states.

#### Scenario: Contributions are displayed

- **WHEN** the contribution endpoint returns one or more contributions
- **THEN** the table renders the four business columns in the prototype order
- **AND** amounts, dates and methods use the existing formatters
- **AND** recorder and recorded-at values are not rendered in the table

#### Scenario: User changes contribution page

- **WHEN** the user activates an available next or previous page control
- **THEN** the page requests the corresponding contribution page and updates the table on success
- **AND** the controls expose disabled and pending states during the request

#### Scenario: Contributions request is empty or fails

- **WHEN** the contribution endpoint returns no rows or an error
- **THEN** the page displays the accessible empty or error state instead of an empty unlabelled table
- **AND** a page-change error does not discard rows already displayed when a previous page is available

#### Scenario: Contribution row interaction is added

- **WHEN** a future feature supplies a row action or navigation target
- **THEN** the shared row interaction exposes hover, focus-visible and click states without changing the contribution data contract
