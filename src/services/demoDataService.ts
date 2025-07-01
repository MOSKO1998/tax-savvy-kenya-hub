// Service to manage demo data - keeping it minimal for fresh start
export const demoDataService = {
  getDemoClients: () => {
    // Return empty array for fresh start
    return [];
  },

  getDemoObligations: () => {
    // Return empty array for fresh start  
    return [];
  },

  getDemoNotifications: () => {
    return [
      {
        id: 'demo-1',
        title: 'Welcome to Tax Compliance Hub',
        message: 'System is ready for production use with live data',
        type: 'info',
        read: false,
        created_at: new Date().toISOString(),
        data: {}
      }
    ];
  }
};
