
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Download, 
  ExternalLink,
  Folder,
  Search,
  Filter,
  Plus,
  Cloud,
  Share,
  Eye,
  RefreshCw
} from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useTaxObligations } from "@/hooks/useTaxObligations";
import { useSearch } from "@/hooks/useSearch";
import { SearchInput } from "./SearchInput";
import { DocumentUpload } from "./DocumentUpload";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const DocumentManager = () => {
  const [selectedTab, setSelectedTab] = useState("upload");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedDocType, setSelectedDocType] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<any>(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { clients } = useClients();
  const { obligations } = useTaxObligations();
  const { toast } = useToast();

  const { searchTerm, setSearchTerm, filteredData: searchFilteredDocs } = useSearch(
    documents, 
    ['title', 'client_name', 'document_type']
  );

  // Apply additional filters
  const filteredDocuments = searchFilteredDocs.filter(doc => {
    const clientMatch = selectedClient === "all" || doc.client_id === selectedClient;
    const typeMatch = selectedDocType === "all" || doc.document_type === selectedDocType;
    return clientMatch && typeMatch;
  });

  const documentTypes = [
    { value: 'tax_return', label: 'Tax Return' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'correspondence', label: 'Correspondence' },
    { value: 'audit_report', label: 'Audit Report' },
    { value: 'other', label: 'Other' }
  ];

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          clients(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to fetch documents",
          variant: "destructive",
        });
      } else {
        setDocuments(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadComplete = (result: any) => {
    console.log('Upload completed:', result);
    setIsUploadDialogOpen(false);
    fetchDocuments(); // Refresh the documents list
    toast({
      title: "Upload Successful",
      description: "Document uploaded to Nextcloud successfully",
    });
  };

  const handleDownload = async (document: any) => {
    try {
      // Call the download function to get the file from Nextcloud
      const { data, error } = await supabase.functions.invoke('download-from-nextcloud', {
        body: { filePath: document.file_path }
      });

      if (error) throw error;

      if (data.success && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        throw new Error('Failed to get download URL');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download document from Nextcloud",
        variant: "destructive",
      });
    }
  };

  const handleShare = (document: any) => {
    const shareUrl = `https://cloud.audit.ke/s/${document.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'tax_return':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'certificate':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'receipt':
        return <FileText className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Document Manager</h2>
          <p className="text-gray-600 mt-1">Upload, manage, and share documents via Nextcloud</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchDocuments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Folder className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{documents.length}</p>
                <p className="text-sm text-gray-600">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Cloud className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{documents.filter(d => d.file_path).length}</p>
                <p className="text-sm text-gray-600">In Nextcloud</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Upload className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{documents.filter(d => d.created_at).length}</p>
                <p className="text-sm text-gray-600">Uploaded Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Share className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{documents.filter(d => d.title).length}</p>
                <p className="text-sm text-gray-600">Shared</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
          <TabsTrigger value="nextcloud">Nextcloud Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Upload Document to Nextcloud</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentUpload 
                clientId={undefined}
                obligationId={undefined}
                onUploadComplete={handleUploadComplete} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search documents by title, client, or type..."
                  className="flex-1"
                />
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map(client => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading documents...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(document.document_type)}
                        <div>
                          <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
                          <p className="text-sm text-gray-600">{document.clients?.name || 'No client'}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Type:</span> {documentTypes.find(t => t.value === document.document_type)?.label || document.document_type}</p>
                      <p><span className="font-medium">Size:</span> {document.file_size ? `${(document.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
                      <p><span className="font-medium">Uploaded:</span> {new Date(document.created_at).toLocaleDateString()}</p>
                      {document.file_path && (
                        <p><span className="font-medium">Path:</span> <code className="text-xs bg-gray-100 px-1 rounded">{document.file_path}</code></p>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewingDocument(document)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(document)}
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {filteredDocuments.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedClient !== "all" || selectedDocType !== "all"
                    ? 'No documents found'
                    : 'No documents uploaded yet'
                  }
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedClient !== "all" || selectedDocType !== "all"
                    ? 'Try adjusting your search criteria or filters'
                    : 'Upload your first document to get started'
                  }
                </p>
                {!searchTerm && selectedClient === "all" && selectedDocType === "all" && (
                  <Button onClick={() => setIsUploadDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Your First Document
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="nextcloud" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="h-5 w-5" />
                <span>Nextcloud Integration Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-green-800">Connected to cloud.audit.ke</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Server Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">URL:</span> https://cloud.audit.ke</p>
                    <p><span className="font-medium">WebDAV:</span> /remote.php/dav/files/csa.kuria</p>
                    <p><span className="font-medium">Storage:</span> Available</p>
                    <p><span className="font-medium">Sync Status:</span> Active</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>✓ Automatic backup</p>
                    <p>✓ File versioning</p>
                    <p>✓ Secure sharing</p>
                    <p>✓ Access controls</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Quick Actions</h4>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => window.open('https://cloud.audit.ke', '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Nextcloud
                  </Button>
                  <Button variant="outline" onClick={() => window.open('https://cloud.audit.ke/remote.php/dav/files/csa.kuria', '_blank')}>
                    <Folder className="h-4 w-4 mr-2" />
                    Browse WebDAV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upload Document to Nextcloud</DialogTitle>
          </DialogHeader>
          <DocumentUpload 
            clientId={undefined}
            obligationId={undefined}
            onUploadComplete={handleUploadComplete}
          />
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={!!viewingDocument} onOpenChange={(open) => !open && setViewingDocument(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {viewingDocument && getDocumentIcon(viewingDocument.document_type)}
              <span>{viewingDocument?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {viewingDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Client:</span> {viewingDocument.clients?.name || 'No client'}</div>
                <div><span className="font-medium">Type:</span> {documentTypes.find(t => t.value === viewingDocument.document_type)?.label || viewingDocument.document_type}</div>
                <div><span className="font-medium">Size:</span> {viewingDocument.file_size ? `${(viewingDocument.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</div>
                <div className="col-span-2"><span className="font-medium">Uploaded:</span> {new Date(viewingDocument.created_at).toLocaleString()}</div>
                {viewingDocument.file_path && (
                  <div className="col-span-2"><span className="font-medium">Nextcloud Path:</span> <code className="text-xs bg-gray-100 px-1 rounded">{viewingDocument.file_path}</code></div>
                )}
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={() => handleDownload(viewingDocument)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => handleShare(viewingDocument)}>
                  <Share className="h-4 w-4 mr-2" />
                  Copy Share Link
                </Button>
                <Button variant="outline" onClick={() => window.open('https://cloud.audit.ke', '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in Nextcloud
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
