const SECRET = "SKY_PLATFORM_SECRET_KEY"; // In production, move to env vars!

function base64url(source) {
    // UTF-8 문자열을 바이트 배열로 변환한 뒤 btoa를 적용하여 한글을 지원합니다.
    const bytes = new TextEncoder().encode(source);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    let encoded = btoa(binary);
    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encoded;
}

// Simple JWT signing using WebCrypto HMAC SHA-256
export async function signJWT(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) })); // 24h expiration

    const tokenData = `${encodedHeader}.${encodedPayload}`;
    
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(tokenData));
    const encodedSignature = base64url(String.fromCharCode(...new Uint8Array(signature)));

    return `${tokenData}.${encodedSignature}`;
}

export async function verifyJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const headerStr = atob(parts[0].replace(/-/g, '+').replace(/_/g, '/'));
        
        // Decode payload with UTF-8 support
        const payloadBinary = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        const payloadBytes = new Uint8Array(payloadBinary.length);
        for (let i = 0; i < payloadBinary.length; i++) {
            payloadBytes[i] = payloadBinary.charCodeAt(i);
        }
        const payloadStr = new TextDecoder().decode(payloadBytes);
        const payload = JSON.parse(payloadStr);

        // Verify expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

        const expectedSignature = parts[2];
        const tokenData = `${parts[0]}.${parts[1]}`;
        
        const key = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(SECRET),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        // Convert signature back to ArrayBuffer
        const sigStr = atob(expectedSignature.replace(/-/g, '+').replace(/_/g, '/'));
        const sigBuf = new Uint8Array(sigStr.length);
        for (let i = 0; i < sigStr.length; i++) sigBuf[i] = sigStr.charCodeAt(i);

        const isValid = await crypto.subtle.verify(
            'HMAC',
            key,
            sigBuf,
            new TextEncoder().encode(tokenData)
        );

        if (isValid) return payload;
        return null;
    } catch(e) {
        return null;
    }
}
