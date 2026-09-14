export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return env.ASSETS.fetch(request);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS, POST",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const forwardHeaders = new Headers();
    forwardHeaders.set("User-Agent", "ReactNativeVideo/9.11.1 (Linux;Android 13) AndroidXMedia3/1.6.1");
    forwardHeaders.set("Referer", "https://fancode.com/");
    forwardHeaders.set("Origin", "https://fancode.com/");

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
      });

      const contentType = response.headers.get("content-type") || "";
      let textContent = "";
      
      try {
        textContent = await response.clone().text();
      } catch (e) {}

      // Check if it's an HLS manifest (.m3u8 or contains #EXTM3U)
      const isManifest = textContent.trim().startsWith("#EXTM3U") || 
                         targetUrl.includes(".m3u8") || 
                         contentType.includes("mpegurl");

      if (isManifest) {
        const targetParsed = new URL(targetUrl);
        const originalSearch = targetParsed.search;

        const rewrittenManifest = textContent
          .split("\n")
          .map((line) => {
            let trimmed = line.trim();
            
            if (trimmed && !trimmed.startsWith("#")) {
              try {
                let absoluteUrl = new URL(trimmed, targetUrl);
                if (originalSearch && !absoluteUrl.search) {
                  absoluteUrl.search = originalSearch;
                }
                return `${url.origin}/?url=${encodeURIComponent(absoluteUrl.href)}`;
              } catch (e) {
                return line;
              }
            }

            if (trimmed.startsWith("#EXT-X-KEY")) {
              return line.replace(/URI="([^"]+)"/g, (match, keyUrl) => {
                try {
                  const absoluteKeyUrl = new URL(keyUrl, targetUrl).href;
                  return `URI="${url.origin}/?url=${encodeURIComponent(absoluteKeyUrl)}"`;
                } catch (e) {
                  return match;
                }
              });
            }

            return line;
          })
          .join("\n");

        return new Response(rewrittenManifest, {
          status: response.status,
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Cache-Control": "no-store",
          },
        });
      }

      // For TS chunks and media segments, pipe the response directly with open CORS headers
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
      return newResponse;

    } catch (err) {
      return new Response(err.message, { 
        status: 500, 
        headers: { "Access-Control-Allow-Origin": "*" } 
      });
    }
  },
};
