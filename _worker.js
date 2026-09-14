export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    const referer = url.searchParams.get("referer"); // Dynamically grab referer

    if (!targetUrl) {
      // Serve index.html if no URL parameter is provided
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
    // Standard User-Agent to prevent basic blocks
    forwardHeaders.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36");
    
    // Inject the specific Referer if the frontend provided it
    if (referer) {
      forwardHeaders.set("Referer", referer);
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
      });

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
                
                // Carry over original chunk tokens (for token preservation)
                baseUrlObj.searchParams.forEach((value, key) => {
                  if (!absoluteUrlObj.searchParams.has(key)) {
                    absoluteUrlObj.searchParams.set(key, value);
                  }
                });

                // Build the proxy URL for the chunks, carrying over the referer too
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
      return new Response(err.message, { status: 500 });
    }
  },
};
