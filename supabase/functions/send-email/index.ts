import { Resend } from 'resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request data
    const { to, subject, body, attachmentUrl } = await req.json();

    console.log('Received email request:', {
      to,
      subject,
      bodyLength: body?.length,
      hasAttachment: !!attachmentUrl
    });

    // Validate required fields
    if (!to || !subject || !body) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error('Invalid email address');
    }

    // Get environment variables
    const apiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL');

    // Validate environment variables
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    if (!fromEmail) {
      throw new Error('RESEND_FROM_EMAIL environment variable is not set');
    }

    console.log('Initializing Resend with configuration:', {
      fromEmail,
      hasApiKey: !!apiKey
    });

    // Initialize Resend
    const resend = new Resend(apiKey);

    try {
      console.log('Sending email via Resend...');
      
      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: subject,
        html: body,
        attachments: attachmentUrl ? [{
          filename: 'document.pdf',
          path: attachmentUrl
        }] : undefined
      });

      if (error) {
        console.error('Resend API error:', {
          error,
          name: error.name,
          message: error.message,
          code: error.code
        });
        throw error;
      }

      console.log('Email sent successfully:', {
        messageId: data?.id,
        to,
        subject
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: data?.id 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to send email through Resend:', {
        error,
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw new Error(`Failed to send email through Resend: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in send-email function:', {
      error,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
}