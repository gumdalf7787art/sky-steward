import { hashPassword } from '../../utils/hash';
import { signJWT } from '../../utils/jwt';

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
        }

        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        if (!user) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
        }

        // Generate JWT
        const token = await signJWT({ id: user.id, email: user.email, role: user.role, nickname: user.nickname });

        return new Response(JSON.stringify({ 
            success: true, 
            token,
            user: { id: user.id, email: user.email, role: user.role, nickname: user.nickname }
        }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
