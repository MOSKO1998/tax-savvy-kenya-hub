
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
      id: 'demo-doc-001',
      title: 'VAT Returns Q1 2024.pdf',
      description: 'Quarterly VAT return documents',
      document_type: 'tax_return',
      file_path: '/demo/vat_q1_2024.pdf',
      mime_type: 'application/pdf',
      file_size: 245760,
      client_id: 'demo-client-001',
      created_at: '2024-04-18T16:30:00Z'
    },
    {
      id: 'demo-doc-002',
      title: 'PAYE Schedule March.xlsx',
      description: 'Monthly PAYE schedule',
      document_type: 'other',
      file_path: '/demo/paye_march_2024.xlsx',
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      file_size: 156432,
      client_id: 'demo-client-002',
      created_at: '2024-03-25T11:20:00Z'
    },
    {
      id: 'demo-doc-003',
      title: 'Corporate Tax Working Papers.pdf',
      description: 'Annual tax computation working papers',
      document_type: 'other',
      file_path: '/demo/corp_tax_2023.pdf',
      mime_type: 'application/pdf',
      file_size: 1024000,
      client_id: 'demo-client-003',
      created_at: '2024-02-15T14:45:00Z'
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
