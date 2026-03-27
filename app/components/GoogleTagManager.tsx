import Script from "next/script";

/**
 * Standard GTM Web snippet (head script + noscript iframe). Container ID from env only.
 * @see https://support.google.com/tagmanager/answer/6103696
 */
export function GoogleTagManager() {
  const id = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  if (!id) return null;
  const idLiteral = JSON.stringify(id);

  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${idLiteral});`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`}
          height={0}
          width={0}
          title="Google Tag Manager"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}
