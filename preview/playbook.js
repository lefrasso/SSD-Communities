'use strict';

window.SSD_PLAYBOOK = {
  meta: {
    title: 'SSD Technical Communities Playbook',
    organisation: 'Success Services Delivery',
    fiscalYear: 'FY27',
    initiative: 'Communities Initiative',
    executiveSponsor: 'Leandro Frasso',
    version: '1.0',
    status: 'Draft for Leadership Team review'
  },
  purpose: {
    summary: 'The operating manual for launching and sustaining eight governed technical communities across Success Services Delivery.',
    context: 'The initiative sits within the Delivery Transformation Initiative as the Technical Communities sub-initiative. It responds to community and knowledge overload by combining a single source of truth with focused, governed communities.',
    audiences: [
      'Leadership Team members sponsoring the work',
      'Community Leads accountable for each circle',
      'CSAs, POD Leads, Partner CSAs (pCSAs), Partner Leads, Nebula members and managers who participate'
    ],
    inScope: [
      'People, practices, rituals and evidence needed to activate communities',
      'Portfolio structure, roles, channels, health measures and checkpoints',
      'The Community Charter as the launch gate for each community'
    ],
    outOfScope: [
      'The technical architecture of the Community Governance Portal',
      'Service-family technical strategy; communities amplify strategy but do not set it',
      'Replacing Viva Engage or chat as the places where community interaction occurs'
    ]
  },
  vision: 'Create supporting circles of people who share the same interests and goals, lift each other up, and strengthen how the organisation works together.',
  communityDefinition: 'A voluntary, peer-led circle organised around a shared technical or operational domain. It is not a reporting line, governance board or another mandatory meeting.',
  objectives: [
    {
      title: 'Support each other',
      description: 'Members solve real delivery problems together, while subject matter experts become visible and reachable rather than discovered by accident.',
      signal: 'Questions receive useful, timely answers from the right expertise.'
    },
    {
      title: 'Grow skills',
      description: 'Learning paths on common topics elevate CSAs and POD Leads, turning individual expertise into shared organisational capability.',
      signal: 'Members reuse readiness paths, delivery IP and lessons learned.'
    },
    {
      title: 'Right communication',
      description: 'Messages reach the right audience at the right moment, replacing broad broadcast noise with targeted and relevant signal.',
      signal: 'Membership and channels reflect genuine relevance rather than accumulation.'
    },
    {
      title: 'Connect IP Leads and delivery feedback',
      description: 'Give IP Leads a focused route to communicate priorities, guidance and changes to the practitioners who need them, while consolidating relevant field feedback into a clear and actionable signal.',
      signal: 'IP Leads reach the relevant audience and receive consolidated, relevant feedback through one trusted community channel.'
    }
  ],
  deliveryMechanics: [
    {
      title: 'Focus the themes',
      description: 'Use fewer, higher-value topics and link every community to a clear theme so neighbouring communities do not compete for the same attention.'
    },
    {
      title: 'Nominate accountable experts',
      description: 'Name one Community Lead and between one and five Subject Matter Experts according to each community’s breadth, demand and delivery priorities.'
    },
    {
      title: 'Right-size forums',
      description: 'Narrow each audience to the roles that benefit, then consolidate or retire forums that no longer earn their members’ attention.'
    },
    {
      title: 'Use one governance portal',
      description: 'Maintain one source of truth for community identity, membership, charters, owned content, channels and health reporting.'
    }
  ],
  leadershipAsks: [
    'Endorse the Technical Communities initiative and its governance portal.',
    'Enable the work required to right-size forum audiences.',
    'Sponsor timely Community Lead and Subject Matter Expert nominations for every community.'
  ],
  communities: [
    {
      key: 'azure',
      title: 'Azure',
      category: 'Domain community',
      serviceFamily: 'Azure',
      summary: 'Reliable, secure and repeatable Azure delivery across infrastructure, migration, platform engineering and AI-ready cloud foundations.',
      purpose: 'Connect Azure practitioners around real delivery challenges, proven implementation patterns and current offering guidance. The community makes specialist knowledge easier to reach, strengthens consistency across engagements and provides Azure IP Leads with consolidated feedback from the field.',
      scopeInScope: 'Azure landing zones, infrastructure modernisation, migration execution, resilience, platform engineering, cloud operations and the Azure platform capabilities that enable AI workloads. Members share delivery patterns, clarify aligned IP, resolve recurring blockers and convert field experience into reusable practice.',
      scopeOutOfScope: 'Application innovation, Modern Work, Business Applications and security topics without a direct Azure platform outcome. Those needs are routed to the relevant neighbouring community while cross-domain dependencies are coordinated jointly.',
      outcomes: ['Faster access to proven Azure delivery patterns and specialists', 'More consistent use of aligned offerings and reusable guidance', 'Consolidated practitioner feedback for Azure IP Leads and service owners'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner CSAs (pCSAs)', 'Partner Leads', 'Nebula members'],
      alignedIps: ['Health', 'Crisis Readiness Sim for Azure', 'AIR', 'MACC alignment', 'Capability Briefing Resiliency and Security'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'security',
      title: 'Security',
      category: 'Domain community',
      serviceFamily: 'Security',
      summary: 'Security delivery excellence across identity, threat protection, data security, posture management and resilience.',
      purpose: 'Bring security practitioners together to solve complex delivery issues, share current technical guidance and improve the quality and repeatability of customer outcomes. The community creates a focused route for Security IP Leads to communicate changes and receive structured field insight.',
      scopeInScope: 'Identity and access, threat protection, data security, security posture, security operations and security-specific resilience practices. Members exchange delivery lessons, interpret offering guidance, identify common risks and surface improvements needed in methods and IP.',
      scopeOutOfScope: 'General infrastructure, application engineering or adoption topics without a defined security outcome. Cross-solution questions remain coordinated with the relevant domain community rather than duplicated here.',
      outcomes: ['Quicker resolution of difficult security delivery questions', 'Consistent adoption of approved security methods and offerings', 'A stronger feedback loop between practitioners and Security IP Leads'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner CSAs (pCSAs)', 'Partner Leads', 'Managers'],
      alignedIps: ['ESA', 'Crisis Readiness Sim for Security', 'Capability Briefing Resiliency and Security'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'modern-apps',
      title: 'Modern-Apps',
      category: 'Domain community',
      serviceFamily: 'Modern-Apps',
      summary: 'Modern application delivery spanning cloud-native engineering, application modernisation, developer productivity and DevOps.',
      purpose: 'Create a practical forum for application practitioners to exchange architecture patterns, engineering lessons and delivery guidance. The community helps teams apply aligned offerings consistently and gives Modern-Apps IP Leads a concentrated view of practitioner needs and recurring delivery friction.',
      scopeInScope: 'Application innovation, cloud-native architecture, application modernisation, developer productivity, GitHub, DevOps and software delivery practices. Discussion is anchored in executable patterns, engagement experience and improvements that can be reused across teams.',
      scopeOutOfScope: 'Platform operations, end-user productivity and Business Applications topics that do not depend on application engineering. Dependencies are handled with Azure, M365 or D365 rather than creating parallel guidance.',
      outcomes: ['Reusable engineering patterns grounded in delivery experience', 'Stronger consistency across modernisation and cloud-native engagements', 'Prioritised feedback for Modern-Apps offering and IP evolution'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner CSAs (pCSAs)', 'Partner Leads', 'Nebula members'],
      alignedIps: ['GitHub Copilot', 'Cloud Modernization'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'm365',
      title: 'M365',
      category: 'Domain community',
      serviceFamily: 'M365',
      summary: 'Modern Work delivery across Microsoft 365, Copilot, agents, adoption and secure productivity experiences.',
      purpose: 'Connect practitioners delivering Microsoft 365 outcomes so they can share implementation insight, adoption patterns and current offering guidance. The community aligns technical and change perspectives while giving M365 IP Leads a focused channel for communication and field feedback.',
      scopeInScope: 'Microsoft 365 services, Microsoft 365 Copilot, agents, adoption, governance and secure productivity experiences. Members address delivery readiness, implementation patterns, customer adoption barriers and lessons that improve repeatability.',
      scopeOutOfScope: 'Core Azure platform engineering, custom cloud-native application development and Business Applications implementation. Topics move to those communities when the primary outcome sits outside Modern Work.',
      outcomes: ['Integrated technical and adoption guidance for Modern Work delivery', 'Faster access to practitioners with relevant implementation experience', 'Consolidated feedback for M365 offerings, IP and readiness priorities'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner CSAs (pCSAs)', 'Partner Leads', 'Managers'],
      alignedIps: ['Health', 'Crisis Readiness Sim for M365', 'Copilot Adoption', 'Agents', 'Secure Copilot'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'd365',
      title: 'D365',
      category: 'Domain community',
      serviceFamily: 'D365',
      summary: 'Business Applications delivery across Dynamics 365, Power Platform and the practices required for sustainable adoption.',
      purpose: 'Build a connected practitioner network for Dynamics 365 and Power Platform delivery. The community shares implementation knowledge, clarifies aligned IP and gives D365 IP Leads a reliable channel to communicate priorities and understand consolidated field feedback.',
      scopeInScope: 'Dynamics 365, Business Applications, Power Platform, governance, implementation quality and the readiness and adoption practices that support durable outcomes. Members compare delivery approaches and turn recurring lessons into reusable guidance.',
      scopeOutOfScope: 'Custom cloud-native engineering and Modern Work topics without a Business Applications outcome. Integration dependencies are coordinated with Modern-Apps, Azure or M365 as appropriate.',
      outcomes: ['Improved consistency across Business Applications engagements', 'Accessible peer expertise for recurring implementation challenges', 'Actionable practitioner feedback for D365 IP Leads and offering teams'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner CSAs (pCSAs)', 'Partner Leads', 'Managers'],
      alignedIps: ['Health', 'Crisis Readiness Sim for D365'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'csam-back-office',
      title: 'CSAM Back Office',
      category: 'Domain community',
      serviceFamily: 'CSAM Back Office',
      summary: 'Consistent delivery operations, CSAM enablement and back-office practices that make technical execution easier to navigate.',
      purpose: 'Improve the operational experience around delivery by connecting practitioners who shape CSAM enablement, planning and back-office processes. The community clarifies working practices, reduces avoidable friction and channels structured feedback to the relevant process and IP owners.',
      scopeInScope: 'Delivery operations, CSAM enablement, planning practices, internal process guidance and the supporting back-office capabilities used across engagements. Members identify friction, share effective practices and improve how operational information reaches delivery teams.',
      scopeOutOfScope: 'Domain-specific technical depth owned by Azure, Security, Modern-Apps, M365 and D365. Technical questions are routed to those communities while this group addresses the operating process around them.',
      outcomes: ['Clearer and more consistent delivery operating practices', 'Reduced friction in CSAM and back-office interactions', 'Concentrated feedback for process owners and aligned IP Leads'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner CSAs (pCSAs)', 'Managers'],
      alignedIps: ['SPOU', 'SfP'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'cross-training',
      title: 'Cross-Training',
      category: 'Cross-community',
      serviceFamily: 'Cross-community',
      summary: 'Delivery Excellence practices that strengthen execution across every technical domain without owning delivery offerings.',
      purpose: 'Improve Delivery Excellence by giving practitioners one place to strengthen the horizontal capabilities used in every engagement. Cross-Training connects lessons across domains, promotes practical peer learning and helps delivery teams apply consistent ways of working.',
      scopeInScope: 'Processes, Delivery Best Practices, Soft Skills, the Common Health core and the Common Crisis Readiness core. These are treated as cross-domain learning and delivery-excellence topics, supported by peer exchange, practical examples and lessons learned from active engagements.',
      scopeOutOfScope: 'Ownership of delivery offerings or IP, domain-specific technical strategy and duplicated technical variants that belong with Azure, Security, Modern-Apps, M365, D365 or CSAM Back Office.',
      outcomes: ['Stronger delivery discipline and professional practice across domains', 'Reusable lessons that improve engagement quality and consistency', 'A shared learning environment for cross-domain delivery capability'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner CSAs (pCSAs)', 'Partner Leads', 'Nebula members', 'Managers'],
      alignedIps: [],
      areas: ['Processes', 'Delivery Best Practices', 'Soft Skills', 'Common Health core', 'Common Crisis Readiness core'],
      noOfferingsMessage: 'No offerings aligned. The community exists to improve Delivery Excellence.',
      status: 'Charter required',
      crossCommunity: true
    },
    {
      key: 'ai',
      title: 'AI',
      category: 'Cross-community',
      serviceFamily: 'Cross-community',
      summary: 'Internal AI readiness, practical fluency and responsible adoption across Success Services Delivery.',
      purpose: 'Build the confidence and practical capability required for SSD colleagues to use AI responsibly in everyday work. The community makes effective practices visible, supports role-based peer learning and turns adoption experience into guidance that benefits the wider organisation.',
      scopeInScope: 'Internal AI readiness, practical AI fluency, responsible use, role-based enablement, peer learning and adoption of AI-assisted ways of working. Discussion focuses on safe experimentation, repeatable productivity patterns and the organisational habits needed for sustainable adoption.',
      scopeOutOfScope: 'Partner CSA readiness, partner enablement, customer-facing AI delivery, domain-specific AI platform strategy and ownership of delivery offerings or IP. Technical offering questions remain with the appropriate domain community.',
      outcomes: ['Greater confidence using AI responsibly in everyday work', 'Role-relevant practices that move from experimentation to repeatable adoption', 'A visible internal network for peer support and shared learning'],
      targetRoles: ['CSAs', 'POD Leads', 'Partner Leads', 'Nebula members', 'Managers'],
      alignedIps: [],
      areas: ['AI fluency', 'Responsible AI practice', 'Everyday AI adoption'],
      noOfferingsMessage: 'No offerings aligned. The community exists to build internal AI readiness and responsible adoption.',
      status: 'Charter required',
      crossCommunity: true,
      internalOnly: true
    }
  ],
  sharedIpPrinciple: 'Where aligned offerings recur across domains, IP Leads coordinate shared guidance and each domain community owns its relevant application. Cross-Training focuses on Delivery Excellence topics and does not own offerings or IP.',
  roles: [
    {
      title: 'Executive Sponsor',
      scope: 'Portfolio',
      holder: 'Leandro Frasso',
      accountabilities: [
        'Secure Leadership Team endorsement and remove organisational blockers',
        'Own the relationship with the DTI v-team',
        'Sponsor quarterly checkpoint reporting'
      ]
    },
    {
      title: 'Community Program Manager',
      scope: 'Portfolio',
      holder: 'One accountable role across all eight communities',
      accountabilities: [
        'Own community health reporting and consistent governance across the portfolio',
        'Onboard Community Leads and run cross-community rituals',
        'Maintain one programme rather than eight disconnected efforts'
      ]
    },
    {
      title: 'Community Lead',
      scope: 'One named lead per community',
      holder: 'Nomination required',
      accountabilities: [
        'Own the charter, theme, cadence and community activation',
        'Seed and moderate discussion, and promote visible SMEs',
        'Coordinate aligned content, IP Lead communication, member feedback and health reporting'
      ]
    },
    {
      title: 'Subject Matter Experts',
      scope: 'One to five nominated SMEs per community',
      holder: 'Nomination required according to community needs',
      accountabilities: [
        'Bring recognised technical or operational depth to member discussions',
        'Bridge the community to IP Leads and CSAM Strategy Org experts',
        'Support member questions, validate guidance and concentrate actionable feedback'
      ]
    },
    {
      title: 'Invited Experts',
      scope: 'As needed',
      holder: 'CSAM Strategy Org experts and IP Leads',
      accountabilities: [
        'Contribute where specialist depth is genuinely needed',
        'Remain invited rather than default members to protect scarce expert time'
      ]
    },
    {
      title: 'Members',
      scope: 'Voluntary participation',
      holder: 'CSAs, POD Leads, Partner CSAs (pCSAs), Partner Leads, Nebula members, managers and CSAM Strategy Org experts',
      accountabilities: [
        'Join the community for which they have a genuine interest',
        'Participate where value is clear; membership carries no mandatory meeting obligation',
        'Contribute questions, answers, experience, reusable learning and relevant feedback for IP Leads'
      ]
    }
  ],
  singleCommunityPrinciple: 'A member who belongs to one community they genuinely care about contributes more than one enrolled in several they skim. Focus is a deliberate protection against recreating overload.',
  launchStages: [
    {
      number: 1,
      title: 'Charter',
      description: 'Define the theme, boundaries, target audience, Community Lead, one to five nominated SMEs, aligned offerings, channels, cadence, launch readiness and health baseline. The Program Manager, Community Lead and one nominated SME sign off.'
    },
    {
      number: 2,
      title: 'Seed',
      description: 'Recruit committed founding members and named SMEs. Seed existing IP, recent delivery questions and assets migrating from forums being retired.'
    },
    {
      number: 3,
      title: 'Launch',
      description: 'Run a first event that provides visible member value by solving a live problem or walking through relevant IP, rather than simply announcing the community.'
    },
    {
      number: 4,
      title: 'Sustain',
      description: 'Hold the promised cadence without exception for the first quarter. Reliability matters more than initial attendance.'
    }
  ],
  readinessItems: [
    'Theme and scope are approved, with overlap reviewed',
    'Community Lead and one to five Subject Matter Experts are nominated',
    'Viva Engage and chat channels are ready',
    'Founding members and starter content are seeded',
    'Cadence, interaction model and readiness plan are agreed',
    'Six health measures have a launch baseline'
  ],
  criticalMass: 'Where a domain is too thin to sustain a standalone circle, start it as a sub-community or channel under a broader umbrella and let it graduate when it reaches critical mass. Fewer healthy rooms are better than eight half-empty ones.',
  rhythm: [
    {
      title: 'Community working session',
      cadence: 'Set and reliably held by each Community Lead',
      purpose: 'Solve problems, share domain depth and sustain the community theme.'
    },
    {
      title: 'Office hours',
      cadence: 'On-demand or recurring where they earn their place',
      purpose: 'Provide direct access to SMEs without creating unnecessary recurring meetings.'
    },
    {
      title: 'Asynchronous support',
      cadence: 'Continuous in chat and Viva Engage',
      purpose: 'Chat provides fast answers; Viva Engage preserves decisions, curated knowledge and reusable content.'
    },
    {
      title: 'Cross-community lesson exchange',
      cadence: 'Quarterly',
      purpose: 'Each vertical presents one lesson learned, spreading practice and preventing silos.'
    },
    {
      title: 'Community Leads review',
      cadence: 'Regular portfolio cadence',
      purpose: 'Review health, surface cross-community topics, share concentrated member feedback and coordinate communication from IP Leads.'
    }
  ],
  channels: [
    {
      title: 'Private Viva Engage community',
      rule: 'Use when information must last and remain findable.',
      content: 'Announcements, charters, decisions, curated content and accumulated community knowledge.'
    },
    {
      title: 'Chat group',
      rule: 'Use for fast, conversational, in-the-moment support.',
      content: 'Questions, same-day answers, working help and the interactions that drive time-to-answer.'
    },
    {
      title: 'Governance Portal',
      rule: 'Use as the single source of truth for where to go and how the community operates.',
      content: 'Scope, roles, assignments, charter, aligned offerings, health and links to join both channels.'
    }
  ],
  communityOwnedDecisions: [
    'The interaction model and approach that fit the members and domain',
    'The readiness and certification plan for the skills the domain requires',
    'The communication pattern and whether office hours are on-demand or recurring'
  ],
  governanceTest: 'Does this change increase member value, or only administrative tidiness? Use the lightest governance that still provides clear accountability.',
  healthMeasures: [
    {
      dimension: 'Participation',
      metric: 'Percentage of eligible members active monthly, per community',
      why: 'Measures real health rather than enrolled headcount.',
      direction: 'Higher is generally better'
    },
    {
      dimension: 'Contribution',
      metric: 'Active contributors versus lurkers; SME answer rate',
      why: 'A committed contributing minority determines whether a community lives or dies.',
      direction: 'Higher is generally better'
    },
    {
      dimension: 'Responsiveness',
      metric: 'Median time to answer a member question',
      why: 'Provides direct proof that members support one another.',
      direction: 'Lower is better'
    },
    {
      dimension: 'Knowledge reuse',
      metric: 'Duplicate content reduction; search success rate',
      why: 'Tests the single-source-of-truth claim.',
      direction: 'Higher reuse and search success are better'
    },
    {
      dimension: 'Belonging',
      metric: 'Member pulse or would-recommend score',
      why: 'Signals churn risk before participation falls.',
      direction: 'Higher is generally better'
    },
    {
      dimension: 'Cross-pollination',
      metric: 'Cross-community participation, especially through Cross-Training',
      why: 'Shows whether the connective tissue across verticals is working.',
      direction: 'Higher is generally better'
    }
  ],
  risks: [
    {
      risk: 'Platform-first failure',
      consequence: 'The portal ships but engagement does not follow.',
      mitigation: 'Run activation in parallel with the portal build and launch communities on existing tooling.'
    },
    {
      risk: 'Unowned communities',
      consequence: 'A community without a named accountable lead goes quiet within a quarter.',
      mitigation: 'Name one Community Lead per community and one Program Manager across the portfolio before opening.'
    },
    {
      risk: 'Added overload',
      consequence: 'Eight new destinations make the original problem worse.',
      mitigation: 'Use focused membership, right-size audiences and consolidate redundant communication channels as part of launch governance.'
    },
    {
      risk: 'Siloed verticals',
      consequence: 'Domain depth increases while organisational perspective narrows.',
      mitigation: 'Operate Cross-Training as a live practice and measure cross-community participation.'
    }
  ],
  roadmap: [
    {
      period: 'H1 FY27',
      title: 'Foundation',
      deliverables: [
        'Community Governance Portal',
        'Eight signed charters and named Community Leads',
        'Seeded launches with relevant starter content and nominated SMEs',
        'Baseline health metrics'
      ]
    },
    {
      period: 'H2 FY27',
      title: 'Scale',
      deliverables: [
        'Adoption enablement focused on community behaviours, not tooling alone',
        'Cross-community ritual cadence across all six verticals',
        'Quarterly health and consolidation evidence'
      ]
    }
  ],
  checkpoints: [
    { label: 'Q2 checkpoint', date: 'November 2026', purpose: 'Review foundation progress, launch health and early member value.' },
    { label: 'Q3 checkpoint', date: 'February 2027', purpose: 'Assess activation, cross-community practice and health movement.' },
    { label: 'Year-end review', date: 'May 2027', purpose: 'Evaluate FY27 outcomes, portfolio effectiveness and the scale decision.' }
  ]
};