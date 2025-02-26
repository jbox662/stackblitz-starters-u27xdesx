import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import Button from './Button';
import toast from 'react-hot-toast';
import { sendQuoteEmail, sendInvoiceEmail } from '../utils/email';

interface EmailButtonProps {
  type: 'quote' | 'invoice';
  document: any;
  onSuccess?: () => void;
  className?: string;
}

const EmailButton: React.FC<EmailButtonProps> = ({ 
  type, 
  document, 
  onSuccess,
  className = ''
}) => {
  const [isSending, setIsSending] = useState(false);

  const handleClick = async () => {
    if (!document?.customer?.email) {
      toast.error('Customer email is required');
      return;
    }

    try {
      setIsSending(true);
      console.log(`Attempting to send ${type} to ${document.customer.email}`);

      if (type === 'quote') {
        await sendQuoteEmail(document, document.customer);
        toast.success('Quote sent to customer successfully');
      } else {
        await sendInvoiceEmail(document, document.customer);
        toast.success('Invoice sent to customer successfully');
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('Error sending email:', {
        error,
        type,
        documentId: document.id,
        customerEmail: document.customer?.email
      });

      const errorMessage = error.message || `Failed to send ${type}. Please ensure the email service is properly configured.`;
      
      // Show a more detailed error message for development
      if (process.env.NODE_ENV === 'development') {
        console.error('Detailed error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }

      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      variant="secondary"
      icon={Mail}
      onClick={handleClick}
      disabled={isSending}
      className={className}
    >
      {isSending ? 'Sending...' : `Email ${type === 'quote' ? 'Quote' : 'Invoice'}`}
    </Button>
  );
};

export default EmailButton;