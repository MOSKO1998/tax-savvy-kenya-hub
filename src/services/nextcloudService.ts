
interface NextcloudConfig {
  url: string;
  username: string;
  password: string;
  basePath: string;
}

class NextcloudService {
  private config: NextcloudConfig;

  constructor() {
    this.config = {
      url: process.env.NEXTCLOUD_URL || 'https://cloud.audit.ke',
      username: process.env.NEXTCLOUD_USERNAME || 'it@csa.co.ke',
      password: process.env.NEXTCLOUD_PASSWORD || 'Wakatiimefika@1998',
      basePath: '/remote.php/dav/files'
    };
  }

  private getAuthHeader(): string {
    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    return `Basic ${credentials}`;
  }

  private getWebDAVUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.config.url}${this.config.basePath}/${this.config.username}/${cleanPath}`;
  }

  async uploadFile(file: File, remotePath: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const url = this.getWebDAVUrl(remotePath);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (response.ok) {
        const shareUrl = await this.createShareLink(remotePath);
        return { 
          success: true, 
          url: shareUrl || url 
        };
      } else {
        return { 
          success: false, 
          error: `Upload failed: ${response.status} ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async downloadFile(remotePath: string): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      const url = this.getWebDAVUrl(remotePath);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        return { success: true, blob };
      } else {
        return { 
          success: false, 
          error: `Download failed: ${response.status} ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async createFolder(folderPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = this.getWebDAVUrl(folderPath);
      
      const response = await fetch(url, {
        method: 'MKCOL',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (response.ok || response.status === 405) { // 405 means folder already exists
        return { success: true };
      } else {
        return { 
          success: false, 
          error: `Create folder failed: ${response.status} ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async listFolder(folderPath: string = ''): Promise<{ success: boolean; files?: any[]; error?: string }> {
    try {
      const url = this.getWebDAVUrl(folderPath);
      
      const response = await fetch(url, {
        method: 'PROPFIND',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Depth': '1',
          'Content-Type': 'application/xml',
        },
        body: `<?xml version="1.0"?>
          <d:propfind xmlns:d="DAV:">
            <d:prop>
              <d:displayname/>
              <d:getcontentlength/>
              <d:getlastmodified/>
              <d:getcontenttype/>
              <d:resourcetype/>
            </d:prop>
          </d:propfind>`,
      });

      if (response.ok) {
        const xmlText = await response.text();
        const files = this.parseWebDAVResponse(xmlText);
        return { success: true, files };
      } else {
        return { 
          success: false, 
          error: `List folder failed: ${response.status} ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private parseWebDAVResponse(xmlText: string): any[] {
    // Simple XML parsing for WebDAV response
    const files: any[] = [];
    
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      const responses = xmlDoc.getElementsByTagName('d:response');
      
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const href = response.getElementsByTagName('d:href')[0]?.textContent;
        const displayName = response.getElementsByTagName('d:displayname')[0]?.textContent;
        const contentLength = response.getElementsByTagName('d:getcontentlength')[0]?.textContent;
        const lastModified = response.getElementsByTagName('d:getlastmodified')[0]?.textContent;
        const contentType = response.getElementsByTagName('d:getcontenttype')[0]?.textContent;
        const resourceType = response.getElementsByTagName('d:resourcetype')[0];
        
        if (href && displayName) {
          const isFolder = resourceType?.getElementsByTagName('d:collection').length > 0;
          
          files.push({
            name: displayName,
            path: href,
            size: contentLength ? parseInt(contentLength) : 0,
            lastModified: lastModified ? new Date(lastModified) : null,
            contentType: contentType || '',
            isFolder,
          });
        }
      }
    } catch (error) {
      console.error('Error parsing WebDAV response:', error);
    }
    
    return files;
  }

  private async createShareLink(filePath: string): Promise<string | null> {
    try {
      const shareUrl = `${this.config.url}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
      
      const formData = new FormData();
      formData.append('path', `/${filePath}`);
      formData.append('shareType', '3'); // Public link
      formData.append('permissions', '1'); // Read only
      
      const response = await fetch(shareUrl, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'OCS-APIRequest': 'true',
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result?.ocs?.data?.url || null;
      }
    } catch (error) {
      console.error('Error creating share link:', error);
    }
    
    return null;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.listFolder('');
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      };
    }
  }

  updateConfig(newConfig: Partial<NextcloudConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): NextcloudConfig {
    return { ...this.config };
  }
}

export const nextcloudService = new NextcloudService();
