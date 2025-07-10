
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

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
  const { isDemoMode } = useAuth();

  const uploadDocument = async (data: UploadDocumentData): Promise<UploadResult> => {
    setIsUploading(true);
    
    try {
      if (isDemoMode) {
        // Simulate upload in demo mode
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "Demo Upload Successful",
          description: `Document "${data.file.name}" would be uploaded to Nextcloud in production mode`,
        });
        
        return {
          success: true,
          document: {
            title: data.title || data.file.name,
            description: data.description || '',
            documentType: data.documentType || 'other',
            fileName: data.file.name,
            fileSize: data.file.size,
            mimeType: data.file.type,
            clientId: data.clientId,
            obligationId: data.obligationId,
            uploadedAt: new Date().toISOString(),
          },
          nextcloudPath: `/demo/${data.file.name}`,
          shareUrl: `https://cloud.audit.ke/s/demo-${Date.now()}`,
        };
      }

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

      console.log('Uploading document to Nextcloud via Supabase function...');

      const { data: result, error } = await supabase.functions.invoke('upload-to-nextcloud', {
        body: formData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (result?.success) {
        // Also save document metadata to Supabase
        const { data: docRecord, error: dbError } = await supabase
          .from('documents')
          .insert({
            title: result.document.title,
            description: result.document.description,
            document_type: result.document.documentType,
            file_path: result.nextcloudPath,
            file_size: result.document.fileSize,
            mime_type: result.document.mimeType,
            client_id: result.document.clientId,
            obligation_id: result.document.obligationId,
            uploaded_by: session.user.id
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Don't fail the upload if DB save fails, file is still in Nextcloud
        }

        toast({
          title: "Upload Successful",
          description: `Document uploaded to Nextcloud: ${data.file.name}`,
        });
        
        return {
          ...result,
          document: docRecord || result.document
        };
      } else {
        throw new Error(result?.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Provide helpful error messages
      let errorMessage = 'Failed to upload document';
      if (error.message?.includes('Nextcloud')) {
        errorMessage = 'Nextcloud server error - please check server configuration';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error - please login again';
      }
      
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage,
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
