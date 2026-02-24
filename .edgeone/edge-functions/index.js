
      let global = globalThis;
      globalThis.global = globalThis;

      if (typeof global.navigator === 'undefined') {
        global.navigator = {
          userAgent: 'edge-runtime',
          language: 'en-US',
          languages: ['en-US'],
        };
      } else {
        if (typeof global.navigator.language === 'undefined') {
          global.navigator.language = 'en-US';
        }
        if (!global.navigator.languages || global.navigator.languages.length === 0) {
          global.navigator.languages = [global.navigator.language];
        }
        if (typeof global.navigator.userAgent === 'undefined') {
          global.navigator.userAgent = 'edge-runtime';
        }
      }

      class MessageChannel {
        constructor() {
          this.port1 = new MessagePort();
          this.port2 = new MessagePort();
        }
      }
      class MessagePort {
        constructor() {
          this.onmessage = null;
        }
        postMessage(data) {
          if (this.onmessage) {
            setTimeout(() => this.onmessage({ data }), 0);
          }
        }
      }
      global.MessageChannel = MessageChannel;

      // if ((typeof globalThis.fetch === 'undefined' || typeof globalThis.Headers === 'undefined' || typeof globalThis.Request === 'undefined' || typeof globalThis.Response === 'undefined') && typeof require !== 'undefined') {
      //   try {
      //     const undici = require('undici');
      //     if (undici.fetch && !globalThis.fetch) {
      //       globalThis.fetch = undici.fetch;
      //     }
      //     if (undici.Headers && typeof globalThis.Headers === 'undefined') {
      //       globalThis.Headers = undici.Headers;
      //     }
      //     if (undici.Request && typeof globalThis.Request === 'undefined') {
      //       globalThis.Request = undici.Request;
      //     }
      //     if (undici.Response && typeof globalThis.Response === 'undefined') {
      //       globalThis.Response = undici.Response;
      //     }
      //   } catch (polyfillError) {
      //     console.warn('Edge middleware polyfill failed:', polyfillError && polyfillError.message ? polyfillError.message : polyfillError);
      //   }
      // }

      '__MIDDLEWARE_BUNDLE_CODE__'

      function recreateRequest(request, overrides = {}) {
        const cloned = typeof request.clone === 'function' ? request.clone() : request;
        const headers = new Headers(cloned.headers);

        if (overrides.headerPatches) {
          Object.keys(overrides.headerPatches).forEach((key) => {
            const value = overrides.headerPatches[key];
            if (value === null || typeof value === 'undefined') {
              headers.delete(key);
            } else {
              headers.set(key, value);
            }
          });
        }

        if (overrides.headers) {
          const extraHeaders = new Headers(overrides.headers);
          extraHeaders.forEach((value, key) => headers.set(key, value));
        }

        const url = overrides.url || cloned.url;
        const method = overrides.method || cloned.method || 'GET';
        const canHaveBody = method && method.toUpperCase() !== 'GET' && method.toUpperCase() !== 'HEAD';
        const body = overrides.body !== undefined ? overrides.body : canHaveBody ? cloned.body : undefined;

        // 如果rewrite传入的是完整URL（第三方地址），需要更新host
        if (overrides.url) {
          try {
            const newUrl = new URL(overrides.url, cloned.url);
            // 只有当新URL是绝对路径（包含协议和host）时才更新host
            if (overrides.url.startsWith('http://') || overrides.url.startsWith('https://')) {
              headers.set('host', newUrl.host);
            }
            // 相对路径时保持原有host不变
          } catch (e) {
            // URL解析失败时保持原有host
          }
        }

        const init = {
          method,
          headers,
          redirect: cloned.redirect,
          credentials: cloned.credentials,
          cache: cloned.cache,
          mode: cloned.mode,
          referrer: cloned.referrer,
          referrerPolicy: cloned.referrerPolicy,
          integrity: cloned.integrity,
          keepalive: cloned.keepalive,
          signal: cloned.signal,
        };

        if (canHaveBody && body !== undefined) {
          init.body = body;
        }

        if ('duplex' in cloned) {
          init.duplex = cloned.duplex;
        }

        return new Request(url, init);

      }

      

      async function handleRequest(context){
        let routeParams = {};
        let pagesFunctionResponse = null;
        let request = context.request;
        const waitUntil = context.waitUntil;
        let urlInfo = new URL(request.url);
        const eo = request.eo || {};

        const normalizePathname = () => {
          if (urlInfo.pathname !== '/' && urlInfo.pathname.endsWith('/')) {
            urlInfo.pathname = urlInfo.pathname.slice(0, -1);
          }
        };

        function getSuffix(pathname = '') {
          // Use a regular expression to extract the file extension from the URL
          const suffix = pathname.match(/.([^.]+)$/);
          // If an extension is found, return it, otherwise return an empty string
          return suffix ? '.' + suffix[1] : null;
        }

        normalizePathname();

        let matchedFunc = false;

        
        const runEdgeFunctions = () => {
          
          if(!matchedFunc && /^\/api\/(.+?)$/.test(urlInfo.pathname)) {
            routeParams = {"id":"default","mode":2,"left":"/api/"};
            matchedFunc = true;
            (() => {
  // edge-functions/api/[[default]].ts
  async function onRequest(context) {
    if (context.request.url.endsWith(".ics")) {
      return await handleIcsRequest(context);
    }
    const url = new URL(context.request.url);
    url.protocol = "https:";
    url.hostname = "api.trrw.tech";
    url.port = "";
    url.pathname = url.pathname.replace("/api", "/hoyo_calendar");
    const proxyRequest = new Request(url.toString(), context.request);
    proxyRequest.headers.set("Host", url.hostname);
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
  async function handleIcsRequest(context) {
    try {
      const url = new URL(context.request.url);
      const pathParts = url.pathname.split("/").filter((p) => p);
      if (pathParts.length < 3) {
        return new Response("Invalid Path", { status: 400 });
      }
      const game = decodeURIComponent(pathParts[1]);
      const dataTypeRaw = decodeURIComponent(pathParts[2]);
      const data_type = dataTypeRaw.replace(".ics", "");
      const targetUrl = new URL("https://api.trrw.tech/hoyo_calendar/ics");
      targetUrl.searchParams.set("game", game);
      targetUrl.searchParams.set("data_type", data_type);
      console.log("Target URL:", targetUrl.toString());
      const proxyRequest = new Request(targetUrl.toString(), {
        method: "GET",
        headers: {
          "Host": "api.trrw.tech",
          "User-Agent": context.request.headers.get("User-Agent") || "EdgeOne-Function",
          "Accept": "*/*"
        }
      });
      const response = await fetch(proxyRequest);
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Content-Type", "text/calendar; charset=utf-8");
      const fileName = `${game}${data_type}\u65E5\u5386.ics`;
      const encodedFileName = encodeURIComponent(fileName);
      newHeaders.set("Content-Disposition", `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
      if (response.status === 200) {
        newHeaders.set("Cache-Control", "public, max-age=3600");
      } else {
        console.error("Backend returned error:", response.status);
      }
      newHeaders.delete("Content-Length");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    } catch (error) {
      console.error("ICS proxy error:", error);
      return new Response(`Internal Error: ${error.message}`, { status: 502 });
    }
  }

        pagesFunctionResponse = onRequest;
      })();
          }
        
        };
      

        let middlewareResponseHeaders = null;
        
        // 走到这里说明：
        // 1. 没有中间件响应（middlewareResponse 为 null/undefined）
        // 2. 或者中间件返回了 next
        // 需要判断是否命中边缘函数

        runEdgeFunctions();

        //没有命中边缘函数，执行回源
        if (!matchedFunc) {
          // 允许压缩的文件后缀白名单
          const ALLOW_COMPRESS_SUFFIXES = [
            '.html', '.htm', '.xml', '.txt', '.text', '.conf', '.def', '.list', '.log', '.in',
            '.css', '.js', '.json', '.rss', '.svg', '.tif', '.tiff', '.rtx', '.htc',
            '.java', '.md', '.markdown', '.ico', '.pl', '.pm', '.cgi', '.pb', '.proto',
            '.xhtml', '.xht', '.ttf', '.otf', '.woff', '.eot', '.wasm', '.binast', '.webmanifest'
          ];
          
          // 检查请求路径是否有允许压缩的后缀
          const pathname = urlInfo.pathname;
          const suffix = getSuffix(pathname);
          const hasCompressibleSuffix = ALLOW_COMPRESS_SUFFIXES.includes(suffix);
          
          // 如果不是可压缩的文件类型，删除 Accept-Encoding 头以禁用 CDN 压缩
          if (!hasCompressibleSuffix) {
              request.headers.delete('accept-encoding');
          }
          
          const originResponse = await fetch(request);
          
          // 如果中间件设置了响应头，合并到回源响应中
          if (middlewareResponseHeaders) {
            const mergedHeaders = new Headers(originResponse.headers);
            // 删除可能导致问题的编码相关头
            mergedHeaders.delete('content-encoding');
            mergedHeaders.delete('content-length');
            middlewareResponseHeaders.forEach((value, key) => {
              if (key.toLowerCase() === 'set-cookie') {
                mergedHeaders.append(key, value);
              } else {
                mergedHeaders.set(key, value);
              }
            });
            return new Response(originResponse.body, {
              status: originResponse.status,
              statusText: originResponse.statusText,
              headers: mergedHeaders,
            });
          }
          
          return originResponse;
        }
        
        // 命中了边缘函数，继续执行边缘函数逻辑

        const params = {};
        if (routeParams.id) {
          if (routeParams.mode === 1) {
            const value = urlInfo.pathname.match(routeParams.left);        
            for (let i = 1; i < value.length; i++) {
              params[routeParams.id[i - 1]] = value[i];
            }
          } else {
            const value = urlInfo.pathname.replace(routeParams.left, '');
            const splitedValue = value.split('/');
            if (splitedValue.length === 1) {
              params[routeParams.id] = splitedValue[0];
            } else {
              params[routeParams.id] = splitedValue;
            }
          }
          
        }
        const edgeFunctionResponse = await pagesFunctionResponse({request, params, env: {"_":"/opt/homebrew/bin/edgeone","ZDOTDIR":"/Users/trrrrw","VSCODE_GIT_IPC_HANDLE":"/var/folders/03/mmy4rzfx12g2t8lzbkpj2j100000gn/T/vscode-git-0939814e3c.sock","VSCODE_GIT_ASKPASS_MAIN":"/Applications/Trae CN.app/Contents/Resources/app/extensions/git/dist/askpass-main.js","VSCODE_GIT_ASKPASS_NODE":"/Applications/Trae CN.app/Contents/Frameworks/Trae CN Helper (Plugin).app/Contents/MacOS/Trae CN Helper (Plugin)","GIT_ASKPASS":"/Applications/Trae CN.app/Contents/Resources/app/extensions/git/dist/askpass.sh","COLORTERM":"truecolor","TERM_PROGRAM_VERSION":"1.107.1","TERM_PROGRAM":"vscode","TERM":"xterm-256color","BUN_INSTALL":"/Users/trrrrw/.bun","USER_ZDOTDIR":"/Users/trrrrw","LS_COLORS":"di=1;36:ln=35:so=32:pi=33:ex=31:bd=34;46:cd=34;43:su=30;41:sg=30;46:tw=30;42:ow=30;43","LESS":"-R","LSCOLORS":"Gxfxcxdxbxegedabagacad","TERM_PRODUCT":"Trae","SHELL":"/bin/zsh","LANG":"C.UTF-8","OLDPWD":"/Users/trrrrw/Documents/projects/hoyo-calendar-frontend","__CF_USER_TEXT_ENCODING":"0x1F5:0x19:0x34","PWD":"/Users/trrrrw/Documents/projects/hoyo-calendar-frontend","PAGER":"less","ZSH":"/Users/trrrrw/.oh-my-zsh","VSCODE_PYTHON_AUTOACTIVATE_GUARD":"1","isArchMatched":"1","XPC_FLAGS":"0x0","XPC_SERVICE_NAME":"0","SHLVL":"1","TMPDIR":"/var/folders/03/mmy4rzfx12g2t8lzbkpj2j100000gn/T/","HOME":"/Users/trrrrw","VSCODE_PROFILE_INITIALIZED":"1","VSCODE_INJECTION":"1","SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.imqSeVxAm2/Listeners","PATH":"/Users/trrrrw/.bun/bin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/opt/pmk/env/global/bin:/Library/Apple/usr/bin:/opt/homebrew/bin:/Applications/Trae CN.app/Contents/Resources/app/bin:/Users/trrrrw/.bun/bin:/Users/trrrrw/.cargo/bin","COMMAND_MODE":"unix2003","MallocNanoZone":"0","USER":"trrrrw","LOGNAME":"trrrrw","__CFBundleIdentifier":"cn.trae.app","FORCE_COLOR":"true","VSCODE_GIT_ASKPASS_EXTRA_ARGS":"","OSLogRateLimit":"64"}, waitUntil, eo });
        
        // 如果中间件设置了响应头，合并到边缘函数响应中
        if (middlewareResponseHeaders && edgeFunctionResponse) {
          const mergedHeaders = new Headers(edgeFunctionResponse.headers);
          // 删除可能导致问题的编码相关头
          mergedHeaders.delete('content-encoding');
          mergedHeaders.delete('content-length');
          middlewareResponseHeaders.forEach((value, key) => {
            if (key.toLowerCase() === 'set-cookie') {
              mergedHeaders.append(key, value);
            } else {
              mergedHeaders.set(key, value);
            }
          });
          return new Response(edgeFunctionResponse.body, {
            status: edgeFunctionResponse.status,
            statusText: edgeFunctionResponse.statusText,
            headers: mergedHeaders,
          });
        }
        
        return edgeFunctionResponse;
      }
      addEventListener('fetch', event=>{return event.respondWith(handleRequest({request:event.request,params: {}, env: {"_":"/opt/homebrew/bin/edgeone","ZDOTDIR":"/Users/trrrrw","VSCODE_GIT_IPC_HANDLE":"/var/folders/03/mmy4rzfx12g2t8lzbkpj2j100000gn/T/vscode-git-0939814e3c.sock","VSCODE_GIT_ASKPASS_MAIN":"/Applications/Trae CN.app/Contents/Resources/app/extensions/git/dist/askpass-main.js","VSCODE_GIT_ASKPASS_NODE":"/Applications/Trae CN.app/Contents/Frameworks/Trae CN Helper (Plugin).app/Contents/MacOS/Trae CN Helper (Plugin)","GIT_ASKPASS":"/Applications/Trae CN.app/Contents/Resources/app/extensions/git/dist/askpass.sh","COLORTERM":"truecolor","TERM_PROGRAM_VERSION":"1.107.1","TERM_PROGRAM":"vscode","TERM":"xterm-256color","BUN_INSTALL":"/Users/trrrrw/.bun","USER_ZDOTDIR":"/Users/trrrrw","LS_COLORS":"di=1;36:ln=35:so=32:pi=33:ex=31:bd=34;46:cd=34;43:su=30;41:sg=30;46:tw=30;42:ow=30;43","LESS":"-R","LSCOLORS":"Gxfxcxdxbxegedabagacad","TERM_PRODUCT":"Trae","SHELL":"/bin/zsh","LANG":"C.UTF-8","OLDPWD":"/Users/trrrrw/Documents/projects/hoyo-calendar-frontend","__CF_USER_TEXT_ENCODING":"0x1F5:0x19:0x34","PWD":"/Users/trrrrw/Documents/projects/hoyo-calendar-frontend","PAGER":"less","ZSH":"/Users/trrrrw/.oh-my-zsh","VSCODE_PYTHON_AUTOACTIVATE_GUARD":"1","isArchMatched":"1","XPC_FLAGS":"0x0","XPC_SERVICE_NAME":"0","SHLVL":"1","TMPDIR":"/var/folders/03/mmy4rzfx12g2t8lzbkpj2j100000gn/T/","HOME":"/Users/trrrrw","VSCODE_PROFILE_INITIALIZED":"1","VSCODE_INJECTION":"1","SSH_AUTH_SOCK":"/private/tmp/com.apple.launchd.imqSeVxAm2/Listeners","PATH":"/Users/trrrrw/.bun/bin:/usr/local/bin:/System/Cryptexes/App/usr/bin:/usr/bin:/bin:/usr/sbin:/sbin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin:/opt/pmk/env/global/bin:/Library/Apple/usr/bin:/opt/homebrew/bin:/Applications/Trae CN.app/Contents/Resources/app/bin:/Users/trrrrw/.bun/bin:/Users/trrrrw/.cargo/bin","COMMAND_MODE":"unix2003","MallocNanoZone":"0","USER":"trrrrw","LOGNAME":"trrrrw","__CFBundleIdentifier":"cn.trae.app","FORCE_COLOR":"true","VSCODE_GIT_ASKPASS_EXTRA_ARGS":"","OSLogRateLimit":"64"}, waitUntil: event.waitUntil }))});