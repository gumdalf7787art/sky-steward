// Cloudflare Workers/Pages Standalone Worker Handler

const SECRET = "SKY_PLATFORM_SECRET_KEY";

// Utils: Hashing
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Utils: JWT
function base64url(source) {
    let encoded = btoa(source);
    encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return encoded;
}

async function signJWT(payload) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) }));
    const tokenData = `${encodedHeader}.${encodedPayload}`;
    
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(tokenData));
    const encodedSignature = base64url(String.fromCharCode(...new Uint8Array(signature)));
    return `${tokenData}.${encodedSignature}`;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // API: Signup
        if (url.pathname === "/api/auth/signup" && request.method === "POST") {
            try {
                const body = await request.json();
                const { email, password, nickname, phone } = body;
                if (!email || !password || !nickname) return new Response(JSON.stringify({ error: "필수 정보가 누락되었습니다." }), { status: 400 });

                const id = crypto.randomUUID();
                const hashedPassword = await hashPassword(password);
                
                // Check existing
                const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
                if (existing) return new Response(JSON.stringify({ error: "이미 가입된 이메일입니다." }), { status: 409 });

                // Insert
                await env.DB.prepare(`INSERT INTO users (id, email, password, nickname, phone, role) VALUES (?, ?, ?, ?, ?, ?)`).bind(id, email, hashedPassword, nickname, phone || null, 'USER').run();
                return new Response(JSON.stringify({ success: true, userId: id }), { status: 201 });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500 });
            }
        }

        // API: Login
        if (url.pathname === "/api/auth/login" && request.method === "POST") {
            try {
                const body = await request.json();
                const { email, password } = body;
                const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
                if (!user) return new Response(JSON.stringify({ error: "가입되지 않은 이메일이거나 비밀번호가 틀렸습니다." }), { status: 401 });

                const hashedPassword = await hashPassword(password);
                if (user.password !== hashedPassword) return new Response(JSON.stringify({ error: "가입되지 않은 이메일이거나 비밀번호가 틀렸습니다." }), { status: 401 });

                const token = await signJWT({ id: user.id, email: user.email, role: user.role, nickname: user.nickname });
                return new Response(JSON.stringify({ success: true, token, user: { id: user.id, email: user.email, role: user.role, nickname: user.nickname } }), { status: 200 });
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500 });
            }
        }

        // Fallback: Static Assets (Web Pages)
        if (env.ASSETS) {
            return env.ASSETS.fetch(request);
        }
        
        return new Response("Not Found", { status: 404 });
    }
};
