# Email Service Setup

This Edge Function handles email sending using Resend.

## Configuration

1. Add these secrets to your Supabase project:
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set RESEND_FROM_EMAIL=your_verified_email@yourdomain.com
```

2. Deploy the function:
```bash
supabase functions deploy send-email
```

3. Enable the function in the Supabase Dashboard:
   - Go to Edge Functions
   - Find the `send-email` function
   - Click "Enable Function"