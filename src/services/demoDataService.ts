
// Service to manage demo data - isolated per organization
export const demoDataService = {
  getDemoClients: (userEmail?: string) => {
    // Only demo account gets sample data, others get empty
    if (userEmail === 'demo@chandariashah.com') {
      return [
        {
          id: 'demo-client-1',
          name: 'ABC Manufacturing Ltd',
          email: 'accounts@abcmfg.co.ke',
          phone: '+254-700-123456',
          tax_id: 'P051234567A',
          address: '123 Industrial Area, Nairobi, Kenya',
          client_type: 'corporate',
          status: 'active',
          created_at: new Date().toISOString(),
          assigned_to: 'demo-user-id'
        },
        {
          id: 'demo-client-2',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          phone: '+254-722-987654',
          tax_id: 'A012345678M',
          address: '456 Westlands, Nairobi, Kenya',
          client_type: 'individual',
          status: 'active',
          created_at: new Date().toISOString(),
          assigned_to: 'demo-user-id'
        }
      ];
    }
    return [];
  },

  getDemoObligations: (userEmail?: string) => {
    if (userEmail === 'demo@chandariashah.com') {
      return [
        {
          id: 'demo-obligation-1',
          title: 'VAT Return - Q4 2024',
          description: 'Quarterly VAT return filing',
          tax_type: 'vat',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          amount: 125000,
          client_id: 'demo-client-1',
          created_by: 'demo-user-id',
          assigned_to: 'demo-user-id',
          created_at: new Date().toISOString()
        },
        {
          id: 'demo-obligation-2',
          title: 'PAYE Filing - December 2024',
          description: 'Monthly PAYE return',
          tax_type: 'paye',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          amount: 89500,
          client_id: 'demo-client-1',
          created_by: 'demo-user-id',
          assigned_to: 'demo-user-id',
          created_at: new Date().toISOString()
        }
      ];
    }
    return [];
  },

  getDemoNotifications: (userEmail?: string) => {
    if (userEmail === 'demo@chandariashah.com') {
      return [
        {
          id: 'demo-notification-1',
          title: 'VAT Return Due Soon',
          message: 'ABC Manufacturing Ltd VAT return is due in 7 days',
          type: 'deadline_reminder',
          read: false,
          created_at: new Date().toISOString(),
          data: { client_id: 'demo-client-1', obligation_id: 'demo-obligation-1' }
        },
        {
          id: 'demo-notification-2',
          title: 'System Ready',
          message: 'Tax Compliance Hub is ready for production use',
          type: 'system_alert',
          read: false,
          created_at: new Date().toISOString(),
          data: {}
        }
      ];
    }
    return [
      {
        id: 'welcome-notification',
        title: 'Welcome to Tax Compliance Hub',
        message: 'Your organization is ready to start managing tax compliance',
        type: 'system_alert',
        read: false,
        created_at: new Date().toISOString(),
        data: {}
      }
    ];
  },

  getDemoDocuments: (userEmail?: string) => {
    if (userEmail === 'demo@chandariashah.com') {
      return [
        {
          id: 'demo-doc-1',
          title: 'VAT Certificate 2024',
          description: 'Annual VAT registration certificate',
          document_type: 'certificate',
          file_path: '/demo/vat-cert-2024.pdf',
          client_id: 'demo-client-1',
          uploaded_by: 'demo-user-id',
          created_at: new Date().toISOString(),
          file_size: 245760,
          mime_type: 'application/pdf'
        }
      ];
    }
    return [];
  }
};
