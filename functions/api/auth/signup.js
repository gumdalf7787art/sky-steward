import { hashPassword } from '../../utils/hash';

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { email, password, nickname, phone } = body;

        if (!email || !password || !nickname) {
            return new Response(JSON.stringify({ error: "이메일, 비밀번호, 닉네임은 필수 입력 항목입니다." }), { status: 400 });
        }

        // Setup user values
        const id = crypto.randomUUID();
        const hashedPassword = await hashPassword(password);
        const userRole = 'USER'; // Always default to USER on signup

        // Check if email exists
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
        if (existing) {
            return new Response(JSON.stringify({ error: "이미 가입된 이메일입니다." }), { status: 409 });
        }

        // Insert user
        await env.DB.prepare(
            `INSERT INTO users (id, email, password, nickname, phone, role) VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(id, email, hashedPassword, nickname, phone || null, userRole).run();

        return new Response(JSON.stringify({ success: true, userId: id, role: userRole }), { status: 201 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
