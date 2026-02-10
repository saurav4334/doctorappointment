import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

interface PageData {
  title: string;
  content: string | null;
  excerpt: string | null;
  featured_image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export default function CMSPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;
      const { data, error } = await supabase
        .from("cms_pages")
        .select("title, content, excerpt, featured_image_url, meta_title, meta_description")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPage(data);
        document.title = data.meta_title || data.title;
      }
      setLoading(false);
    };
    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (notFound || !page) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Page Not Found</h1>
          <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {page.meta_description && (
        <meta name="description" content={page.meta_description} />
      )}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {page.featured_image_url && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={page.featured_image_url}
              alt={page.title}
              className="w-full h-64 md:h-96 object-cover"
            />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">{page.title}</h1>
        {page.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{page.excerpt}</p>
        )}
        {page.content && (
          <div className="prose prose-lg max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {page.content}
          </div>
        )}
      </div>
    </Layout>
  );
}
