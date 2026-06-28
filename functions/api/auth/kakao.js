import { signJWT } from '../../utils/jwt';

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { code, redirectUri } = body;

        if (!code || !redirectUri) {
            return new Response(JSON.stringify({ error: "인가 코드와 리다이렉트 URI가 필요합니다." }), { status: 400 });
        }

        const clientId = '54aba65c523195665e84dfbfd648ff70';
        const clientSecret = '3hYu3S5xsBjknD6kby6P1zcQcJLVYFu5';

        // 1. 카카오 토큰 발급 요청
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: redirectUri,
            code: code,
        });

        if (clientSecret) {
            tokenParams.append('client_secret', clientSecret);
        }

        const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: tokenParams.toString()
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            console.error("Kakao Token Error:", tokenData);
            return new Response(JSON.stringify({ error: "카카오 토큰 발급 실패" }), { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // 2. 카카오 사용자 정보 조회
        const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            }
        });

        const userData = await userResponse.json();
        if (userData.error) {
            console.error("Kakao User Info Error:", userData);
            return new Response(JSON.stringify({ error: "카카오 사용자 정보 조회 실패" }), { status: 400 });
        }

        const kakaoId = userData.id.toString();
        const email = userData.kakao_account?.email;
        const nickname = userData.properties?.nickname || '카카오유저';
        const profileImage = userData.properties?.profile_image || '';

        if (!email) {
            return new Response(JSON.stringify({ error: "카카오 계정에 등록된 이메일이 필요합니다. 필수 정보 제공에 동의해주세요." }), { status: 400 });
        }

        // 3. 기존 회원 여부 확인
        let user = await env.DB.prepare('SELECT * FROM users WHERE kakao_id = ? OR email = ?').bind(kakaoId, email).first();

        if (user) {
            // 이메일로 가입된 유저가 카카오로 처음 로그인하는 경우 kakao_id 업데이트
            if (!user.kakao_id) {
                await env.DB.prepare('UPDATE users SET kakao_id = ? WHERE id = ?').bind(kakaoId, user.id).run();
                user.kakao_id = kakaoId;
            }
        } else {
            // 신규 가입
            const newUserId = crypto.randomUUID();
            // 카카오 로그인은 비밀번호가 없으므로 더미값 사용
            const dummyPassword = "kakao_oauth_dummy_" + crypto.randomUUID();
            
            await env.DB.prepare(`
                INSERT INTO users (id, email, password, nickname, profile_image, role, kakao_id)
                VALUES (?, ?, ?, ?, ?, 'USER', ?)
            `).bind(newUserId, email, dummyPassword, nickname, profileImage, kakaoId).run();

            user = {
                id: newUserId,
                email,
                nickname,
                profile_image: profileImage,
                role: 'USER',
                kakao_id: kakaoId
            };
        }

        // 4. JWT 토큰 발급
        const token = await signJWT({ id: user.id, email: user.email, role: user.role, nickname: user.nickname });

        return new Response(JSON.stringify({ 
            success: true, 
            token,
            user: { id: user.id, email: user.email, role: user.role, nickname: user.nickname, profile_image: user.profile_image }
        }), { status: 200 });

    } catch (e) {
        console.error("Kakao Auth Exception:", e);
        return new Response(JSON.stringify({ error: "인증 처리 중 서버 오류가 발생했습니다." }), { status: 500 });
    }
}
