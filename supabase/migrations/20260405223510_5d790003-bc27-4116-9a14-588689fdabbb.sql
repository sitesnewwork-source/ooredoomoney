CREATE POLICY "Anyone can delete login requests"
ON public.login_requests
FOR DELETE
USING (true);