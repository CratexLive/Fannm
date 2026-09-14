export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    const referer = url.searchParams.get("referer");

    if (!targetUrl) {
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not Found", { status: 404 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const forwardHeaders = new Headers();
    forwardHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36");
    
    if (referer) {
      forwardHeaders.set("Referer", referer);
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
      });

      // Pass HTTP errors (like 403 or 404) directly back to the frontend so Hls.js can display them
      if (!response.ok && !response.headers.get("content-type")?.includes("mpegurl")) {
          return new Response(`Target server rejected the request with ${response.status}`, {
              status: response.status,
              headers: { "Access-Control-Allow-Origin": "*" }
          });
      }

      const contentType = response.headers.get("content-type") || "";
      const isManifest = contentType.includes("mpegurl") || targetUrl.includes(".m3u8");

      if (isManifest) {
        const manifestText = await response.text();
        const baseUrlObj = new URL(targetUrl);
        
        const rewrittenManifest = manifestText
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
              try {
                const absoluteUrlObj = new URL(trimmed, targetUrl);
                
                baseUrlObj.searchParams.forEach((value, key) => {
                  if (!absoluteUrlObj.searchParams.has(key)) {
                    absoluteUrlObj.searchParams.set(key, value);
                  }
                });

                let proxyChunkUrl = `${url.origin}/?url=${encodeURIComponent(absoluteUrlObj.href)}`;
                if (referer) {
                  proxyChunkUrl += `&referer=${encodeURIComponent(referer)}`;
                }
                
                return proxyChunkUrl;
              } catch (e) {
                return line;
              }
            }
            return line;
          })
          .join("\n");

        return new Response(rewrittenManifest, {
          status: response.status,
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        });
      }

      const mediaResponse = new Response(response.body, response);
      mediaResponse.headers.set("Access-Control-Allow-Origin", "*");
      return mediaResponse;
    } catch (err) {
      return new Response(err.message, { 
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  },
};
