
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
    // Get Nextcloud configuration from environment variables
    const nextcloudUrl = Deno.env.get("NEXTCLOUD_URL") || "https://cloud.audit.ke";
    const nextcloudUsername = Deno.env.get("NEXTCLOUD_USERNAME");
    const nextcloudPassword = Deno.env.get("NEXTCLOUD_PASSWORD");

    if (!nextcloudUsername || !nextcloudPassword) {
      throw new Error("Nextcloud credentials not configured");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      throw new Error("No file provided");
    }

    const title = formData.get("title") as string || file.name;
    const description = formData.get("description") as string || "";
    const documentType = formData.get("documentType") as string || "other";
    const clientId = formData.get("clientId") as string;
    const obligationId = formData.get("obligationId") as string;

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${timestamp}_${file.name}`;
    const nextcloudPath = `/documents/${fileName}`;

    // Create authorization header for Nextcloud
    const auth = btoa(`${nextcloudUsername}:${nextcloudPassword}`);
    
    // Upload file to Nextcloud
    const uploadUrl = `${nextcloudUrl}/remote.php/dav/files/${nextcloudUsername}${nextcloudPath}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": file.type || "application/octet-stream",
      },
      body: await file.arrayBuffer(),
    });

    if (!uploadResponse.ok) {
      throw new Error(`Nextcloud upload failed: ${uploadResponse.statusText}`);
    }

    console.log(`File uploaded successfully to Nextcloud: ${nextcloudPath}`);

    // Create share link
    const shareUrl = `${nextcloudUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
    const shareData = new URLSearchParams({
      path: nextcloudPath,
      shareType: "3", // Public link
      permissions: "1", // Read only
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

    let publicShareUrl = "";
    if (shareResponse.ok) {
      const shareResult = await shareResponse.text();
      console.log("Share response:", shareResult);
      // Extract share URL from XML response (simplified)
      const urlMatch = shareResult.match(/<url>(.*?)<\/url>/);
      if (urlMatch) {
        publicShareUrl = urlMatch[1];
      }
    }

    // In a real implementation, you would also save document metadata to Supabase
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
      shareUrl: publicShareUrl || `${nextcloudUrl}/s/placeholder`,
    };

    console.log("Upload completed successfully:", result);

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
      error: error.message || "Upload failed",
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
