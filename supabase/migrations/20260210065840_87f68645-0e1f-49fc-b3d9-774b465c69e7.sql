
-- Site settings (key-value store for global config)
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text,
  setting_type text NOT NULL DEFAULT 'text', -- text, image, json, boolean
  category text NOT NULL DEFAULT 'general', -- general, contact, social, seo
  label text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Super admins can insert site settings" ON public.site_settings FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can update site settings" ON public.site_settings FOR UPDATE USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can delete site settings" ON public.site_settings FOR DELETE USING (public.is_super_admin(auth.uid()));

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CMS Hero Slides
CREATE TABLE public.cms_hero_slides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active hero slides are viewable by everyone" ON public.cms_hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Super admins can view all hero slides" ON public.cms_hero_slides FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can insert hero slides" ON public.cms_hero_slides FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can update hero slides" ON public.cms_hero_slides FOR UPDATE USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can delete hero slides" ON public.cms_hero_slides FOR DELETE USING (public.is_super_admin(auth.uid()));

CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON public.cms_hero_slides FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CMS Pages (static pages + blog posts)
CREATE TABLE public.cms_pages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  excerpt text,
  featured_image_url text,
  page_type text NOT NULL DEFAULT 'page', -- page, blog
  status text NOT NULL DEFAULT 'draft', -- draft, published
  meta_title text,
  meta_description text,
  author_id uuid REFERENCES public.profiles(id),
  published_at timestamp with time zone,
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published pages are viewable by everyone" ON public.cms_pages FOR SELECT USING (status = 'published');
CREATE POLICY "Super admins can view all pages" ON public.cms_pages FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can insert pages" ON public.cms_pages FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can update pages" ON public.cms_pages FOR UPDATE USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can delete pages" ON public.cms_pages FOR DELETE USING (public.is_super_admin(auth.uid()));

CREATE TRIGGER update_cms_pages_updated_at BEFORE UPDATE ON public.cms_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add CRUD RLS for testimonials (super_admin)
CREATE POLICY "Super admins can view all testimonials" ON public.testimonials FOR SELECT USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can update testimonials" ON public.testimonials FOR UPDATE USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can delete testimonials" ON public.testimonials FOR DELETE USING (public.is_super_admin(auth.uid()));

-- Seed default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, category, label) VALUES
  ('site_name', 'Doctor Appointment', 'text', 'general', 'Site Name'),
  ('site_tagline', 'Your Health, Our Priority', 'text', 'general', 'Tagline'),
  ('site_logo', '', 'image', 'general', 'Logo URL'),
  ('contact_phone', '', 'text', 'contact', 'Phone'),
  ('contact_email', '', 'text', 'contact', 'Email'),
  ('contact_address', '', 'text', 'contact', 'Address'),
  ('social_facebook', '', 'text', 'social', 'Facebook URL'),
  ('social_twitter', '', 'text', 'social', 'Twitter URL'),
  ('social_instagram', '', 'text', 'social', 'Instagram URL'),
  ('social_youtube', '', 'text', 'social', 'YouTube URL'),
  ('seo_meta_title', 'Doctor Appointment - Book Your Doctor', 'text', 'seo', 'Meta Title'),
  ('seo_meta_description', 'Find and book appointments with top doctors near you.', 'text', 'seo', 'Meta Description');
