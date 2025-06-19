
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the uploaded file data
    const formData = await req.formData()
    const file = formData.get('file') as File
    const clientId = formData.get('clientId') as string
    const obligationId = formData.get('obligationId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const documentType = formData.get('documentType') as string

    if (!file) {
      throw new Error('No file provided')
    }

    // Get current user
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `${timestamp}_${file.name}`
    const nextcloudPath = `/documents/${clientId || 'general'}/${filename}`

    // Upload to Nextcloud
    const nextcloudUrl = `https://cloud.audit.ke/remote.php/dav/files/${Deno.env.get('NEXTCLOUD_USERNAME')}${nextcloudPath}`
    
    const nextcloudResponse = await fetch(nextcloudUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('NEXTCLOUD_USERNAME')}:${Deno.env.get('NEXTCLOUD_PASSWORD')}`)}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!nextcloudResponse.ok) {
      throw new Error(`Nextcloud upload failed: ${nextcloudResponse.statusText}`)
    }

    // Save document metadata to Supabase
    const { data: document, error: dbError } = await supabaseClient
      .from('documents')
      .insert({
        client_id: clientId || null,
        obligation_id: obligationId || null,
        title: title || file.name,
        description: description || null,
        document_type: documentType || 'other',
        file_path: nextcloudPath,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // Get Nextcloud share link (optional)
    const shareUrl = `https://cloud.audit.ke/index.php/s/${await generateShareLink(nextcloudPath)}`

    return new Response(JSON.stringify({
      success: true,
      document,
      nextcloudPath,
      shareUrl,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function generateShareLink(filePath: string): Promise<string> {
  try {
    const shareResponse = await fetch(`https://cloud.audit.ke/ocs/v2.php/apps/files_sharing/api/v1/shares`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${Deno.env.get('NEXTCLOUD_USERNAME')}:${Deno.env.get('NEXTCLOUD_PASSWORD')}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'OCS-APIRequest': 'true',
      },
      body: new URLSearchParams({
        path: filePath,
        shareType: '3', // Public link
        permissions: '1', // Read only
      }),
    })

    if (shareResponse.ok) {
      const shareData = await shareResponse.text()
      // Parse XML response to get share token
      const tokenMatch = shareData.match(/<token>([^<]+)<\/token>/)
      return tokenMatch ? tokenMatch[1] : 'share-link-generated'
    }
  } catch (error) {
    console.error('Share link generation failed:', error)
  }
  return 'direct-access'
}
