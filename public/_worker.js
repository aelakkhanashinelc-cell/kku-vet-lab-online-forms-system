export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Proxy for Google Apps Script to bypass CORS/ITP in strict mobile browsers
    if (url.pathname === "/api/proxy-gas") {
      const gasUrl = url.searchParams.get("url");
      if (!gasUrl) {
        return new Response("Missing url param", { status: 400 });
      }

      // Reconstruct the request to Google Apps Script
      // Only proxy GET and POST methods
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          }
        });
      }

      try {
        const gasReq = new Request(gasUrl, {
          method: request.method,
          headers: {
            "Content-Type": request.headers.get("Content-Type") || "text/plain;charset=utf-8"
          },
          body: request.method === "POST" ? request.body : undefined,
          redirect: "follow"
        });

        const gasRes = await fetch(gasReq);
        const resHeaders = new Headers(gasRes.headers);
        resHeaders.set("Access-Control-Allow-Origin", "*");
        
        return new Response(gasRes.body, {
          status: gasRes.status,
          statusText: gasRes.statusText,
          headers: resHeaders
        });
      } catch (err) {
        return new Response(JSON.stringify({ success: false, error: err.message }), { 
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
          }
        });
      }
    }

    // Otherwise, serve static assets
    return env.ASSETS.fetch(request);
  }
};
