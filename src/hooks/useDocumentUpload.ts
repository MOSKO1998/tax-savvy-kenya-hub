
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadDocumentData {
  file: File;
  clientId?: string;
  obligationId?: string;
  title?: string;
  description?: string;
  documentType?: string;
}

interface UploadResult {
  success: boolean;
  document?: any;
  nextcloudPath?: string;
  shareUrl?: string;
  error?: string;
}

export const useDocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (data: UploadDocumentData): Promise<UploadResult> => {
    setIsUploading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('file', data.file);
      if (data.clientId) formData.append('clientId', data.clientId);
      if (data.obligationId) formData.append('obligationId', data.obligationId);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.documentType) formData.append('documentType', data.documentType);

      // Use supabase functions invoke instead of direct fetch
      const { data: result, error } = await supabase.functions.invoke('upload-to-nextcloud', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      if (result.success) {
        toast({
          title: "Upload Successful",
          description: `Document uploaded to Nextcloud: ${data.file.name}`,
        });
        
        return result;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || 'Failed to upload document',
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message || 'Upload failed',
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDocument,
    isUploading,
  };
};
