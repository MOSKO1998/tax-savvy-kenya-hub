// Demo data service for Chandaria Shah & Associates
export const demoDataService = {
  getDemoClients: () => [
    {
      id: 'demo-client-001',
      name: 'Acme Corporation Ltd',
      email: 'acme@example.com',
      phone: '+254-722-111111',
      address: 'Industrial Area, Nairobi',
      tax_id: 'P051234567A',
      client_type: 'corporate',
      status: 'active',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'demo-client-002',
      name: 'John Doe Enterprises',
      email: 'john@example.com',
      phone: '+254-733-222222',
      address: 'Westlands, Nairobi',
      tax_id: 'P051234567B',
      client_type: 'individual',
      status: 'active',
      created_at: '2024-01-20T14:30:00Z',
      updated_at: '2024-01-20T14:30:00Z'
    },
    {
      id: 'demo-client-003',
      name: 'Tech Solutions Kenya Ltd',
      email: 'tech@example.com',
      phone: '+254-744-333333',
      address: 'Karen, Nairobi',
      tax_id: 'P051234567C',
      client_type: 'corporate',
      status: 'active',
      created_at: '2024-02-01T09:15:00Z',
      updated_at: '2024-02-01T09:15:00Z'
    }
  ],

  getDemoTaxObligations: () => [
    {
      id: 'demo-obligation-001',
      title: 'VAT Return Q1 2024',
      description: 'Quarterly VAT return filing',
      tax_type: 'vat',
      amount: 150000.00,
      due_date: '2024-04-20',
      status: 'completed',
      client_id: 'demo-client-001',
      completed_at: '2024-04-18T16:30:00Z',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'demo-obligation-002',
      title: 'PAYE March 2024',
      description: 'Monthly PAYE filing',
      tax_type: 'paye',
      amount: 85000.00,
      due_date: '2024-04-09',
      status: 'pending',
      client_id: 'demo-client-002',
      created_at: '2024-03-01T10:00:00Z'
    },
    {
      id: 'demo-obligation-003',
      title: 'Corporate Tax 2023',
      description: 'Annual corporate tax return',
      tax_type: 'corporate_tax',
      amount: 500000.00,
      due_date: '2024-06-30',
      status: 'pending',
      client_id: 'demo-client-003',
      created_at: '2024-02-01T09:15:00Z'
    },
    {
      id: 'demo-obligation-004',
      title: 'WHT Certificate Q1',
      description: 'Withholding tax certificate',
      tax_type: 'withholding_tax',
      amount: 25000.00,
      due_date: '2024-04-15',
      status: 'overdue',
      client_id: 'demo-client-001',
      created_at: '2024-01-15T10:00:00Z'
    }
  ],

  getDemoDocuments: () => [
    {
      id: 1,
      name: "VAT Return Q4 2023.pdf",
      client: "ABC Manufacturing Ltd",
      type: "Tax Return",
      uploadDate: "2024-01-15",
      uploadedBy: "John Kamau",
      size: "2.4 MB",
      status: "approved",
      category: "tax-returns"
    },
    {
      id: 2,
      name: "Financial Statements 2023.xlsx",
      client: "XYZ Services Ltd",
      type: "Financial Statement",
      uploadDate: "2024-01-14",
      uploadedBy: "Mary Wanjiku",
      size: "1.8 MB",
      status: "pending",
      category: "financial-statements"
    },
    {
      id: 3,
      name: "Corporation Tax Computation.pdf",
      client: "Kenya Exports Co.",
      type: "Tax Computation",
      uploadDate: "2024-01-13",
      uploadedBy: "Peter Mwangi",
      size: "3.2 MB",
      status: "approved",
      category: "tax-returns"
    },
    {
      id: 4,
      name: "Board Resolution.pdf",
      client: "Tech Solutions Ltd",
      type: "Legal Document",
      uploadDate: "2024-01-12",
      uploadedBy: "Jane Achieng",
      size: "956 KB",
      status: "under-review",
      category: "legal-docs"
    },
    {
      id: 5,
      name: "KRA Correspondence.pdf",
      client: "ABC Manufacturing Ltd",
      type: "Correspondence",
      uploadDate: "2024-01-11",
      uploadedBy: "John Kamau",
      size: "1.2 MB",
      status: "approved",
      category: "correspondence"
    }
  ],

  getDemoNotifications: () => [
    {
      id: 'demo-notif-001',
      type: 'deadline_reminder',
      title: 'PAYE Filing Due Soon',
      message: 'PAYE filing for John Doe Enterprises is due on April 9th, 2024',
      read: false,
      data: { client_id: 'demo-client-002' },
      created_at: '2024-04-07T10:00:00Z'
    },
    {
      id: 'demo-notif-002',
      type: 'system_alert',
      title: 'System Maintenance',
      message: 'Scheduled system maintenance on Sunday 2AM-4AM',
      read: true,
      data: {},
      created_at: '2024-04-05T15:30:00Z'
    },
    {
      id: 'demo-notif-003',
      type: 'document_uploaded',
      title: 'New Document Uploaded',
      message: 'Corporate Tax Working Papers uploaded for Tech Solutions Kenya Ltd',
      read: false,
      data: { client_id: 'demo-client-003' },
      created_at: '2024-02-15T14:45:00Z'
    }
  ],

  getDemoCalendarEvents: () => [
    {
      id: 'demo-event-001',
      title: 'VAT Filing Deadline',
      description: 'Q1 2024 VAT return filing deadline',
      start_date: '2024-04-20T23:59:00+00:00',
      end_date: '2024-04-20T23:59:00+00:00',
      event_type: 'tax_obligation',
      client_id: 'demo-client-001',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'demo-event-002',
      title: 'PAYE Filing Deadline',
      description: 'March 2024 PAYE filing deadline',
      start_date: '2024-04-09T23:59:00+00:00',
      end_date: '2024-04-09T23:59:00+00:00',
      event_type: 'tax_obligation',
      client_id: 'demo-client-002',
      created_at: '2024-03-01T10:00:00Z'
    },
    {
      id: 'demo-event-003',
      title: 'Client Meeting',
      description: 'Review corporate tax computation with Tech Solutions',
      start_date: '2024-04-15T14:00:00+00:00',
      end_date: '2024-04-15T15:30:00+00:00',
      event_type: 'meeting',
      client_id: 'demo-client-003',
      created_at: '2024-04-10T09:00:00Z'
    }
  ]
};
