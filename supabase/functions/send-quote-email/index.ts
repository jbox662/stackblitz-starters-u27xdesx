import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

async function generatePDF(quoteId: string, simplified: boolean) {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  // Get quote data
  const { data: quote, error } = await supabaseClient
    .from('quotes')
    .select(`
      *,
      customer:customers(*),
      items:quote_items(*)
    `)
    .eq('id', quoteId)
    .single();

  if (error) throw error;

  // Generate PDF content (you'll need to implement this based on your PDF generation needs)
  // For now, we'll return a simple buffer
  const content = `Quote ${quote.quote_number}\n${JSON.stringify(quote, null, 2)}`;
  return new TextEncoder().encode(content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { quoteId, quoteNumber, customerEmail, customerName, total, simplified } = await req.json()

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Generate PDF buffer
    const pdfBuffer = await generatePDF(quoteId, simplified)

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'quotes@yourcompany.com',
        to: customerEmail,
        subject: `Quote ${quoteNumber} for Review`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2563eb;">Quote ${quoteNumber}</h2>
              <p>Dear ${customerName},</p>
              <p>Thank you for your interest. Please find attached our quote for your review.</p>
              <p>Total Amount: <strong>$${total.toFixed(2)}</strong></p>
              <div style="margin: 30px 0;">
                <a href="${Deno.env.get('PUBLIC_SITE_URL')}/quotes/${quoteId}/approve" 
                   style="background-color: #2563eb; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                  Approve Quote
                </a>
              </div>
              <p>If you have any questions, please don't hesitate to contact us.</p>
              <p>Thank you for your business!</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 14px;">
                This email contains a quote attachment in PDF format.
              </p>
            </div>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: `quote-${quoteNumber}.pdf`,
            content: pdfBuffer.toString('base64')
          }
        ]
      })
    })

    if (!res.ok) throw new Error('Failed to send email')

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 