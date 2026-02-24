interface RequestContext {
    request: Request;
}


export async function onRequest(context: RequestContext): Promise<Response> {
    if (context.request.url.endsWith('.ics')) {
        return await handleIcsRequest(context);
    }

    const url = new URL(context.request.url);

    url.protocol = 'https:';
    url.hostname = 'api.trrw.tech';
    url.port = '';

    url.pathname = url.pathname
        .replace('/api', '/hoyo_calendar');

    const proxyRequest = new Request(url.toString(), context.request);
    proxyRequest.headers.set('Host', url.hostname);
    const response = await fetch(proxyRequest);

    const newHeaders = new Headers(response.headers);
    if (response.status === 200) {
        newHeaders.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
        newHeaders.delete("Pragma");
        newHeaders.delete("Expires");
    }
    newHeaders.delete("Content-Encoding");
    newHeaders.delete("Content-Length");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
}

async function handleIcsRequest(context: RequestContext): Promise<Response> {
    try {
        const url = new URL(context.request.url);
        const pathParts = url.pathname.split('/').filter(p => p);
        const game = pathParts[1];
        const dataTypeRaw = pathParts[2];
        
        if (!game || !dataTypeRaw) {
            return new Response('game and data_type are required', { status: 400 });
        }
        
        const data_type = dataTypeRaw.replace('.ics', '');
        // ✅ 修复空格问题
        const targetUrl = `https://api.trrw.tech/hoyo_calendar/ics?game=${game}&data_type=${data_type}`;
        
        const proxyRequest = new Request(targetUrl, {
            method: context.request.method,
            headers: context.request.headers,
            body: ['GET', 'HEAD'].includes(context.request.method) ? undefined : context.request.body,
        });
        // ❌ 移除 Host 设置（fetch 会自动处理）
        
        const response = await fetch(proxyRequest);
        const newHeaders = new Headers(response.headers);
        
        if (response.status === 200) {
            newHeaders.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
            newHeaders.delete("Pragma");
            newHeaders.delete("Expires");
        }
        // ⚠️ 谨慎删除 Content-Encoding，除非确认已处理解压
        newHeaders.delete("Content-Length");

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });
    } catch (error) {
        console.error('ICS proxy error:', error);
        return new Response('Internal Server Error', { status: 502 });
    }
}