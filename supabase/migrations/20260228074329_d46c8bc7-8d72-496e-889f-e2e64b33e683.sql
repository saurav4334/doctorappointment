INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, label)
VALUES
  ('gtm_id', '', 'text', 'tracking', 'Google Tag Manager ID'),
  ('facebook_pixel_id', '', 'text', 'tracking', 'Facebook Pixel ID')
ON CONFLICT DO NOTHING;