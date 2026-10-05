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

    // 2. Subdomain mapping: <subdomain>.biketravellers.com -> /blogs/<subdomain>/
    const parts = host.split(".");
    if (parts.length > 2 && parts[0] !== "www" && host.includes("biketravellers")) {
      const sub = parts[0];
      const newUrl = new URL(request.url);
      if (!newUrl.pathname.startsWith(`/blogs/${sub}`)) {
        newUrl.pathname = `/blogs/${sub}${url.pathname}`;
      }
      return env.ASSETS.fetch(newUrl);
    }

    // 3. Fallback to standard static assets
    return env.ASSETS.fetch(request);
  }
};
