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

    const forwardHeaders = new Headers();
    forwardHeaders.set("User-Agent", "ReactNativeVideo/9.11.1 (Linux;Android 13) AndroidXMedia3/1.6.1");
    forwardHeaders.set("Referer", "https://fancode.com/");

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
      });

      const contentType = response.headers.get("content-type") || "";
      const isManifest = targetUrl.includes(".m3u8") || contentType.includes("mpegurl") || contentType.includes("text/plain");

      if (isManifest) {
        let manifestText = await response.text();
        
        const rewrittenManifest = manifestText
          .split("\n")
          .map((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
              try {
                // Resolves relative URLs for both chunks (.ts/.mp4) and sub-manifests (.m3u8)
                const absoluteUrl = new URL(trimmed, targetUrl).href;
                return `${url.origin}/?url=${encodeURIComponent(absoluteUrl)}`;
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
      return new Response(err.message, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  },
};
