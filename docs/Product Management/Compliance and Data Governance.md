# StudyStreaks - Compliance & Data Governance

## Legal Framework

StudyStreaks must comply with UK legislation governing children's data and educational technology:

### UK GDPR (2018)
**Lawful Basis & Processing:**
* **Article 6(1)(f) Legitimate interests** for educational outcomes and homework tracking
* **Article 9(2)(g) Substantial public interest** (education) for any special category data
* **Data Protection Impact Assessment (DPIA)** required due to high-risk processing of children's data
* **Privacy by Design** principles embedded in all platform features

**Data Subject Rights Implementation:**
* **Right of Access (Article 15):** Automated parent portal for data access requests
* **Right to Erasure (Article 17):** Complete data deletion within 30 days of request
* **Right to Portability (Article 20):** Data export in machine-readable format
* **Right to Rectification (Article 16):** Real-time data correction capabilities

### ICO Children's Code (Age Appropriate Design Code)
All 15 standards must be implemented with evidence documentation:

**Standard 1: Best interests of the child**
* All platform decisions prioritise child welfare over commercial interests
* Regular child impact assessments for new features

**Standard 2: Data Protection Impact Assessments**
* DPIA completed and regularly updated
* Child-specific risk assessments documented

**Standard 3: Age-appropriate application**
* Platform restricted to verified school-enrolled children aged 5-16
* Age verification through school registration systems

**Standard 4: Transparent privacy information**
* Privacy notices written at reading age 8-9 level (Flesch-Kincaid Grade Level 3-4)
* Visual icons and simple language explaining data use
* Separate privacy notices for children and parents

**Standard 5: Detrimental use of data**
* No data sharing with third parties for marketing
* No behavioural advertising targeted at children
* Educational purpose limitation strictly enforced

**Standard 6: Policies and community standards**
* Clear community guidelines age-appropriate for primary school children
* Anti-bullying policies embedded in social features
* Reporting mechanisms for inappropriate content

**Standard 7: Default settings**
* Privacy-protective defaults for all accounts
* Minimal data sharing enabled by default
* Parental controls enabled by default

**Standard 8: Data minimisation**
* Only collect homework completion and engagement data
* No collection of location, biometric, or behavioural data
* Regular data audits to ensure minimal collection

**Standard 9: Data sharing**
* No data sharing outside school boundaries without explicit consent
* Pseudonymisation for any research or analytics sharing
* Clear data sharing agreements with schools

**Standard 10: Geolocation**
* No geolocation tracking or collection
* IP address processing limited to security purposes only

**Standard 11: Parental controls**
* Parents can view all child data
* Parents can request account deletion
* Parents can modify privacy settings

**Standard 12: Profiling**
* No automated decision-making affecting children
* All algorithms designed for educational support only
* Human oversight for all student-affecting decisions

**Standard 13: Nudge techniques**
* Positive reinforcement only - no pressure tactics
* Celebration of effort over performance
* No exploitation of developmental vulnerabilities

**Standard 14: Connected toys and devices**
* Platform web-based only, no IoT device integration
* Clear boundaries around connected educational tools

**Standard 15: Online tools**
* Child-friendly interfaces with clear navigation
* Age-appropriate content moderation
* Robust reporting systems for safeguarding concerns

### Keeping Children Safe in Education (2025)
**Staff Training Requirements:**
* Annual safeguarding training for all platform administrators
* Designated Safeguarding Lead (DSL) training for school admin users
* Platform-specific child protection protocols

**Safeguarding Features:**
* Automated content monitoring for inappropriate communications
* Clear escalation pathways for safeguarding concerns
* Integration with school safeguarding reporting systems
* Controlled peer interactions with teacher oversight

**Reporting Mechanisms:**
* Direct reporting to school DSL through platform
* Anonymous reporting options for children
* Audit trail for all safeguarding-related activities

## Data Collection & Processing

### Student Data Collected
**Identity Data:**
* First name and preferred name only
* School-provided unique student identifier (MIS integration)
* School year group and class assignment
* House group membership (where applicable)

**Educational Data:**
* Homework completion status per subject/club
* Streak count and achievement history
* Level progression and fuel (XP) accumulation
* Club membership and participation data
* Above-and-beyond activity submissions (text/image content)

**Engagement Data:**
* Login frequency and session duration
* Feature usage patterns (anonymised for analytics)
* User-generated content (moderated comments, celebrations)

**No Email Collection for Students:**
* Primary school students (ages 5-11) will not have email addresses collected
* All student communications routed through parent accounts
* Student authentication via school-provided unique identifiers only

**Data NOT Collected:**
* Student surnames (privacy protection)
* Email addresses or direct contact information
* Home addresses or family details
* Biometric or health data
* Location or device tracking data

### Parent/Guardian Data Collected
**Identity & Contact:**
* Full name for account verification
* Email address (primary account identifier)
* Mobile number (multi-factor authentication)
* Relationship to child (parent/guardian/carer)

