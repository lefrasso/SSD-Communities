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
    summary: 'The operating manual for launching and sustaining seven governed technical communities across Success Services Delivery.',
    context: 'The initiative sits within the Delivery Transformation Initiative as the Technical Communities sub-initiative. It responds to community and knowledge overload by combining a single source of truth with focused, governed communities.',
    audiences: [
      'Leadership Team members sponsoring the work',
      'Community Leads accountable for each circle',
      'CSAs, POD Leads, Delivery Partners, Partner Leads, Nebula members and managers who participate'
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
    }
  ],
  deliveryMechanics: [
    {
      title: 'Focus the themes',
      description: 'Use fewer, higher-value topics and link every community to a clear theme so neighbouring communities do not compete for the same attention.'
    },
    {
      title: 'Align with Family Owners',
      description: 'Connect each service family to Family Owners across time zones so the communities reinforce the delivery organisation instead of running alongside it.'
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
    'Sponsor Family Owner alignment across service families and time zones.'
  ],
  communities: [
    {
      key: 'azure',
      title: 'Azure',
      category: 'Domain community',
      serviceFamily: 'Azure',
      summary: 'Cloud infrastructure, migration and the AI platform.',
      scopeInScope: 'Azure infrastructure, migration, landing zones, resilience, platform engineering and the AI platform.',
      scopeOutOfScope: 'Application innovation, Modern Work, Business Applications and security topics owned by neighbouring communities.',
      targetRoles: ['CSAs', 'POD Leads', 'Delivery Partners', 'Partner Leads', 'Nebula members'],
      alignedIps: ['Health', 'Crisis Readiness Sim for Azure', 'AIR', 'MACC alignment', 'Capability Briefing Resiliency and Security'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'security',
      title: 'Security',
      category: 'Domain community',
      serviceFamily: 'Security',
      summary: 'Threat protection, identity and data security.',
      scopeInScope: 'Threat protection, identity, data security, security posture and domain-specific resiliency practices.',
      scopeOutOfScope: 'General infrastructure, application engineering and adoption topics without a security-specific outcome.',
      targetRoles: ['CSAs', 'POD Leads', 'Delivery Partners', 'Partner Leads', 'Managers'],
      alignedIps: ['ESA', 'Crisis Readiness Sim for Security', 'Capability Briefing Resiliency and Security'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'modern-apps',
      title: 'Modern-Apps',
      category: 'Domain community',
      serviceFamily: 'Modern-Apps',
      summary: 'Application innovation, cloud-native development and DevOps.',
      scopeInScope: 'Application innovation, cloud-native architecture, modernisation, developer productivity, GitHub and DevOps practices.',
      scopeOutOfScope: 'Platform operations, end-user productivity and Business Applications topics outside application engineering.',
      targetRoles: ['CSAs', 'POD Leads', 'Delivery Partners', 'Partner Leads', 'Nebula members'],
      alignedIps: ['GitHub Copilot', 'Cloud Modernization'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'm365',
      title: 'M365',
      category: 'Domain community',
      serviceFamily: 'M365',
      summary: 'Modern Work and Microsoft 365 Copilot.',
      scopeInScope: 'Modern Work, Microsoft 365 Copilot, agents, adoption and secure productivity experiences.',
      scopeOutOfScope: 'Core Azure platform, custom application engineering and Business Applications implementation.',
      targetRoles: ['CSAs', 'POD Leads', 'Delivery Partners', 'Partner Leads', 'Managers'],
      alignedIps: ['Health', 'Crisis Readiness Sim for M365', 'Copilot Adoption', 'Agents', 'Secure Copilot'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'd365',
      title: 'D365',
      category: 'Domain community',
      serviceFamily: 'D365',
      summary: 'Business Applications and Power Platform.',
      scopeInScope: 'Dynamics 365, Business Applications, Power Platform and their delivery and readiness practices.',
      scopeOutOfScope: 'Custom cloud-native development and Modern Work topics without a Business Applications outcome.',
      targetRoles: ['CSAs', 'POD Leads', 'Delivery Partners', 'Partner Leads', 'Managers'],
      alignedIps: ['Health', 'Crisis Readiness Sim for D365'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'csam-back-office',
      title: 'CSAM Back Office',
      category: 'Domain community',
      serviceFamily: 'CSAM Back Office',
      summary: 'Delivery operations and CSAM enablement.',
      scopeInScope: 'Delivery operations, CSAM enablement, operating practices and the supporting back-office capability.',
      scopeOutOfScope: 'Domain-specific technical depth owned by Azure, Security, Modern-Apps, M365 and D365.',
      targetRoles: ['CSAs', 'POD Leads', 'Delivery Partners', 'Managers'],
      alignedIps: ['SPOU', 'SfP'],
      status: 'Charter required',
      crossCommunity: false
    },
    {
      key: 'cross-training',
      title: 'Cross-Training',
      category: 'Cross-community',
      serviceFamily: 'Cross-community',
      summary: 'Processes, Delivery Best Practices and Soft Skills shared across all six domains.',
      scopeInScope: 'Horizontal capability that every delivery domain needs and no single vertical owns, including reusable common IP cores and lessons learned.',
      scopeOutOfScope: 'Domain-specific technical strategy or duplicated variants that belong with a vertical community.',
      targetRoles: ['CSAs', 'POD Leads', 'Delivery Partners', 'Partner Leads', 'Nebula members', 'Managers'],
      alignedIps: ['Processes', 'Delivery Best Practices', 'Soft Skills', 'Common Health core', 'Common Crisis Readiness core'],
      areas: ['Processes', 'Delivery Best Practices', 'Soft Skills'],
      status: 'Charter required',
      crossCommunity: true
    }
  ],
  sharedIpPrinciple: 'Health, Crisis Readiness Simulations, and Capability Briefing Resiliency and Security recur across domains. Build the common core once in Cross-Training; domain communities own only the domain-specific variant.',
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
      holder: 'One accountable role across all seven communities',
      accountabilities: [
        'Own community health reporting and the forum retirement programme',
        'Onboard Community Leads and run cross-community rituals',
        'Maintain one programme rather than seven disconnected efforts'
      ]
    },
    {
      title: 'Community Lead',
      scope: 'One named lead per community',
      holder: 'Aligned to the relevant Family Owner',
      accountabilities: [
        'Own the charter, theme, cadence and community activation',
        'Seed and moderate discussion, and promote visible SMEs',
        'Curate owned IP and report health metrics'
      ]
    },
    {
      title: 'Subject Matter Experts / Family Owners',
      scope: 'Per service family and time zone',
      holder: 'Family Owners acting as community SMEs',
      accountabilities: [
        'Represent service families across time zones',
        'Bridge communities to IP Dev Teams and CSAM Strategy Adoption Leads',
        'Co-sign the charter and support member questions'
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
      holder: 'CSAs, POD Leads, Delivery Partners, Partner Leads, Nebula members and managers',
      accountabilities: [
        'Join the community for which they have a genuine interest',
        'Participate where value is clear; membership carries no mandatory meeting obligation',
        'Contribute questions, answers, experience and reusable learning'
      ]
    }
  ],
  singleCommunityPrinciple: 'A member who belongs to one community they genuinely care about contributes more than one enrolled in six they skim. Focus is a deliberate protection against recreating overload.',
  launchStages: [
    {
      number: 1,
      title: 'Charter',
      description: 'Define theme, boundaries, target roles, aligned Family Owner, Lead and SMEs, owned IP, channels, cadence, launch readiness and health baseline. Program Manager, Lead and Family Owner sign off.'
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
    'Community Lead and time-zone Family Owners are named',
    'Viva Engage and chat channels are ready',
    'Founding members and starter content are seeded',
    'Cadence, interaction model and readiness plan are agreed',
    'Six health measures have a launch baseline'
  ],
  criticalMass: 'Where a domain is too thin to sustain a standalone circle, start it as a sub-community or channel under a broader umbrella and let it graduate when it reaches critical mass. Five healthy rooms are better than seven half-empty ones.',
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
      purpose: 'Review health, surface cross-community topics and manage the retirement backlog.'
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
      content: 'Scope, roles, assignments, charter, owned IP, health, and links to join both channels.'
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
  overload: {
    statement: 'Adding seven communities without retiring overlapping forums would increase the surface area. Consolidation is therefore a programme deliverable, not an accidental by-product.',
    dispositions: [
      { title: 'Migrate', description: 'Move useful members, content and activity into the appropriate governed community.' },
      { title: 'Merge', description: 'Combine overlapping forums into one right-sized community or channel.' },
      { title: 'Close', description: 'Retire forums that no longer earn their audience or duplicate a governed destination.' }
    ],
    target: 'Publish a reduction target expressed as the number of forums consolidated into the seven governed communities.'
  },
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
      consequence: 'Seven new destinations make the original problem worse.',
      mitigation: 'Maintain the retirement inventory, right-size audiences and publish a reduction target.'
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
        'Seven signed charters and named Community Leads',
        'Seeded launches and retirement inventory',
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
    { label: 'Q2 checkpoint', date: 'November 2026', purpose: 'Review foundation progress, launch health and early consolidation.' },
    { label: 'Q3 checkpoint', date: 'February 2027', purpose: 'Assess activation, cross-community practice and health movement.' },
    { label: 'Year-end review', date: 'May 2027', purpose: 'Evaluate FY27 outcomes, forum reduction and the scale decision.' }
  ],
  glossary: [
    { term: 'Community', definition: 'A voluntary, peer-led circle around a shared technical or operational domain, with a named lead, defined theme and regular cadence.' },
    { term: 'Sub-community', definition: 'A focused group under a parent community, used where a domain lacks critical mass for a standalone circle.' },
    { term: 'Cross-community', definition: 'The single cross-cutting community spanning all six domains and covering Processes, Delivery Best Practices and Soft Skills.' },
    { term: 'Family Owner', definition: 'The service-family representative for a time zone, acting as a community SME and alignment point to IP Dev Teams and CSAM Strategy Adoption Leads.' },
    { term: 'IP', definition: 'A delivery intellectual property asset owned and maintained by a community.' },
    { term: 'Governance Portal', definition: 'The single source of truth defining each community’s scope, roles, assignments, charter, health and channel links.' },
    { term: 'Community Charter', definition: 'The one-page launch gate covering identity, scope, roles, IP, channels, working model, readiness, baseline and sign-off.' }
  ]
};