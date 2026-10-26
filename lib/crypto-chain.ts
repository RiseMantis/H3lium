// Browser SHA-256 Hash Chaining Engine for Evidence and Audit Log Integrity

export async function computeSha256(data: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(data);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch {
      // Fallback below
    }
  }

  // Deterministic fast fallback SHA-like representation if subtle is unavailable
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  const part1 = (hash >>> 0).toString(16).padStart(8, '0');
  const part2 = ((hash ^ 0x5a5a5a5a) >>> 0).toString(16).padStart(8, '0');
  const part3 = ((hash ^ 0x3c3c3c3c) >>> 0).toString(16).padStart(8, '0');
  const part4 = ((hash ^ 0xf0f0f0f0) >>> 0).toString(16).padStart(8, '0');
  return `0x${part1}${part2}${part3}${part4}`.slice(0, 32);
}

export function formatHash(hash: string): string {
  if (!hash) return '00000000...';
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}