**Consent & Verification:**
* Digital consent records with timestamps
* IP address of consent (for verification purposes)
* Communication preferences
* Account recovery information

**Engagement Data:**
* Reading log digital signatures
* Platform usage for child oversight
* Communication history with school

### School Staff Data Collected
**Professional Identity:**
* Full name and professional role
* School affiliation and access permissions
* Teacher Registration Number (TRN) for verification
* Class/year group assignments

**Platform Administration:**
* User management activities
* System configuration changes
* Safeguarding report access history
* Data export activities (audit trail)

### Teacher Access Permissions
**Granular Data Access for Class Teachers:**

**Full Student Profile Access:**
* Student first names and preferred names
* Current streak counts across all clubs
* Historical streak performance and patterns
* Learning points (Fuel) accumulation and spending
* Badge and achievement history
* Club membership and participation levels
* Above-and-beyond submissions and teacher feedback

**Parent/Guardian Information:**
* Parent full names and contact details
* Communication history and preferences
* Reading log signatures and validation
* Consent status and privacy preferences
* Account activity and engagement patterns

**Class Management Data:**
* Class-wide performance analytics
* Individual student progress comparisons
* Homework completion rates and trends
* Engagement patterns and intervention alerts
* Celebration and recognition history

**Data Boundaries:**
* Teachers can only access students in their assigned classes
* No access to other teachers' classes without explicit permission
* Historical data access limited to current and previous academic year
* Safeguarding data access restricted to designated staff only

## Data Retention & Deletion

### Retention Periods
**Active Students:**
* All student data retained while child attends the school
* Regular data minimisation reviews every academic year
* Automatic archival of completed academic year data

**Post-Departure:**
* **Educational records:** 7 years retention (Schools Standards and Framework Act 1998)
* **Safeguarding records:** Indefinite retention where serious concerns exist
* **General platform data:** Deletion within 30 days of school departure

**Research & Analytics:**
* **Pseudonymised aggregated data:** Indefinite retention for educational research
* **Individual usage patterns:** Anonymised after 2 years
* **Marketing preferences:** 2 years maximum, separate consent required

### Automated Deletion Workflows
**Triggers:**
* Student leaves school (verified through MIS integration)
* Parent/guardian requests deletion (Article 17 GDPR)
* Account inactive for more than 2 academic years
* School terminates platform contract

**Process:**
* 30-day notice period before deletion
* Opportunity for data export before deletion
* Secure deletion with cryptographic verification
* Deletion confirmation provided to requestor

## Data Security & Technical Measures

### Technical Safeguards
**Encryption:**
* AES-256 encryption for data at rest
* TLS 1.3 for data in transit
* End-to-end encryption for sensitive communications
* Encrypted database backups with separate key management

**Access Controls:**
* Role-based access control (RBAC) with principle of least privilege
* Multi-factor authentication for all accounts
* Session timeout controls (15 minutes for students, 60 minutes for adults)
* IP allowlisting for school administrator accounts

**Infrastructure Security:**
* UK-based data centres with ISO 27001 certification
* Regular penetration testing (quarterly)
* Vulnerability scanning and patch management
* Network segmentation and firewall protection

### Monitoring & Audit
**Activity Monitoring:**
* Comprehensive audit logging for all data access
* Real-time monitoring for suspicious activity
* Automated alerting for unusual access patterns
* Regular security incident response testing

**Compliance Monitoring:**
* Automated GDPR compliance checking
* Regular data protection audits (annually)
* Child safety content monitoring
* Privacy impact assessments for new features

## Consent Management

### Parental Consent Framework
**Digital Consent Through Platform:**
* Secure parent registration and verification process
* School validates parent-child relationships before account activation
* Multi-step consent process with clear explanations at each stage
* Digital signature capture with legal enforceability

**Consent Verification Process:**
1. School provides parent contact details and child relationship data
2. Platform sends secure registration invitation to verified parent email
3. Parent completes identity verification and consent process
4. School confirms activation before student account becomes accessible

**Required Consents:**
* **Primary consent:** Platform participation and basic data processing
* **Extended consent:** Participation in research and analytics
* **Communication consent:** Marketing and non-essential communications
* **Image consent:** Use of child-created content for celebration/sharing

**Consent Mechanism:**
* Digital consent through secure parent portal
* Clear, layered privacy notices with plain English explanations
* Granular consent options for different data uses
* Easy withdrawal mechanism with immediate effect

### Student Privacy Controls
**Age-Appropriate Controls:**
* Simple on/off toggles for sharing achievements
* Clear explanations of what data is collected
* Easy reporting buttons for concerns or problems
* Visual indicators of privacy status

**Graduated Permissions:**
* **Ages 5-8:** Full parental control with read-only student access
* **Ages 9-11:** Student can modify some preferences with parental oversight
* **Ages 12-16:** Increased student autonomy with parental visibility

