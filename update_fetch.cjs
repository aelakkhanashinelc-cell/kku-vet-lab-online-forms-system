const fs = require("fs");
let content = fs.readFileSync("src/utils/gasService.ts", "utf-8");

const oldFetchFn = `export async function fetchRequestsFromGoogleAppsScript(): Promise<VetLabRequest[] | null> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return null;

  try {
    // Attempt GET with cache buster
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'get_requests');
    url.searchParams.set('_t', String(Date.now()));

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (response.ok) {
      const json = await safeJsonFromResponse(response);
      if (json && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (error) {
    console.warn('GET request to GAS failed (CORS?), attempting POST fallback...');
  }

  try {
    // Fallback: Attempt POST if GET is blocked by browser CORS or threw an error
    const postRes = await fetch(gasUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'get_requests',
        timestamp: new Date().toISOString(),
      }),
    });

    if (postRes.ok) {
      const postJson = await safeJsonFromResponse(postRes);
      if (postJson && postJson.success && Array.isArray(postJson.data)) {
        return postJson.data;
      }
    }
  } catch (postError) {
    console.error('POST fallback to GAS also failed:', postError);
  }

  return null;
}`;

const newFetchFn = `export async function fetchRequestsFromGoogleAppsScript(): Promise<VetLabRequest[] | null> {
  const gasUrl = getGasUrl();
  if (!gasUrl) return null;

  // Attempt to use Cloudflare Proxy to bypass strict mobile browser tracking preventions
  try {
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'get_requests');
    url.searchParams.set('_t', String(Date.now()));

    // Try Cloudflare Proxy first
    const proxyUrl = "/api/proxy-gas?url=" + encodeURIComponent(url.toString());
    const proxyRes = await fetch(proxyUrl, { method: 'GET' });
    
    if (proxyRes.ok) {
      const proxyJson = await safeJsonFromResponse(proxyRes);
      if (proxyJson && proxyJson.success && Array.isArray(proxyJson.data)) {
        return proxyJson.data;
      }
    }
  } catch (proxyError) {
    console.warn('Proxy fetch failed, falling back to direct GET...', proxyError);
  }

  try {
    // Direct GET
    const url = new URL(gasUrl);
    url.searchParams.set('action', 'get_requests');
    url.searchParams.set('_t', String(Date.now()));

    const response = await fetch(url.toString(), { method: 'GET' });
    if (response.ok) {
      const json = await safeJsonFromResponse(response);
      if (json && json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (error) {
    console.warn('Direct GET request to GAS failed (CORS?), attempting POST fallback...');
  }

  try {
    // Direct POST Fallback
    const postRes = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'get_requests',
        timestamp: new Date().toISOString(),
      }),
    });

    if (postRes.ok) {
      const postJson = await safeJsonFromResponse(postRes);
      if (postJson && postJson.success && Array.isArray(postJson.data)) {
        return postJson.data;
      }
    }
  } catch (postError) {
    console.error('POST fallback to GAS also failed:', postError);
  }

  return null;
}`;

let newContent = content.replace(oldFetchFn, newFetchFn);
if (newContent !== content) {
  fs.writeFileSync("src/utils/gasService.ts", newContent);
  console.log("Successfully patched fetchRequestsFromGoogleAppsScript");
} else {
  console.log("Failed to patch, could not find exact string");
}
