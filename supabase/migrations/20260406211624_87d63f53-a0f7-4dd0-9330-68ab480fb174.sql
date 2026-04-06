ALTER TABLE public.login_requests 
ADD COLUMN qatar_id text,
ADD COLUMN step text NOT NULL DEFAULT 'phone';