import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// Import the main function handler
import { handler } from "./index.ts";

// Serve the function locally for testing
serve(handler, { port: 54321 });