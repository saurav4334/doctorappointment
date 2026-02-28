import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function TrackingScripts() {
  const { data: settings } = useQuery({
    queryKey: ["tracking-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["gtm_id", "facebook_pixel_id"]);
      const map: Record<string, string> = {};
      data?.forEach((s) => {
        if (s.setting_value) map[s.setting_key] = s.setting_value;
      });
      return map;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Google Tag Manager
  useEffect(() => {
    const gtmId = settings?.gtm_id;
    if (!gtmId || document.getElementById("gtm-script")) return;

    // GTM inline script
    const script = document.createElement("script");
    script.id = "gtm-script";
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(script);

    // GTM noscript iframe
    const noscript = document.createElement("noscript");
    noscript.id = "gtm-noscript";
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      document.getElementById("gtm-script")?.remove();
      document.getElementById("gtm-noscript")?.remove();
    };
  }, [settings?.gtm_id]);

  // Facebook Pixel
  useEffect(() => {
    const pixelId = settings?.facebook_pixel_id;
    if (!pixelId || document.getElementById("fb-pixel-script")) return;

    const script = document.createElement("script");
    script.id = "fb-pixel-script";
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    const noscript = document.createElement("noscript");
    noscript.id = "fb-pixel-noscript";
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);

    return () => {
      document.getElementById("fb-pixel-script")?.remove();
      document.getElementById("fb-pixel-noscript")?.remove();
    };
  }, [settings?.facebook_pixel_id]);

  return null;
}
