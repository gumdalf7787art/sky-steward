export async function onRequestGet({ params, env }) {
    // [[path]].js capture multiple segments as an array
    const pathArray = params.path;
    
    if (!pathArray || pathArray.length === 0) {
        return new Response('Missing path', { status: 400 });
    }

    // Join the segments back to reconstruct the R2 key (e.g., avatars/abc.jpg)
    const key = pathArray.join('/');
    
    const object = await env.MY_BUCKET.get(key);

    if (object === null) {
        return new Response(`File Not Found: ${key}`, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000');

    // Return the image data
    return new Response(object.body, {
        headers,
    });
}
