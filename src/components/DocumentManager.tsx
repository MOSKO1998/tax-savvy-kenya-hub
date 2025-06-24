
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Search, 
  Filter,
  FileText,
  Download,
  Eye,
  MoreHorizontal,
  FolderOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DocumentUpload } from "@/components/DocumentUpload";
import { useAuth } from "@/hooks/useAuth";
import { demoDataService } from "@/services/demoDataService";

export const DocumentManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const { isDemoMode } = useAuth();

  const folders = [
    { id: "all", name: "All Documents", count: isDemoMode ? 5 : 0 },
    { id: "tax-returns", name: "Tax Returns", count: isDemoMode ? 2 : 0 },
    { id: "financial-statements", name: "Financial Statements", count: isDemoMode ? 1 : 0 },
    { id: "legal-docs", name: "Legal Documents", count: isDemoMode ? 1 : 0 },
    { id: "correspondence", name: "Correspondence", count: isDemoMode ? 1 : 0 }
  ];

  // Only show demo documents in demo mode
  const documents = isDemoMode ? demoDataService.getDemoDocuments() : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under-review":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-5 w-5 text-blue-600" />;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFolder = selectedFolder === "all" || doc.category === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const handleUploadComplete = (result: any) => {
    console.log('Upload completed:', result);
    setShowUploadDialog(false);
    // Refresh documents list here if needed
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Document Manager</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload to Nextcloud
          </Button>
        </div>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <DocumentUpload
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUploadDialog(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folders Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Folders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedFolder === folder.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="text-sm font-medium">{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="lg:col-span-3">
          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          {filteredDocuments.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Document</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Client</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Upload Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(doc.type)}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.size}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-900">{doc.client}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-gray-600">{doc.type}</p>
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="text-sm text-gray-900">{doc.uploadDate}</p>
                              <p className="text-xs text-gray-500">by {doc.uploadedBy}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(doc.status)}>
                              {doc.status.replace('-', ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Share</DropdownMenuItem>
                                  <DropdownMenuItem>Move</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-500 mb-4">
                  {isDemoMode 
                    ? "You're in demo mode. Switch to a real account to upload documents."
                    : "Upload your first document to get started with document management."
                  }
                </p>
                <Button 
                  onClick={() => setShowUploadDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
