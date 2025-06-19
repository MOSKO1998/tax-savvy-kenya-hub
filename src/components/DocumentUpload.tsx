
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, X } from "lucide-react";
import { useDocumentUpload } from "@/hooks/useDocumentUpload";

interface DocumentUploadProps {
  clientId?: string;
  obligationId?: string;
  onUploadComplete?: (result: any) => void;
  onCancel?: () => void;
}

export const DocumentUpload = ({ 
  clientId, 
  obligationId, 
  onUploadComplete, 
  onCancel 
}: DocumentUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("");
  
  const { uploadDocument, isUploading } = useDocumentUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadDocument({
      file: selectedFile,
      clientId,
      obligationId,
      title: title || selectedFile.name,
      description,
      documentType: documentType || 'other',
    });

    if (result.success && onUploadComplete) {
      onUploadComplete(result);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Document to Nextcloud</span>
        </CardTitle>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selection */}
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
              className="flex-1"
            />
          </div>
          {selectedFile && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <FileText className="h-4 w-4" />
              <span>{selectedFile.name}</span>
              <span>({formatFileSize(selectedFile.size)})</span>
            </div>
          )}
        </div>

        {/* Document Details */}
        <div className="space-y-2">
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
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

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter document description"
            rows={3}
          />
        </div>

        {/* Upload Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload to Cloud
              </>
            )}
          </Button>
        </div>

        {/* Nextcloud Info */}
        <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
          <p className="font-medium text-blue-700 mb-1">Nextcloud Integration</p>
          <p>Documents will be uploaded to: <span className="font-mono">cloud.audit.ke</span></p>
          <p>Files are organized by client and automatically backed up.</p>
        </div>
      </CardContent>
    </Card>
  );
};
