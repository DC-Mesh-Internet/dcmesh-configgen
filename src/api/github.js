const REPO_BASE = "https://api.github.com/repos/DC-Mesh-Internet/dcmesh-configs";
const GITHUB_API_TOKEN = "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" //process.env.REACT_APP_GITHUB_TOKEN || "";

// Headers for fine-grained PAT authentication
const HEADERS = GITHUB_API_TOKEN ? {
  'Authorization': `Bearer ${GITHUB_API_TOKEN}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
} : {
  'Accept': 'application/vnd.github+json'
};

export async function fetchVersions() {
  const tags = await get(`${REPO_BASE}/tags`);
  return tags.map((t) => t.name);
}

export async function fetchDevices(version) {
  if (!version) {
    throw new Error("Missing version");
  }
  const { tree } = await get(`${REPO_BASE}/git/trees/${version}?recursive=1`);
  const items = tree.filter((item) => item.type === "tree" && !item.path.includes('/'));
  return items.map(({ path, url }) => ({
    name: path,
    url,
  }));
}

export async function fetchTemplates(version, device) {
  if (!device || !version) {
    throw new Error("Missing device or version");
  }

  const { tree } = await get(device.url);
  const templateItems = tree.filter((item) => item.path.match(/\.tmpl$/));
  
  return Promise.all(
    templateItems.map(({ url, path }) =>
      get(url).then(({ content, encoding }) => ({
        name: path,
        content: decodeBase64(content),
      }))
    )
  );
}

async function get(url) {
  const response = await fetch(url, { headers: HEADERS });
  
  if (response.status === 401) {
    throw new Error("GitHub authentication failed - check your token");
  }
  if (response.status === 403) {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    throw new Error(rateLimitRemaining === '0' ? "API rate limit exceeded" : "GitHub API access forbidden");
  }
  if (response.status !== 200) {
    throw new Error(`GitHub request failed: ${response.status}`);
  }
  
  return response.json();
}

// Better base64 decoding that handles UTF-8 properly
function decodeBase64(base64String) {
  try {
    // First try standard atob
    return atob(base64String);
  } catch (e) {
    // Fallback for Unicode characters if needed
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }
}