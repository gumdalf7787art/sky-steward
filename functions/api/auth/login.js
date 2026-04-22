import { hashPassword } from '../../utils/hash';
import { signJWT } from '../../utils/jwt';

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return new Response(JSON.stringify({ error: "이메일과 비밀번호를 모두 입력해주세요." }), { status: 400 });
        }

        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        if (!user) {
            return new Response(JSON.stringify({ error: "가입되지 않은 이메일이거나 비밀번호가 틀렸습니다." }), { status: 401 });
        }

        const hashedPassword = await hashPassword(password);
        if (user.password !== hashedPassword) {
            return new Response(JSON.stringify({ error: "가입되지 않은 이메일이거나 비밀번호가 틀렸습니다." }), { status: 401 });
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
