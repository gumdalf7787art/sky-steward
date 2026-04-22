import { verifyJWT } from '../../utils/jwt';
import { hashPassword } from '../../utils/hash';

export async function onRequestPost({ request, env }) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: "인증이 필요합니다." }), { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJWT(token);

        if (!payload || !payload.id) {
            return new Response(JSON.stringify({ error: "유효하지 않은 토큰입니다." }), { status: 401 });
        }

        const body = await request.json();
        const { nickname, profile_image, currentPassword, newPassword } = body;

        // Fetch current user
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.id).first();
        if (!user) {
            return new Response(JSON.stringify({ error: "사용자를 찾을 수 없습니다." }), { status: 404 });
        }

        let updates = [];
        let values = [];

        // 1. Nickname Update
        if (nickname && nickname !== user.nickname) {
            updates.push('nickname = ?');
            values.push(nickname);
        }

        // 2. Profile Image Update (URL or base64 - simplified here as storing text)
        if (profile_image !== undefined && profile_image !== user.profile_image) {
            updates.push('profile_image = ?');
            values.push(profile_image);
        }

        // 3. Password Update
        if (newPassword) {
            if (!currentPassword) {
                return new Response(JSON.stringify({ error: "현재 비밀번호를 입력해주세요." }), { status: 400 });
            }

            const hashedCurrent = await hashPassword(currentPassword);
            if (hashedCurrent !== user.password) {
                return new Response(JSON.stringify({ error: "현재 비밀번호가 일치하지 않습니다." }), { status: 403 });
            }

            const hashedNew = await hashPassword(newPassword);
            updates.push('password = ?');
            values.push(hashedNew);
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "변경된 내용이 없습니다.", user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role, profile_image: user.profile_image } }), { status: 200 });
        }

        values.push(payload.id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await env.DB.prepare(query).bind(...values).run();

        // Get updated user
        const updatedUser = await env.DB.prepare('SELECT id, email, nickname, phone, role, profile_image FROM users WHERE id = ?').bind(payload.id).first();

        return new Response(JSON.stringify({ success: true, user: updatedUser }), { status: 200 });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
