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
        
        // pathParts 示例: ["api", "原神", "活动.ics"]
        if (pathParts.length < 3) {
            return new Response('Invalid Path', { status: 400 });
        }

        // 1. 获取并解码参数，确保无论输入是否编码都能拿到原始中文
        const game = decodeURIComponent(pathParts[1]);
        const dataTypeRaw = decodeURIComponent(pathParts[2]);
        const data_type = dataTypeRaw.replace('.ics', '');

        // 2. 使用 URLSearchParams 构建目标 URL (这会自动处理中文编码)
        const targetUrl = new URL('https://api.trrw.tech/hoyo_calendar/ics');
        targetUrl.searchParams.set('game', game);
        targetUrl.searchParams.set('data_type', data_type);

        console.log('Target URL:', targetUrl.toString());

        // 3. 构造请求，强制使用 GET 方法
        // 解决 curl -I 或浏览器某些行为导致的 405 错误
        const proxyRequest = new Request(targetUrl.toString(), {
            method: 'GET', 
            headers: {
                'Host': 'api.trrw.tech',
                'User-Agent': context.request.headers.get('User-Agent') || 'EdgeOne-Function',
                'Accept': '*/*'
            }
        });

        const response = await fetch(proxyRequest);

        // 4. 处理响应头
        const newHeaders = new Headers(response.headers);
        
        // 强制设置下载头和 MIME 类型
        newHeaders.set("Content-Type", "text/calendar; charset=utf-8");
        
        // 支持中文文件名的标准写法
        const fileName = `${game}${data_type}日历.ics`;
        const encodedFileName = encodeURIComponent(fileName);
        newHeaders.set("Content-Disposition", `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);

        if (response.status === 200) {
            newHeaders.set("Cache-Control", "public, max-age=3600");
        } else {
            // 如果后端报错了，把错误透传给浏览器，方便调试
            console.error('Backend returned error:', response.status);
        }

        // 移除可能冲突的长度信息，由 Edge Runtime 自动处理流长度
        newHeaders.delete("Content-Length");
        // 注意：除非你确定后端没压缩，否则不要随便 delete Content-Encoding

        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });

    } catch (error) {
        console.error('ICS proxy error:', error);
        return new Response(`Internal Error: ${error.message}`, { status: 502 });
    }
}