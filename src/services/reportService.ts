
import { supabase } from '@/integrations/supabase/client';

export interface ReportData {
  type: string;
  dateRange: { from?: Date; to?: Date };
  clients: string[];
  statuses: string[];
  format: string;
  generatedAt: string;
  totalClients: number;
  totalObligations: number;
}

export const reportService = {
  async generateClientSummaryReport(data: ReportData) {
    console.log('Generating client summary report:', data);
    
    // Fetch clients data
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .in('id', data.clients.length > 0 ? data.clients : ['none']);

    if (clientsError) throw clientsError;

    // Generate report content
    const reportContent = {
      title: 'Client Summary Report',
      generatedAt: data.generatedAt,
      totalClients: clients?.length || 0,
      clients: clients?.map(client => ({
        name: client.name,
        email: client.email,
        phone: client.phone,
        tax_id: client.tax_id,
        status: client.status,
        client_type: client.client_type
      })) || []
    };

    return reportContent;
  },

  async generateTaxObligationsReport(data: ReportData) {
    console.log('Generating tax obligations report:', data);
    
    let query = supabase
      .from('tax_obligations')
      .select(`
        *,
        clients (
          id,
          name
        )
      `);

    // Apply filters
    if (data.clients.length > 0) {
      query = query.in('client_id', data.clients);
    }
    
    if (data.statuses.length > 0) {
      query = query.in('status', data.statuses);
    }

    if (data.dateRange.from) {
      query = query.gte('due_date', data.dateRange.from.toISOString().split('T')[0]);
    }

    if (data.dateRange.to) {
      query = query.lte('due_date', data.dateRange.to.toISOString().split('T')[0]);
    }

    const { data: obligations, error } = await query.order('due_date', { ascending: true });

    if (error) throw error;

    const reportContent = {
      title: 'Tax Obligations Report',
      generatedAt: data.generatedAt,
      totalObligations: obligations?.length || 0,
      obligations: obligations?.map(obligation => ({
        title: obligation.title,
        tax_type: obligation.tax_type,
        due_date: obligation.due_date,
        status: obligation.status,
        amount: obligation.amount,
        client_name: obligation.clients?.name || 'No client assigned',
        description: obligation.description
      })) || []
    };

    return reportContent;
  },

  async generateComplianceStatusReport(data: ReportData) {
    console.log('Generating compliance status report:', data);
    
    const { data: obligations, error } = await supabase
      .from('tax_obligations')
      .select(`
        *,
        clients (
          id,
          name
        )
      `);

    if (error) throw error;

    const today = new Date();
    const compliance = {
      total: obligations?.length || 0,
      pending: obligations?.filter(o => o.status === 'pending').length || 0,
      completed: obligations?.filter(o => o.status === 'completed').length || 0,
      overdue: obligations?.filter(o => {
        const dueDate = new Date(o.due_date);
        return o.status === 'pending' && dueDate < today;
      }).length || 0
    };

    const reportContent = {
      title: 'Compliance Status Report',
      generatedAt: data.generatedAt,
      compliance,
      complianceRate: compliance.total > 0 ? 
        Math.round((compliance.completed / compliance.total) * 100) : 0,
      obligations: obligations || []
    };

    return reportContent;
  },

  async generateOverdueReport(data: ReportData) {
    console.log('Generating overdue obligations report:', data);
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: obligations, error } = await supabase
      .from('tax_obligations')
      .select(`
        *,
        clients (
          id,
          name
        )
      `)
      .eq('status', 'pending')
      .lt('due_date', today)
      .order('due_date', { ascending: true });

    if (error) throw error;

    const reportContent = {
      title: 'Overdue Obligations Report',
      generatedAt: data.generatedAt,
      totalOverdue: obligations?.length || 0,
      obligations: obligations?.map(obligation => ({
        title: obligation.title,
        tax_type: obligation.tax_type,
        due_date: obligation.due_date,
        client_name: obligation.clients?.name || 'No client assigned',
        amount: obligation.amount,
        days_overdue: Math.ceil(
          (new Date().getTime() - new Date(obligation.due_date).getTime()) / 
          (1000 * 60 * 60 * 24)
        )
      })) || []
    };

    return reportContent;
  },

  async generateFinancialSummaryReport(data: ReportData) {
    console.log('Generating financial summary report:', data);
    
    const { data: obligations, error } = await supabase
      .from('tax_obligations')
      .select('*');

    if (error) throw error;

    const financial = {
      totalAmountDue: obligations?.filter(o => o.status === 'pending')
        .reduce((sum, o) => sum + (o.amount || 0), 0) || 0,
      totalAmountPaid: obligations?.filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.amount || 0), 0) || 0,
      totalOverdueAmount: obligations?.filter(o => {
        const dueDate = new Date(o.due_date);
        return o.status === 'pending' && dueDate < new Date();
      }).reduce((sum, o) => sum + (o.amount || 0), 0) || 0
    };

    const reportContent = {
      title: 'Financial Summary Report',
      generatedAt: data.generatedAt,
      financial,
      obligations: obligations || []
    };

    return reportContent;
  },

  async generateMonthlyBreakdownReport(data: ReportData) {
    console.log('Generating monthly breakdown report:', data);
    
    const { data: obligations, error } = await supabase
      .from('tax_obligations')
      .select('*')
      .gte('due_date', data.dateRange.from?.toISOString().split('T')[0] || '2024-01-01')
      .lte('due_date', data.dateRange.to?.toISOString().split('T')[0] || '2024-12-31')
      .order('due_date', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyData: { [key: string]: any } = {};
    
    obligations?.forEach(obligation => {
      const month = new Date(obligation.due_date).toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          total: 0,
          pending: 0,
          completed: 0,
          overdue: 0,
          totalAmount: 0
        };
      }
      
      monthlyData[month].total++;
      monthlyData[month][obligation.status]++;
      monthlyData[month].totalAmount += obligation.amount || 0;
    });

    const reportContent = {
      title: 'Monthly Breakdown Report',
      generatedAt: data.generatedAt,
      dateRange: data.dateRange,
      monthlyBreakdown: Object.values(monthlyData),
      totalObligations: obligations?.length || 0
    };

    return reportContent;
  }
};
