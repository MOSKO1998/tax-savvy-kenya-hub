
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { sanitizeInput, sanitizeFileName, validateFileType, validateFileSize } from "@/utils/inputValidation";

interface FormErrors {
  title?: string;
  file?: string;
}

type DocumentType = 'tax_return' | 'receipt' | 'certificate' | 'correspondence' | 'audit_report' | 'other';

interface DocumentUploadProps {
  clientId?: string;
  obligationId?: string;
  onUploadComplete?: (result?: any) => void;
}

export const DocumentUpload = ({ clientId, obligationId, onUploadComplete }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    document_type: 'other' as DocumentType
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();

  // Security: Define allowed file types and maximum file size
  const allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const maxFileSizeInMB = 10;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Security: Validate file type
    if (!validateFileType(file, allowedFileTypes)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF, image, or Microsoft Office document.",
        variant: "destructive",
      });
      return;
    }

    // Security: Validate file size
    if (!validateFileSize(file, maxFileSizeInMB)) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxFileSizeInMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Auto-populate title if not set
    if (!formData.title) {
      setFormData(prev => ({
        ...prev,
        title: file.name.split('.')[0]
      }));
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Document title is required';
    }

    if (!selectedFile) {
      errors.file = 'Please select a file to upload';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasPermission('document_upload') && !hasPermission('all')) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to upload documents",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) return;

    setIsUploading(true);

    try {
      // Security: Sanitize filename and create safe path
      const sanitizedFileName = sanitizeFileName(selectedFile.name);
      const fileExtension = sanitizedFileName.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const filePath = `documents/${uniqueFileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Security: Sanitize form data before database insertion
      const sanitizedData = {
        title: sanitizeInput(formData.title),
        description: sanitizeInput(formData.description),
        document_type: formData.document_type,
        file_path: filePath,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        client_id: clientId,
        obligation_id: obligationId,
        uploaded_by: user?.id
      };

      // Insert document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert(sanitizedData);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      // Reset form
      setSelectedFile(null);
      setFormData({
        title: '',
        description: '',
        document_type: 'other'
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onUploadComplete) {
        onUploadComplete();
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title">Document Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter document title"
            className={formErrors.title ? 'border-red-500' : ''}
          />
          {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter document description (optional)"
          />
        </div>

        <div>
          <Label htmlFor="document_type">Document Type</Label>
          <Select value={formData.document_type} onValueChange={(value) => handleInputChange('document_type', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tax_return">Tax Return</SelectItem>
              <SelectItem value="receipt">Receipt</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="correspondence">Correspondence</SelectItem>
              <SelectItem value="audit_report">Audit Report</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="file">Select File *</Label>
          <div className="mt-2">
            {!selectedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    Click to select a file or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    PDF, Images, Word, Excel files up to {maxFileSizeInMB}MB
                  </p>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <File className="h-5 w-5 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeSelectedFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {formErrors.file && <p className="text-red-500 text-sm mt-1">{formErrors.file}</p>}
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
