import { useEffect } from "react";
import { useSiteContent } from "./useSiteContent";

/**
 * Reads tracking IDs from site_content (page="integrations", section="tracking")
 * and injects the matching <script> tags into the document on the fly.
 *
 * Supported keys:
 *   - ga4_id          (Google Analytics 4 — e.g. G-XXXXXXX)
 *   - gtm_id          (Google Tag Manager — e.g. GTM-XXXXXXX)
 *   - gsc_token       (Google Search Console verification — google-site-verification value)
 *   - meta_pixel_id   (Meta / Facebook Pixel ID)
 *   - linkedin_id     (LinkedIn Insight partner ID)
 *   - tiktok_id       (TikTok Pixel ID)
 *   - clarity_id      (Microsoft Clarity project ID)
 *   - hotjar_id       (Hotjar site ID)
 *   - custom_head     (raw HTML appended to <head>)
 *   - custom_body     (raw HTML appended to <body>, after <script> mount point)
 *
 * Anything left blank is ignored, so the file is safe to import in App.tsx
 * even before the user has connected anything.
 */
export const useTrackingScripts = () => {
  const { getContent, isLoading } = useSiteContent("integrations", "tracking");

  useEffect(() => {
    if (isLoading) return;

    const ga4 = getContent("ga4_id", "").trim();
    const gtm = getContent("gtm_id", "").trim();
    const gscToken = getContent("gsc_token", "").trim();
    const metaPixel = getContent("meta_pixel_id", "").trim();
    const linkedin = getContent("linkedin_id", "").trim();
    const tiktok = getContent("tiktok_id", "").trim();
    const clarity = getContent("clarity_id", "").trim();
    const hotjar = getContent("hotjar_id", "").trim();
    const customHead = getContent("custom_head", "").trim();
    const customBody = getContent("custom_body", "").trim();

    const cleanups: Array<() => void> = [];

    // GA4
    if (ga4 && /^G-[A-Z0-9]+$/i.test(ga4)) {
      const s1 = document.createElement("script");
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4}`;
      s1.dataset.tracking = "ga4";
      document.head.appendChild(s1);

      const s2 = document.createElement("script");
      s2.dataset.tracking = "ga4-init";
      s2.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}',{anonymize_ip:true});`;
      document.head.appendChild(s2);

      cleanups.push(() => { s1.remove(); s2.remove(); });
    }

    // GTM
    if (gtm && /^GTM-[A-Z0-9]+$/i.test(gtm)) {
      const s = document.createElement("script");
      s.dataset.tracking = "gtm";
      s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`;
      document.head.appendChild(s);

      const noscript = document.createElement("noscript");
      noscript.dataset.tracking = "gtm-noscript";
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtm}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.prepend(noscript);

      cleanups.push(() => { s.remove(); noscript.remove(); });
    }

    // Google Search Console verification
    if (gscToken) {
      const m = document.createElement("meta");
      m.name = "google-site-verification";
      m.content = gscToken;
      m.dataset.tracking = "gsc";
      document.head.appendChild(m);
      cleanups.push(() => m.remove());
    }

    // Meta / Facebook Pixel
    if (metaPixel && /^\d+$/.test(metaPixel)) {
      const s = document.createElement("script");
      s.dataset.tracking = "meta-pixel";
      s.text = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixel}');fbq('track','PageView');`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    }

    // LinkedIn Insight
    if (linkedin && /^\d+$/.test(linkedin)) {
      const s = document.createElement("script");
      s.dataset.tracking = "linkedin";
      s.text = `_linkedin_partner_id="${linkedin}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");b.type="text/javascript";b.async=true;b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";s.parentNode.insertBefore(b,s)})(window.lintrk);`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    }

    // TikTok Pixel
    if (tiktok) {
      const s = document.createElement("script");
      s.dataset.tracking = "tiktok";
      s.text = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktok}');ttq.page();}(window,document,'ttq');`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    }

    // Microsoft Clarity
    if (clarity && /^[a-z0-9]+$/i.test(clarity)) {
      const s = document.createElement("script");
      s.dataset.tracking = "clarity";
      s.text = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarity}");`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    }

    // Hotjar
    if (hotjar && /^\d+$/.test(hotjar)) {
      const s = document.createElement("script");
      s.dataset.tracking = "hotjar";
      s.text = `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${hotjar},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`;
      document.head.appendChild(s);
      cleanups.push(() => s.remove());
    }

    // Custom raw HTML
    if (customHead) {
      const wrap = document.createElement("div");
      wrap.dataset.tracking = "custom-head";
      wrap.style.display = "none";
      wrap.innerHTML = customHead;
      // Move children into <head>
      const nodes = Array.from(wrap.childNodes);
      nodes.forEach((n) => document.head.appendChild(n));
      cleanups.push(() => nodes.forEach((n) => n.parentNode?.removeChild(n)));
    }
    if (customBody) {
      const wrap = document.createElement("div");
      wrap.dataset.tracking = "custom-body";
      wrap.style.display = "contents";
      wrap.innerHTML = customBody;
      document.body.appendChild(wrap);
      cleanups.push(() => wrap.remove());
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);
};
