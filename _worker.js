// _worker.js
export default {
  async fetch(request, env) {
    // 目标网站URL
    const targetUrl = 'https://nezha-dash-beta-nine.vercel.app/';
    const target = new URL(targetUrl);
    const targetHost = target.hostname;

    // 获取Worker的域名信息
    const workerHost = new URL(request.url).hostname;

    // 构造代理请求URL
    const incomingUrl = new URL(request.url);
    const proxyUrl = new URL(incomingUrl.pathname + incomingUrl.search, targetUrl);

    // 复制并修改请求头
    const headers = new Headers(request.headers);
    headers.set('Host', targetHost);

    // 创建代理请求
    const proxyRequest = new Request(proxyUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
      redirect: 'manual'
    });

    const response = await fetch(proxyRequest);
    const responseHeaders = new Headers(response.headers);

    // 处理重定向
    if (responseHeaders.has('Location')) {
      try {
        const locationUrl = new URL(responseHeaders.get('Location'));
        if (locationUrl.hostname === targetHost) {
          locationUrl.hostname = workerHost;
          responseHeaders.set('Location', locationUrl.toString());
        }
      } catch (e) {
        // 忽略相对路径
      }
    }

    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  }
};
