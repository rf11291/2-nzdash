addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
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
  headers.set('Host', targetHost);  // 关键：设置目标主机头

  // 创建代理请求
  const proxyRequest = new Request(proxyUrl, {
    method: request.method,
    headers: headers,
    body: request.body,
    redirect: 'manual'  // 禁止自动重定向
  });

  // 获取目标响应
  const response = await fetch(proxyRequest);

  // 处理响应头
  const responseHeaders = new Headers(response.headers);

  // 重定向地址替换（保持代理链）
  if (responseHeaders.has('Location')) {
    try {
      const locationUrl = new URL(responseHeaders.get('Location'));
      if (locationUrl.hostname === targetHost) {
        locationUrl.hostname = workerHost;
        responseHeaders.set('Location', locationUrl.toString());
      }
    } catch (e) {
      // 忽略相对路径的重定向
    }
  }

  // 允许所有跨域请求（可选）
  responseHeaders.set('Access-Control-Allow-Origin', '*');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}
