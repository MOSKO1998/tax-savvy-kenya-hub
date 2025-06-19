
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'permission_escalation' | 'unusual_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  timestamp: string;
}

export const useSecurityMonitor = () => {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const logSecurityEvent = async (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          action: 'security_event',
          table_name: 'security_monitor',
          new_values: {
            ...event,
            timestamp: new Date().toISOString(),
            ip_address: await getClientIP(),
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Show toast for high severity events
      if (event.severity === 'high' || event.severity === 'critical') {
        toast({
          title: "Security Alert",
          description: event.description,
          variant: "destructive",
        });
      }

      return data;
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const monitorFailedLogins = (email: string) => {
    logSecurityEvent({
      type: 'failed_login',
      severity: 'medium',
      description: `Failed login attempt for email: ${email}`,
    });
  };

  const monitorSuccessfulLogin = (userId: string) => {
    logSecurityEvent({
      type: 'login_attempt',
      severity: 'low',
      description: 'Successful login',
      user_id: userId,
    });
  };

  const monitorPermissionEscalation = (userId: string, action: string) => {
    logSecurityEvent({
      type: 'permission_escalation',
      severity: 'high',
      description: `User attempted unauthorized action: ${action}`,
      user_id: userId,
    });
  };

  const monitorUnusualActivity = (userId: string, activity: string) => {
    logSecurityEvent({
      type: 'unusual_activity',
      severity: 'medium',
      description: `Unusual activity detected: ${activity}`,
      user_id: userId,
    });
  };

  return {
    securityEvents,
    isMonitoring,
    logSecurityEvent,
    monitorFailedLogins,
    monitorSuccessfulLogin,
    monitorPermissionEscalation,
    monitorUnusualActivity,
  };
};
