const SECRET = "SKY_PLATFORM_SECRET_KEY";

// Robust base64url that handles both string (UTF-8) and binary (TypedArray)
function base64url(source) {
    let uint8;
    if (typeof source === "string") {
        uint8 = new TextEncoder().encode(source);
    } else if (source instanceof Uint8Array) {
        uint8 = source;
    } else if (source instanceof ArrayBuffer) {
        uint8 = new Uint8Array(source);
    } else {
        uint8 = new TextEncoder().encode(JSON.stringify(source));
    }

    const binString = Array.from(uint8, (x) => String.fromCodePoint(x)).join("");
    return btoa(binString)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

// Robust base64url decoding
function fromBase64url(b64) {
    const binString = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

export async function signJWT(payload) {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = base64url(header);
    const encodedPayload = base64url({ 
        ...payload, 
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 
    });

    const tokenData = `${encodedHeader}.${encodedPayload}`;
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(tokenData)
    );
    const encodedSignature = base64url(signature);

    return `${tokenData}.${encodedSignature}`;
}

export async function verifyJWT(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payloadBytes = fromBase64url(parts[1]);
        const payload = JSON.parse(new TextDecoder().decode(payloadBytes));

        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

        const key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(SECRET),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const sigBytes = fromBase64url(parts[2]);
        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            sigBytes,
            new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
        );

        return isValid ? payload : null;
    } catch (e) {
        console.error("JWT Verify Error:", e);
        return null;
    }
}
