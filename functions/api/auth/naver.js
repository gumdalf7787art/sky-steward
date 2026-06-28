import { signJWT } from '../../utils/jwt';

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { code, state, redirectUri } = body;

        if (!code || !state || !redirectUri) {
            return new Response(JSON.stringify({ error: "인가 코드, 상태 토큰, 리다이렉트 URI가 필요합니다." }), { status: 400 });
        }

        const clientId = 'uVhtUn8Vu_Xav3KaHU5b';
        const clientSecret = '11siVR6ST4';

        // 1. 네이버 토큰 발급 요청
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            state: state,
        });

        const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            body: tokenParams.toString()
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            console.error("Naver Token Error:", tokenData);
            return new Response(JSON.stringify({ error: "네이버 토큰 발급 실패" }), { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // 2. 네이버 사용자 정보 조회
        const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const userDataRaw = await userResponse.json();
        
        if (userDataRaw.resultcode !== '00') {
            console.error("Naver User Info Error:", userDataRaw);
            return new Response(JSON.stringify({ error: "네이버 사용자 정보 조회 실패" }), { status: 400 });
        }

        const userData = userDataRaw.response;
        const naverId = userData.id;
        const email = userData.email;
        const nickname = userData.name || userData.nickname || '네이버유저';
        const profileImage = userData.profile_image || '';

        if (!email) {
            return new Response(JSON.stringify({ error: "네이버 계정에 등록된 이메일이 필요합니다. 필수 정보 제공에 동의해주세요." }), { status: 400 });
        }

        // 3. 기존 회원 여부 확인
        let user = await env.DB.prepare('SELECT * FROM users WHERE naver_id = ? OR email = ?').bind(naverId, email).first();

        if (user) {
            // 이메일로 가입된 유저가 네이버로 처음 로그인하는 경우 naver_id 업데이트
            if (!user.naver_id) {
                await env.DB.prepare('UPDATE users SET naver_id = ? WHERE id = ?').bind(naverId, user.id).run();
                user.naver_id = naverId;
            }
        } else {
            // 신규 가입
            const newUserId = crypto.randomUUID();
            // 네이버 로그인은 비밀번호가 없으므로 더미값 사용
            const dummyPassword = "naver_oauth_dummy_" + crypto.randomUUID();
            
            await env.DB.prepare(`
                INSERT INTO users (id, email, password, nickname, profile_image, role, naver_id)
                VALUES (?, ?, ?, ?, ?, 'USER', ?)
            `).bind(newUserId, email, dummyPassword, nickname, profileImage, naverId).run();

            user = {
                id: newUserId,
                email,
                nickname,
                profile_image: profileImage,
                role: 'USER',
                naver_id: naverId
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
        console.error("Naver Auth Exception:", e);
        return new Response(JSON.stringify({ error: "인증 처리 중 서버 오류가 발생했습니다." }), { status: 500 });
    }
}
