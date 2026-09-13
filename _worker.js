export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");
    const referer = url.searchParams.get("referer");

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

    const headers = new Headers();
    headers.set("User-Agent", "ReactNativeVideo/9.11.1 (Linux;Android 13) AndroidXMedia3/1.6.1");
    if (referer) headers.set("Referer", referer);

    try {
      const response = await fetch(targetUrl, { method: request.method, headers });

      // Pass HTTP errors to the frontend for the diagnostic UI
      if (!response.ok && response.status !== 200) {
        return new Response(await response.text(), {
          status: response.status,
          headers: { "Access-Control-Allow-Origin": "*" }
        });
      }

      const contentType = response.headers.get("content-type") || "";
      const isManifest = contentType.includes("mpegurl") || targetUrl.includes(".m3u8");

      if (isManifest) {
        const manifest = await response.text();
        const rewritten = manifest.split("\n").map(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
            try {
              const absUrl = new URL(trimmed, targetUrl).href;
              return `${url.origin}/?url=${encodeURIComponent(absUrl)}${referer ? `&referer=${encodeURIComponent(referer)}` : ""}`;
            } catch {
              return line;
            }
          }
          return line;
        }).join("\n");

        return new Response(rewritten, {
          status: 200,
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-store",
          },
        });
      }

      const mediaRes = new Response(response.body, response);
      mediaRes.headers.set("Access-Control-Allow-Origin", "*");
      return mediaRes;
    } catch (err) {
      return new Response(err.message, { status: 502, headers: { "Access-Control-Allow-Origin": "*" } });
    }
  },
};
