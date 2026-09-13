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
          "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const isManifest = targetUrl.includes(".m3u8");
    const isSegment = targetUrl.includes(".ts") || targetUrl.includes(".m4s");

    const forwardHeaders = new Headers();
    forwardHeaders.set("User-Agent", "ReactNativeVideo/9.11.1 (Linux;Android 13) AndroidXMedia3/1.6.1");
    forwardHeaders.set("Referer", "https://fancode.com/");
    forwardHeaders.set("Origin", "https://fancode.com");

    // Check Cloudflare Cache for video segments to prevent buffering/origin bans
    const cache = caches.default;
    const cacheKey = new Request(targetUrl, request);
    
    if (isSegment) {
      const cachedResponse = await cache.match(cacheKey);
      if (cachedResponse) {
        const response = new Response(cachedResponse.body, cachedResponse);
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("X-Proxy-Cache", "HIT");
        return response;
      }
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
      });

      // Rewrite the manifest to proxy internal segments
      if (isManifest) {
        let manifest = await response.text();
        const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

        manifest = manifest
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
              const absoluteUrl = trimmed.startsWith("http") ? trimmed : baseUrl + trimmed;
              return `${url.origin}/?url=${encodeURIComponent(absoluteUrl)}`;
            }
            return line;
          })
          .join("\n");

        return new Response(manifest, {
          status: response.status,
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache, no-store, must-revalidate", // Never cache manifest
          },
        });
      }

      // Serve and cache the video chunks
      const segmentResponse = new Response(response.body, response);
      segmentResponse.headers.set("Access-Control-Allow-Origin", "*");
      segmentResponse.headers.set("Cache-Control", "public, max-age=3600"); // Cache chunks for 1 hour

      if (isSegment && response.status === 200) {
        ctx.waitUntil(cache.put(cacheKey, segmentResponse.clone()));
      }

      return segmentResponse;
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  },
};
