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

      const clonedResponse = response.clone();
      let textContent = "";
      try {
        textContent = await clonedResponse.text();
      } catch (e) {}

      const isManifest = textContent.trim().startsWith("#EXTM3U") || 
                         targetUrl.includes(".m3u8") || 
                         response.headers.get("content-type")?.includes("mpegurl");

      if (isManifest) {
        if (textContent.includes("<html") || textContent.includes("AccessDenied")) {
          return new Response(textContent, { status: 502, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        // Extract original query parameters from targetUrl to preserve session tokens across sub-paths
        const targetParsed = new URL(targetUrl);
        const originalSearch = targetParsed.search;

        const rewrittenManifest = textContent
          .split("\n")
          .map((line) => {
            let trimmed = line.trim();
            
            if (trimmed && !trimmed.startsWith("#")) {
              try {
                let absoluteUrl = new URL(trimmed, targetUrl);
                // Preserve or carry over essential tokens if missing in sub-path
                if (originalSearch && !absoluteUrl.search) {
                  absoluteUrl.search = originalSearch;
                }
                return `${url.origin}/?url=${encodeURIComponent(absoluteUrl.href)}`;
              } catch (e) {
                return line;
              }
            }

            if (trimmed.startsWith("#EXT-X-KEY")) {
              return line.replace(/URI="(https?:\/\/[^"]+)"/g, (match, keyUrl) => {
                try {
                  const absoluteKeyUrl = new URL(keyUrl, targetUrl).href;
                  return `URI="${url.origin}/?url=${encodeURIComponent(absoluteKeyUrl)}"`;
                } catch (e) {
                  return match;
                }
              }).replace(/URI=([^,\s]+)/g, (match, keyUrl) => {
                try {
                  let cleanUri = keyUrl.replace(/["']/g, "");
                  const absoluteKeyUrl = new URL(cleanUri, targetUrl).href;
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
