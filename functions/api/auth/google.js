import { signJWT } from '../../utils/jwt';

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { code, redirectUri } = body;

        if (!code || !redirectUri) {
            return new Response(JSON.stringify({ error: "인가 코드와 리다이렉트 URI가 필요합니다." }), { status: 400 });
        }

        const clientId = env.GOOGLE_CLIENT_ID;
        const clientSecret = env.GOOGLE_CLIENT_SECRET;

        // 1. 구글 토큰 발급 요청
        const tokenParams = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri
        });

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenParams.toString()
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            console.error("Google Token Error:", tokenData);
            return new Response(JSON.stringify({ error: "구글 토큰 발급 실패" }), { status: 400 });
        }

        const accessToken = tokenData.access_token;

        // 2. 구글 사용자 정보 조회
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const userData = await userResponse.json();
        
        if (userData.error) {
            console.error("Google User Info Error:", userData);
            return new Response(JSON.stringify({ error: "구글 사용자 정보 조회 실패" }), { status: 400 });
        }

        const googleId = userData.id;
        const email = userData.email;
        const nickname = userData.name || '구글유저';
        const profileImage = userData.picture || '';

        if (!email) {
            return new Response(JSON.stringify({ error: "구글 계정에 등록된 이메일이 필요합니다." }), { status: 400 });
        }

        // 3. 기존 회원 여부 확인
        let user = await env.DB.prepare('SELECT * FROM users WHERE google_id = ? OR email = ?').bind(googleId, email).first();

        if (user) {
            // 이메일로 가입된 유저가 구글로 처음 로그인하는 경우 google_id 업데이트
            if (!user.google_id) {
                await env.DB.prepare('UPDATE users SET google_id = ? WHERE id = ?').bind(googleId, user.id).run();
                user.google_id = googleId;
            }
        } else {
            // 신규 가입
            const newUserId = crypto.randomUUID();
            // 소셜 로그인은 비밀번호가 없으므로 더미값 사용
            const dummyPassword = "google_oauth_dummy_" + crypto.randomUUID();
            
            await env.DB.prepare(`
                INSERT INTO users (id, email, password, nickname, profile_image, role, google_id)
                VALUES (?, ?, ?, ?, ?, 'USER', ?)
            `).bind(newUserId, email, dummyPassword, nickname, profileImage, googleId).run();

            user = {
                id: newUserId,
                email,
                nickname,
                profile_image: profileImage,
                role: 'USER',
                google_id: googleId
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
        console.error("Google Auth Exception:", e);
        return new Response(JSON.stringify({ error: "인증 처리 중 서버 오류가 발생했습니다." }), { status: 500 });
    }
}
