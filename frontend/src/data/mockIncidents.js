export const CATEGORIES = [
  'IT Equipment',
  'Network',
  'Infrastructure',
  'Maintenance',
  'Safety',
  'Other',
];

export const PRIORITIES = [
  { value: 'Low', label: 'Low', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { value: 'Medium', label: 'Medium', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { value: 'High', label: 'High', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { value: 'Critical', label: 'Critical', color: 'bg-[#501B24] text-[#EAC4CF] border-[#651F2B]' },
];

export const STATUSES = [
  'Open',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const INITIAL_INCIDENTS = [
  {
    id: 'INC-1048',
    title: 'Core Switch Fiber Uplink Failure — CS Block B',
    description: 'The primary 10Gbps fiber uplink on the second floor rack disconnected unexpectedly. All research laboratories and computer labs in Block B are currently operating on high-latency fallback or without LAN access.',
    category: 'Network',
    priority: 'Critical',
    status: 'In Progress',
    location: 'Computer Science Building, Block B - Server Room 204',
    reportedBy: 'Prof. Ramesh Kulkarni (Dept. Head)',
    assignee: 'Alex Rivera (Network Ops Lead)',
    createdAt: '2026-10-23T09:15:00Z',
    updatedAt: '2026-10-23T11:40:00Z',
    resolutionRemarks: 'SFP+ transceiver replaced; testing packet error rate and CRC counters before restoring primary routing.',
    timeline: [
      {
        timestamp: '2026-10-23T09:15:00Z',
        status: 'Open',
        actor: 'Prof. Ramesh Kulkarni',
        note: 'High latency and complete packet loss reported across Lab 3 and Lab 4.'
      },
      {
        timestamp: '2026-10-23T09:45:00Z',
        status: 'Assigned',
        actor: 'Campus Dispatch',
        note: 'Escalated to Tier-2 Network Operations Team.'
      },
      {
        timestamp: '2026-10-23T10:30:00Z',
        status: 'In Progress',
        actor: 'Alex Rivera',
        note: 'Diagnosed faulty LC optic module on patch panel port 18. Replacement initiated.'
      }
    ]
  },
  {
    id: 'INC-1047',
    title: 'HVAC Chiller Leak Threatening Server Rack 3',
    description: 'Ceiling condensation and condensation line leakage observed directly above Rack 3 housing the campus LMS and database replica servers. Requires urgent drip containment and HVAC maintenance.',
    category: 'Infrastructure',
    priority: 'High',
    status: 'In Progress',
    location: 'Central IT Data Center, Basement Level A',
    reportedBy: 'Kavita Sundaram (SysAdmin)',
    assignee: 'Campus Facilities - HVAC Unit',
    createdAt: '2026-10-23T07:50:00Z',
    updatedAt: '2026-10-23T09:20:00Z',
    resolutionRemarks: 'Temporary moisture deflector canopy installed. HVAC technicians clearing blocked condensate pipe.',
    timeline: [
      {
        timestamp: '2026-10-23T07:50:00Z',
        status: 'Open',
        actor: 'Kavita Sundaram',
        note: 'Sensors triggered humidity warning; visual check confirmed active drip.'
      },
      {
        timestamp: '2026-10-23T08:15:00Z',
        status: 'Assigned',
        actor: 'Facilities Coordinator',
        note: 'Assigned with emergency priority to Senior HVAC Tech.'
      },
      {
        timestamp: '2026-10-23T08:40:00Z',
        status: 'In Progress',
        actor: 'Facilities - HVAC Unit',
        note: 'Water supply isolated; drain pump being cleared.'
      }
    ]
  },
  {
    id: 'INC-1046',
    title: 'Interactive Smartboard Optical Sensor Malfunction',
    description: 'Touch response on the 85-inch interactive display in Seminar Hall 1 is erratic. Touch points register 6 inches away from stylus contact, disrupting ongoing guest lecture series.',
    category: 'IT Equipment',
    priority: 'Medium',
    status: 'Assigned',
    location: 'Management Studies Block, Seminar Hall 1',
    reportedBy: 'Dr. Anita Mehta (Guest Coordinator)',
    assignee: 'Multimedia Support Staff',
    createdAt: '2026-10-22T16:20:00Z',
    updatedAt: '2026-10-23T08:00:00Z',
    resolutionRemarks: 'Scheduled for optical bezel recalibration between lecture sessions at 1:00 PM.',
    timeline: [
      {
        timestamp: '2026-10-22T16:20:00Z',
        status: 'Open',
        actor: 'Dr. Anita Mehta',
        note: 'Smartboard touch calibration failed after system reboot.'
      },
      {
        timestamp: '2026-10-23T08:00:00Z',
        status: 'Assigned',
        actor: 'IT Helpdesk',
        note: 'Assigned to Multimedia Support specialist.'
      }
    ]
  },
  {
    id: 'INC-1045',
    title: 'Emergency Exit Door Alarm Sensor Stuck Open',
    description: 'The magnetic contact sensor on the West Emergency Fire Exit of the Central Library continues to beep intermittently despite physical latch engagement.',
    category: 'Safety',
    priority: 'High',
    status: 'Open',
    location: 'Central Library, Ground Floor West Wing',
    reportedBy: 'Marcus Vance (Security Shift Officer)',
    assignee: 'Unassigned',
    createdAt: '2026-10-23T06:10:00Z',
    updatedAt: '2026-10-23T06:10:00Z',
    resolutionRemarks: '',
    timeline: [
      {
        timestamp: '2026-10-23T06:10:00Z',
        status: 'Open',
        actor: 'Marcus Vance',
        note: 'Audible alarm sounded during morning security patrol. Magnet alignment seems warped.'
      }
    ]
  },
  {
    id: 'INC-1044',
    title: 'High-Density 4K Projector Lamp Burnt Out',
    description: 'Main lecture theater auditorium projector shut down with blinking red lamp error LED during mid-term engineering graphics exam briefing.',
    category: 'IT Equipment',
    priority: 'Medium',
    status: 'Resolved',
    location: 'Main Auditorium, Hall 101',
    reportedBy: 'Prof. Sandeep Joshi',
    assignee: 'AV Support Team',
    createdAt: '2026-10-21T11:00:00Z',
    updatedAt: '2026-10-22T14:30:00Z',
    resolutionRemarks: 'Replaced OEM lamp unit with genuine spare. Filter cleaned and runtime counter reset. Verified 1080p and 4K display inputs.',
    timeline: [
      {
        timestamp: '2026-10-21T11:00:00Z',
        status: 'Open',
        actor: 'Prof. Sandeep Joshi',
        note: 'Projector display flickered and lamp indicator went solid red.'
      },
      {
        timestamp: '2026-10-21T11:30:00Z',
        status: 'Assigned',
        actor: 'AV Helpdesk',
        note: 'Assigned to AV technician with parts requisition.'
      },
      {
        timestamp: '2026-10-22T10:00:00Z',
        status: 'In Progress',
        actor: 'AV Support Team',
        note: 'Unit dismounted and replacement lamp module seated.'
      },
      {
        timestamp: '2026-10-22T14:30:00Z',
        status: 'Resolved',
        actor: 'AV Support Team',
        note: 'Color calibration tests passed; sign-off obtained from auditorium supervisor.'
      }
    ]
  },
  {
    id: 'INC-1043',
    title: 'North Campus Wi-Fi Captive Portal Authentication Timeout',
    description: 'Students connecting to the "CampusSecure-802.1x" SSID receive SSL certificate timeout warning on the captive portal page, preventing internet login on Android & macOS devices.',
    category: 'Network',
    priority: 'Medium',
    status: 'Resolved',
    location: 'North Residential Hostels & Student Dining Hub',
    reportedBy: 'Student Welfare Committee',
    assignee: 'Cloud Systems Engineer',
    createdAt: '2026-10-20T19:00:00Z',
    updatedAt: '2026-10-21T16:00:00Z',
    resolutionRemarks: 'Renewed SSL certificate chain on RADIUS authentication servers and reloaded nginx proxy configuration.',
    timeline: [
      {
        timestamp: '2026-10-20T19:00:00Z',
        status: 'Open',
        actor: 'Student Welfare Committee',
        note: 'Multiple hostel residents reported inability to authenticate on WiFi.'
      },
      {
        timestamp: '2026-10-20T20:15:00Z',
        status: 'In Progress',
        actor: 'Cloud Systems Engineer',
        note: 'Investigating TLS handshake failure with RADIUS back-end.'
      },
      {
        timestamp: '2026-10-21T16:00:00Z',
        status: 'Resolved',
        actor: 'Cloud Systems Engineer',
        note: 'Intermediate certificate bundle updated; DNS cache flushed.'
      }
    ]
  },
  {
    id: 'INC-1042',
    title: 'Hydraulic Freight Lift Intermittent E-Stop Fault',
    description: 'The heavy equipment elevator in Mechanical Engineering Building trips the safety interlock when moving between the ground floor machine shop and 1st floor CAD lab.',
    category: 'Maintenance',
    priority: 'High',
    status: 'Closed',
    location: 'Mechanical Engineering Workshop Wing, Lift 2',
    reportedBy: 'Lab Technician Verma',
    assignee: 'Otis Elevator Maintenance Contract',
    createdAt: '2026-10-18T08:30:00Z',
    updatedAt: '2026-10-20T17:00:00Z',
    resolutionRemarks: 'Replaced faulty leveling sensor switch on floor 1 door interlock. Passed 24-hour load cycle testing and safety inspector certification.',
    timeline: [
      {
        timestamp: '2026-10-18T08:30:00Z',
        status: 'Open',
        actor: 'Lab Technician Verma',
        note: 'Elevator halted midway with safety alarm.'
      },
      {
        timestamp: '2026-10-18T09:00:00Z',
        status: 'Assigned',
        actor: 'Campus Facilities',
        note: 'External vendor service dispatch ticket logged.'
      },
      {
        timestamp: '2026-10-19T11:00:00Z',
        status: 'In Progress',
        actor: 'Otis Maintenance Contract',
        note: 'Sensor replacement and hydraulic pressure valve adjustment.'
      },
      {
        timestamp: '2026-10-20T15:00:00Z',
        status: 'Resolved',
        actor: 'Otis Maintenance Contract',
        note: 'Safety certification signed off.'
      },
      {
        timestamp: '2026-10-20T17:00:00Z',
        status: 'Closed',
        actor: 'Admin Management',
        note: 'Verified regular operation; ticket officially closed.'
      }
    ]
  },
  {
    id: 'INC-1041',
    title: 'Broken Exterior Pathway Solar Lighting Fixtures',
    description: 'Three pathway luminaire posts between the Science Complex and Girls Hostel 3 are unlit after 7 PM, creating dark spots and potential safety hazards.',
    category: 'Safety',
    priority: 'Medium',
    status: 'In Progress',
    location: 'Science Complex - South Pathway Walkway',
    reportedBy: 'Campus Security & Student Council',
    assignee: 'Electrical Maintenance Division',
    createdAt: '2026-10-22T19:30:00Z',
    updatedAt: '2026-10-23T10:15:00Z',
    resolutionRemarks: 'Battery charge controllers diagnosed with rainwater ingress. Replacement weatherproof housings being installed.',
    timeline: [
      {
        timestamp: '2026-10-22T19:30:00Z',
        status: 'Open',
        actor: 'Campus Security',
        note: 'Night security patrol noted zero illumination on section B.'
      },
      {
        timestamp: '2026-10-23T08:30:00Z',
        status: 'Assigned',
        actor: 'Campus Facilities',
        note: 'Work order #849 issued to electrical team.'
      },
      {
        timestamp: '2026-10-23T10:15:00Z',
        status: 'In Progress',
        actor: 'Electrical Maintenance',
        note: 'Replacement charge controllers and seal gaskets dispatched.'
      }
    ]
  }
];
