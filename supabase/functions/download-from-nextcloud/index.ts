
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NEXTCLOUD_URL = "https://cloud.audit.ke"
const NEXTCLOUD_USERNAME = "csa.kuria"
const NEXTCLOUD_PASSWORD = Deno.env.get('NEXTCLOUD_PASSWORD') || ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { filePath } = await req.json()

    if (!filePath) {
      return new Response(
        JSON.stringify({ success: false, error: 'File path is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Create WebDAV URL
    const webdavUrl = `${NEXTCLOUD_URL}/remote.php/dav/files/${NEXTCLOUD_USERNAME}${filePath}`
    
    console.log('Attempting to download from:', webdavUrl)

    // Create authorization header
    const auth = btoa(`${NEXTCLOUD_USERNAME}:${NEXTCLOUD_PASSWORD}`)
    
    // Fetch the file from Nextcloud
    const response = await fetch(webdavUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'TaxCSA-App/1.0'
      }
    })

    if (!response.ok) {
      console.error('Nextcloud response error:', response.status, response.statusText)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to download file: ${response.status} ${response.statusText}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status 
        }
      )
    }

    // Get the file data
    const fileData = await response.arrayBuffer()
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream'

    // Return the file directly
    return new Response(fileData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
      }
    })

  } catch (error) {
    console.error('Error in download-from-nextcloud function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
