export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const host = url.hostname.toLowerCase();

    // 1. External redirects for Harry's blog and El Mundo en Bici
    if (host.startsWith("harry.") || host.startsWith("worldonabike.")) {
      return Response.redirect("https://worldonabike.com" + url.pathname + url.search, 301);
    }
    if (host.startsWith("elmundoenbici.")) {
      return Response.redirect("https://elmundoenbici.com" + url.pathname + url.search, 301);
    }

    // 2. Redirect dead BuddyPress directories to /about/
    const p = url.pathname.toLowerCase();
    if (
      p.startsWith("/members") ||
      p.startsWith("/groups") ||
      p.startsWith("/activity") ||
      p.startsWith("/forums") ||
      p.startsWith("/questions") ||
      p.startsWith("/bpnavslug") ||
      p.startsWith("/register") ||
      p.startsWith("/activate")
    ) {
      return Response.redirect("https://biketravellers.com/about/", 301);
    }

    // 3. Subdomain routing: <subdomain>.biketravellers.com -> /blogs/<subdomain>/
    // Only apply to subdomains of biketravellers.com (not root, not www, not pages.dev)
    if (host.endsWith(".biketravellers.com") && !host.startsWith("www.")) {
      const parts = host.split(".");
      const sub = parts[0];
      const newUrl = new URL(request.url);
      if (!newUrl.pathname.startsWith(`/blogs/${sub}`)) {
        newUrl.pathname = `/blogs/${sub}${url.pathname}`;
      }
      const response = await env.ASSETS.fetch(newUrl);
      if (response.status === 404) {
        // Fallback to shared root assets (e.g. wp-includes, shared styles)
        const fallback = await env.ASSETS.fetch(request);
        if (fallback.status !== 404) {
          return fallback;
        }
      }
      return response;
    }

    // 4. Standard static asset fetch
    return env.ASSETS.fetch(request);
  }
};
