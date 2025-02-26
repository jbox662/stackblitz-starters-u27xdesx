import { supabase } from '../lib/supabase';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachmentUrl?: string;
}

// Development environment email simulation
const simulateEmailSend = async (data: EmailData) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Development Mode: Email would be sent with following data:', {
    to: data.to,
    subject: data.subject,
    bodyPreview: data.body.substring(0, 100) + '...',
    hasAttachment: !!data.attachmentUrl
  });
  
  return { success: true };
};

export const sendEmail = async (data: EmailData) => {
  try {
    // Validate email address
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.to)) {
      throw new Error('Invalid email address');
    }

    // Validate required fields
    if (!data.subject || !data.body) {
      throw new Error('Subject and body are required');
    }

    console.log('Attempting to send email:', {
      to: data.to,
      subject: data.subject,
      bodyLength: data.body.length,
      hasAttachment: !!data.attachmentUrl
    });

    // Call the Supabase Edge Function
    const { data: response, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: data.to,
        subject: data.subject,
        body: data.body,
        attachmentUrl: data.attachmentUrl
      }
    });

    if (error) {
      console.error('Supabase function error:', {
        error,
        name: error.name,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to send email: ${error.message}`);
    }

    if (!response?.success) {
      console.error('Email service response:', response);
      throw new Error(response?.error || 'Email service returned an unsuccessful response');
    }

    console.log('Email sent successfully:', {
      success: response.success,
      messageId: response.messageId
    });

    return true;
  } catch (error) {
    console.error('Error in sendEmail:', {
      error,
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const sendProposalEmail = async (proposal: any, customer: any) => {
  if (!customer?.email) {
    throw new Error('Customer email is required');
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(proposal.total_amount);

  const formattedDate = new Date(proposal.valid_until).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Proposal ${proposal.proposal_number} from MAC`;
  const body = `
Dear ${customer.name},

Thank you for considering MAC for your project needs. Please find attached your proposal ${proposal.proposal_number} for a total amount of ${formattedAmount}.

Proposal Details:
- Proposal Number: ${proposal.proposal_number}
- Total Amount: ${formattedAmount}
- Valid Until: ${formattedDate}

${proposal.notes ? `\nAdditional Notes:\n${proposal.notes}\n` : ''}

To review and approve this proposal, please click the link below:
[Proposal Review Link]

If you have any questions or need to discuss any aspect of this proposal, please don't hesitate to contact us.

Thank you for your interest in our services.

Best regards,
MAC Team
  `.trim();

  return sendEmail({
    to: customer.email,
    subject,
    body,
    // attachmentUrl would be added here once we implement PDF generation
  });
};

export const sendQuoteEmail = async (quote: any, customer: any) => {
  if (!customer?.email) {
    throw new Error('Customer email is required');
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(quote.total_amount);

  const formattedDate = new Date(quote.valid_until).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Quote ${quote.quote_number} from MAC`;
  const body = `
Dear ${customer.name},

Thank you for your interest in our services. Please find attached your quote ${quote.quote_number} for a total amount of ${formattedAmount}.

Quote Details:
- Quote Number: ${quote.quote_number}
- Total Amount: ${formattedAmount}
- Valid Until: ${formattedDate}

${quote.notes ? `\nAdditional Notes:\n${quote.notes}\n` : ''}

To review and approve this quote, please click the link below:
[Quote Review Link]

If you have any questions or need to discuss any aspect of this quote, please don't hesitate to contact us.

Thank you for considering our services.

Best regards,
MAC Team
  `.trim();

  return sendEmail({
    to: customer.email,
    subject,
    body,
    // attachmentUrl would be added here once we implement PDF generation
  });
};

export const sendInvoiceEmail = async (invoice: any, customer: any) => {
  if (!customer?.email) {
    throw new Error('Customer email is required');
  }

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(invoice.total_amount);

  const formattedDueDate = new Date(invoice.due_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subject = `Invoice ${invoice.invoice_number} from MAC`;
  const body = `
Dear ${customer.name},

Please find attached your invoice ${invoice.invoice_number} for a total amount of ${formattedAmount}.

Invoice Details:
- Invoice Number: ${invoice.invoice_number}
- Total Amount: ${formattedAmount}
- Due Date: ${formattedDueDate}

${invoice.notes ? `\nAdditional Notes:\n${invoice.notes}\n` : ''}

To view and pay this invoice, please click the link below:
[Invoice Payment Link]

If you have any questions or need to discuss payment arrangements, please don't hesitate to contact us.

Thank you for your business.

Best regards,
MAC Team
  `.trim();

  return sendEmail({
    to: customer.email,
    subject,
    body,
    // attachmentUrl would be added here once we implement PDF generation
  });
};