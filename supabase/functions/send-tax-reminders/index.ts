
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaxObligation {
  id: string;
  title: string;
  due_date: string;
  tax_type: string;
  client_name?: string;
  reminder_emails: string[];
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tax obligations due in the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const { data: obligations, error } = await supabase
      .from('tax_obligations')
      .select('*')
      .eq('status', 'pending')
      .lte('due_date', sevenDaysFromNow.toISOString().split('T')[0])
      .gte('due_date', new Date().toISOString().split('T')[0]);

    if (error) {
      throw error;
    }

    console.log(`Found ${obligations?.length || 0} upcoming tax obligations`);

    // This is a placeholder for email sending functionality
    // In production, you would integrate with an email service like Resend
    const remindersSent = [];

    for (const obligation of obligations || []) {
      if (obligation.reminder_emails && obligation.reminder_emails.length > 0) {
        // Placeholder for sending actual emails
        console.log(`Would send reminder for ${obligation.title} to:`, obligation.reminder_emails);
        remindersSent.push({
          obligation_id: obligation.id,
          title: obligation.title,
          due_date: obligation.due_date,
          emails_sent: obligation.reminder_emails
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reminders_sent: remindersSent.length,
        details: remindersSent
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-tax-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