## Cross-Border Data Transfers

### Data Localisation
**Confirmed UK-Only Processing:**
* All data processing occurs within UK borders
* UK-based cloud infrastructure providers exclusively
* No international data transfers under any circumstances
* Regular infrastructure audits to confirm data localisation

**Vendor Management:**
* All third-party services must demonstrate UK data residency
* Contractual guarantees of UK-only processing
* Regular compliance verification for all service providers
* Immediate contract termination clauses for data residency violations

**Third-Party Services:**
* **Approved vendors:** Must demonstrate UK GDPR compliance
* **Data Processing Agreements (DPAs):** Required for all vendors
* **Regular compliance audits:** Quarterly vendor assessments

## Data Breach Management

### Simplified Breach Detection for Initial Trials (MVP Scope)
**Core Monitoring (MVP):**
* Failed authentication attempt monitoring
* Unusual access pattern detection
* Unauthorised data export attempts
* System intrusion detection basics

**Enhanced Monitoring (Post-Trial):**
* Advanced behavioural analytics
* Machine learning threat detection
* Automated incident response workflows
* Comprehensive forensic capabilities

### Incident Response Framework
**Detection & Assessment:**
* Automated monitoring for unauthorised access attempts
* Real-time alerting for potential data breaches
* 1-hour target for initial breach assessment
* Classification system for breach severity

**Notification Requirements:**
* **ICO notification:** Within 72 hours for high-risk breaches
* **School notification:** Within 2 hours for any confirmed breach
* **Parent notification:** Within 24 hours for breaches affecting their child's data
* **Student notification:** Age-appropriate communication within 48 hours

**Notification Framework (MVP):**
* Manual assessment and notification process
* Essential stakeholder communication only
* Basic incident documentation
* Simplified reporting to schools and ICO

**Response Procedures:**
* Immediate containment and system isolation
* Forensic investigation and evidence preservation
* Stakeholder communication and support
* Post-incident review and improvement planning

## Compliance Monitoring & Governance

### Governance Structure
**Data Protection Officer (DPO):**
* Independent DPO appointment (external specialist)
* Regular compliance reporting to board
* Training and awareness programs
* Policy development and review

**Privacy Committee:**
* Monthly compliance review meetings
* Cross-functional representation (legal, technical, educational)
* Regular policy updates and training
* Incident review and learning

### Regular Assessments
**Compliance Audits:**
* **Internal audits:** Monthly privacy compliance checks
* **External audits:** Annual comprehensive GDPR assessment
* **Child-specific audits:** Quarterly ICO Children's Code review
* **Penetration testing:** Quarterly security assessments

**Documentation Requirements:**
* **Privacy Impact Assessments:** Updated for each new feature
* **Compliance register:** Maintained with evidence of all compliance measures
* **Training records:** All staff privacy and safeguarding training documented
* **Incident log:** All privacy and security incidents tracked and analysed

## Acceptance Criteria

### Legal Compliance
* [ ] Full GDPR compliance documented with legal opinion
* [ ] All 15 ICO Children's Code standards implemented with evidence
* [ ] KCSIE 2025 safeguarding requirements integrated
* [ ] Data Protection Impact Assessment completed and approved

### Technical Implementation
* [ ] UK-only data processing confirmed with infrastructure audit
* [ ] End-to-end encryption implemented for all sensitive data
* [ ] Role-based access controls tested and verified
* [ ] Automated data deletion workflows tested

### Student Authentication
* [ ] School MIS integration provides unique student identifiers
* [ ] No email collection for primary school students confirmed
* [ ] Student authentication system tested with school-provided IDs
* [ ] Parent communication routing system operational

### Parental Consent
* [ ] Digital consent platform integrated with school verification
* [ ] Multi-step consent process tested and legally validated
* [ ] Consent withdrawal system provides immediate effect
* [ ] School-parent relationship verification system operational

### Teacher Permissions
* [ ] Granular access controls implemented for class teacher role
* [ ] Student and parent data access tested for assigned classes only
* [ ] Historical data access properly scoped to relevant periods
* [ ] Data export controls tested for teacher accounts

### Data Localisation
* [ ] UK-only data processing confirmed with infrastructure audit
* [ ] All vendor agreements include UK data residency clauses
* [ ] Regular monitoring system for data location compliance
* [ ] Emergency data repatriation procedures documented

### Breach Management (MVP)
* [ ] Basic intrusion detection system operational
* [ ] Manual incident assessment procedures documented
* [ ] Essential notification workflows tested
* [ ] Post-trial enhancement roadmap defined

### Monitoring & Governance
* [ ] Independent DPO appointed with relevant qualifications
* [ ] Compliance monitoring dashboard operational
* [ ] Staff training program completed with certification
* [ ] Incident response procedures tested quarterly

---

**Key Compliance Principle:** Every feature must prioritise child welfare and educational benefit over platform engagement or commercial interests, with transparent, auditable decision-making processes.