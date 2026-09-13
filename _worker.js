export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    const authKey = url.searchParams.get("key");

    // Basic Token Authentication to prevent unauthorized use
    const SECRET_KEY = "cricxcrate"; 
    if (authKey !== SECRET_KEY) {
      return new Response("Unauthorized Request", { status: 403 });
    }

    if (!targetUrl) {
      return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Missing URL", { status: 400 });
    }

    // Strict CORS: Change "*" to "https://yourdomain.fun" for production protection
    const allowedOrigin = "*";

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const forwardHeaders = new Headers();
    // Allow dynamic headers via URL params, fallback to Fancode defaults
    forwardHeaders.set("User-Agent", url.searchParams.get("ua") || "ReactNativeVideo/9.11.1 (Linux;Android 13) AndroidXMedia3/1.6.1");
    forwardHeaders.set("Referer", url.searchParams.get("ref") || "https://fancode.com/");

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
      });

      const contentType = response.headers.get("content-type") || "";
      const isManifest = contentType.includes("mpegurl") || targetUrl.includes(".m3u8");
      const isTsChunk = targetUrl.includes(".ts");

      if (isManifest) {
        const manifestText = await response.text();
        
        const rewrittenManifest = manifestText
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
              try {
                const absoluteUrl = new URL(trimmed, targetUrl).href;
                // Append the auth key to chunk URLs so they don't fail authentication
                return `${url.origin}/?url=${encodeURIComponent(absoluteUrl)}&key=${authKey}`;
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
            "Access-Control-Allow-Origin": allowedOrigin,
            "Cache-Control": "no-store",
          },
        });
      }

      const mediaResponse = new Response(response.body, response);
      mediaResponse.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      
      // MIME-Type Optimization for chunks
      if (isTsChunk) {
        mediaResponse.headers.set("Content-Type", "video/MP2T");
      }
      
      return mediaResponse;
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  },
};
