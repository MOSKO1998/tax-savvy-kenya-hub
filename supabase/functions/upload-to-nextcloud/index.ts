
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UploadResult {
  success: boolean;
  document?: any;
  nextcloudPath?: string;
  shareUrl?: string;
  error?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Nextcloud upload process...");

    // Get Nextcloud configuration from environment variables
    const nextcloudUrl = Deno.env.get("NEXTCLOUD_URL");
    const nextcloudUsername = Deno.env.get("NEXTCLOUD_USERNAME");
    const nextcloudPassword = Deno.env.get("NEXTCLOUD_PASSWORD");

    if (!nextcloudUrl || !nextcloudUsername || !nextcloudPassword) {
      console.error("Missing Nextcloud configuration");
      throw new Error("Nextcloud server not configured. Please check deployment settings.");
    }

    console.log(`Nextcloud URL configured: ${nextcloudUrl}`);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("No file provided");
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`);

    const title = formData.get("title") as string || file.name;
    const description = formData.get("description") as string || "";
    const documentType = formData.get("documentType") as string || "other";
    const clientId = formData.get("clientId") as string;
    const obligationId = formData.get("obligationId") as string;

    // Generate secure filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileExtension = file.name.split('.').pop() || '';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${safeName}`;
    
    // Organize files in folders by document type and date
    const folderPath = `/TaxCompliance/${documentType}/${new Date().getFullYear()}`;
    const nextcloudPath = `${folderPath}/${fileName}`;

    console.log(`Target path: ${nextcloudPath}`);

    // Create authorization header for Nextcloud
    const auth = btoa(`${nextcloudUsername}:${nextcloudPassword}`);
    
    // First, try to create the folder structure
    const folderUrl = `${nextcloudUrl}/remote.php/dav/files/${nextcloudUsername}${folderPath}`;
    
    try {
      await fetch(folderUrl, {
        method: "MKCOL",
        headers: {
          "Authorization": `Basic ${auth}`,
        },
      });
      console.log("Folder structure created/verified");
    } catch (folderError) {
      console.log("Folder may already exist or creation failed:", folderError);
      // Continue anyway, folder might already exist
    }

    // Upload file to Nextcloud
    const uploadUrl = `${nextcloudUrl}/remote.php/dav/files/${nextcloudUsername}${nextcloudPath}`;
    
    console.log(`Uploading to: ${uploadUrl}`);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: await file.arrayBuffer(),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error(`Nextcloud upload failed: ${uploadResponse.status} - ${errorText}`);
      throw new Error(`Nextcloud upload failed: ${uploadResponse.statusText}. Check server connectivity and credentials.`);
    }

    console.log(`File uploaded successfully to Nextcloud: ${nextcloudPath}`);

    // Create public share link
    let publicShareUrl = "";
    try {
      const shareUrl = `${nextcloudUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
      const shareData = new URLSearchParams({
        path: nextcloudPath,
        shareType: "3", // Public link
        permissions: "1", // Read only
        password: "", // No password for now
      });

      const shareResponse = await fetch(shareUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "OCS-APIRequest": "true",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: shareData,
      });

      if (shareResponse.ok) {
        const shareResult = await shareResponse.text();
        console.log("Share response received");
        
        // Extract share URL from XML response
        const urlMatch = shareResult.match(/<url>(.*?)<\/url>/);
        if (urlMatch) {
          publicShareUrl = urlMatch[1];
          console.log("Public share URL created");
        }
      } else {
        console.log("Share creation failed, but upload succeeded");
      }
    } catch (shareError) {
      console.log("Share creation error (non-critical):", shareError);
    }

    // Prepare response
    const result: UploadResult = {
      success: true,
      document: {
        title,
        description,
        documentType,
        fileName,
        fileSize: file.size,
        mimeType: file.type,
        clientId,
        obligationId,
        uploadedAt: new Date().toISOString(),
      },
      nextcloudPath,
      shareUrl: publicShareUrl || `${nextcloudUrl}${nextcloudPath}`,
    };

    console.log("Upload completed successfully");

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in upload-to-nextcloud function:", error);
    
    const result: UploadResult = {
      success: false,
      error: error.message || "Upload failed - please check server configuration",
    };

    return new Response(
      JSON.stringify(result),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
