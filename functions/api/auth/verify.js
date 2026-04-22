import { verifyJWT } from "../../utils/jwt";

export async function onRequestGet(context) {
    const { request } = context;
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ valid: false, error: "Missing token" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const token = authHeader.split(" ")[1];
    
    if (token === "null" || token === "undefined") {
        return new Response(JSON.stringify({ valid: false, error: "Token is null string" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    const user = await verifyJWT(token);

    if (!user) {
        return new Response(JSON.stringify({ valid: false, error: "Invalid or expired token" }), { 
            status: 401,
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ 
        valid: true, 
        user 
    }), {
        headers: { "Content-Type": "application/json" }
    });
}
