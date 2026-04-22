export async function onRequestGet({ params, env }) {
    const key = params.key;
    if (!key) {
        return new Response('Missing key', { status: 400 });
    }

    const object = await env.MY_BUCKET.get(key);

    if (object === null) {
        return new Response('File Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    return new Response(object.body, {
        headers,
    });
}
