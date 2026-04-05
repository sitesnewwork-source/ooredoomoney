
-- Create login requests table
CREATE TABLE public.login_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.login_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert login requests
CREATE POLICY "Anyone can create login requests"
ON public.login_requests
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read login requests (admin page)
CREATE POLICY "Anyone can read login requests"
ON public.login_requests
FOR SELECT
USING (true);

-- Allow anyone to update login requests (approve/reject)
CREATE POLICY "Anyone can update login requests"
ON public.login_requests
FOR UPDATE
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.login_requests;
