import { verifyJWT } from '../../utils/jwt';
import { hashPassword } from '../../utils/hash';

export async function onRequestPost({ request, env }) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: "인증이 필요합니다." }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const token = authHeader.split(' ')[1];
        const payload = await verifyJWT(token);

        if (!payload || !payload.id) {
            return new Response(JSON.stringify({ error: "유효하지 않은 토큰입니다." }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { nickname, profile_image, currentPassword, newPassword } = body;

        // Fetch current user
        const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.id).first();
        if (!user) {
            return new Response(JSON.stringify({ error: "사용자를 찾을 수 없습니다." }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let updates = [];
        let values = [];

        // 1. Nickname Update
        if (nickname && nickname !== user.nickname) {
            updates.push('nickname = ?');
            values.push(nickname);
        }

        // 2. Profile Image Update (Store in R2 if it's a data URL)
        if (profile_image !== undefined && profile_image !== user.profile_image) {
            if (profile_image && profile_image.startsWith('data:image')) {
                try {
                    // Base64를 바이너리로 변환
                    const base64Data = profile_image.split(',')[1];
                    const binaryString = atob(base64Data);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) {
                        bytes[i] = binaryString.charCodeAt(i);
                    }

                    // R2에 저장 (avatars/유저ID.jpg)
                    const r2Key = `avatars/${payload.id}.jpg`;
                    await env.MY_BUCKET.put(r2Key, bytes, {
                        httpMetadata: { contentType: 'image/jpeg' }
                    });

                    // DB에는 프록시 URL 저장
                    const imageUrl = `/api/media/${r2Key}`;
                    updates.push('profile_image = ?');
                    values.push(imageUrl);
                } catch (r2Error) {
                    console.error("R2 Upload Error:", r2Error);
                    return new Response(JSON.stringify({ error: "이미지 저장 중 오류가 발생했습니다." }), { 
                        status: 500,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            } else {
                updates.push('profile_image = ?');
                values.push(profile_image);
            }
        }

        // 3. Password Update
        if (newPassword) {
            if (!currentPassword) {
                return new Response(JSON.stringify({ error: "현재 비밀번호를 입력해주세요." }), { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const hashedCurrent = await hashPassword(currentPassword);
            if (hashedCurrent !== user.password) {
                return new Response(JSON.stringify({ error: "현재 비밀번호가 일치하지 않습니다." }), { 
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                });
            }

            const hashedNew = await hashPassword(newPassword);
            updates.push('password = ?');
            values.push(hashedNew);
        }

        if (updates.length === 0) {
            return new Response(JSON.stringify({ success: true, message: "변경된 내용이 없습니다.", user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role, profile_image: user.profile_image } }), { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        values.push(payload.id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        await env.DB.prepare(query).bind(...values).run();

        // Get updated user
        const updatedUser = await env.DB.prepare('SELECT id, email, nickname, phone, role, profile_image FROM users WHERE id = ?').bind(payload.id).first();

        return new Response(JSON.stringify({ success: true, user: updatedUser }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
