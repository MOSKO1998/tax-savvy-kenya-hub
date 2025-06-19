
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

    // Generate unique filename with security considerations
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${sanitizedFileName}`
    const nextcloudPath = `/Tax Compliance Hub/${clientId || 'general'}/${filename}`

    // Nextcloud credentials
    const nextcloudUsername = 'it@csa.co.ke'
    const nextcloudPassword = 'Wakatiimefika@1998'
    
    // Upload to Nextcloud with proper authentication
    const nextcloudUrl = `https://cloud.audit.ke/remote.php/dav/files/${encodeURIComponent(nextcloudUsername)}${encodeURIComponent(nextcloudPath)}`
    
    console.log('Uploading to Nextcloud:', nextcloudUrl)
    
    const nextcloudResponse = await fetch(nextcloudUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${btoa(`${nextcloudUsername}:${nextcloudPassword}`)}`,
        'Content-Type': file.type || 'application/octet-stream',
        'User-Agent': 'TaxComplianceHub/1.0',
      },
      body: file,
    })

    if (!nextcloudResponse.ok) {
      console.error('Nextcloud upload failed:', nextcloudResponse.status, nextcloudResponse.statusText)
      throw new Error(`Nextcloud upload failed: ${nextcloudResponse.status} ${nextcloudResponse.statusText}`)
    }

    console.log('Nextcloud upload successful')

    // Save document metadata to Supabase with enhanced security
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
      console.error('Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    // Generate Nextcloud share link
    let shareUrl = `https://cloud.audit.ke/index.php/apps/files/?dir=${encodeURIComponent('/Tax Compliance Hub')}`
    
    try {
      const shareToken = await generateShareLink(nextcloudPath, nextcloudUsername, nextcloudPassword)
      if (shareToken) {
        shareUrl = `https://cloud.audit.ke/index.php/s/${shareToken}`
      }
    } catch (shareError) {
      console.warn('Share link generation failed:', shareError)
    }

    // Log audit trail
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'document_upload',
        table_name: 'documents',
        record_id: document.id,
        new_values: {
          file_name: file.name,
          file_size: file.size,
          nextcloud_path: nextcloudPath
        }
      })

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

async function generateShareLink(filePath: string, username: string, password: string): Promise<string | null> {
  try {
    const shareResponse = await fetch(`https://cloud.audit.ke/ocs/v2.php/apps/files_sharing/api/v1/shares`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'OCS-APIRequest': 'true',
      },
      body: new URLSearchParams({
        path: filePath,
        shareType: '3', // Public link
        permissions: '1', // Read only
        password: `TCH${Date.now()}`, // Auto-generated password for extra security
      }),
    })

    if (shareResponse.ok) {
      const shareData = await shareResponse.text()
      const tokenMatch = shareData.match(/<token>([^<]+)<\/token>/)
      return tokenMatch ? tokenMatch[1] : null
    }
  } catch (error) {
    console.error('Share link generation failed:', error)
  }
  return null
}
