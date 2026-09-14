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
      const isTextManifest = targetUrl.includes(".m3u8") || contentType.includes("mpegurl") || contentType.includes("text/plain");

      if (isTextManifest) {
        let manifestText = await response.text();
        
        if (manifestText.includes("<html") || manifestText.includes("AccessDenied")) {
          return new Response(manifestText, { status: 502, headers: { "Access-Control-Allow-Origin": "*" } });
        }

        const rewrittenManifest = manifestText
          .split("\n")
          .map((line) => {
            let trimmed = line.trim();
            
            // 1. Handle normal chunk/sub-playlist lines
            if (trimmed && !trimmed.startsWith("#")) {
              try {
                const absoluteUrl = new URL(trimmed, targetUrl).href;
                return `${url.origin}/?url=${encodeURIComponent(absoluteUrl)}`;
              } catch (e) {
                return line;
              }
            }

            // 2. Handle Encryption Keys (#EXT-X-KEY) inside manifests
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
