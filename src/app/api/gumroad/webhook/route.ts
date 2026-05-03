import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

const CANCEL_EVENTS = ['refund', 'cancellation', 'dispute', 'subscription_ended']
const RENEW_EVENTS = ['sale', 'subscription_restarted']

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const resourceName = formData.get('resource_name') as string | null
  const licenseKey = formData.get('license_key') as string | null

  if (!licenseKey || !resourceName) return NextResponse.json({ ok: false })

  const supabase = createAdminClient()

  if (RENEW_EVENTS.includes(resourceName)) {
    const expiresAt = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
    await supabase
      .from('licenses')
      .update({ expires_at: expiresAt })
      .eq('license_key', licenseKey)
  } else if (CANCEL_EVENTS.includes(resourceName)) {
    await supabase
      .from('licenses')
      .update({ expires_at: new Date().toISOString() })
      .eq('license_key', licenseKey)
  }

  return NextResponse.json({ ok: true })
}
