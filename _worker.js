addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  const targetUrl = 'https://nezha-dash-beta-nine.vercel.app';

  // 构建新的请求
  const newUrl = new URL(targetUrl + url.pathname + url.search);
  const newRequest = new Request(newUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: 'follow'  // 重要：处理重定向
  });

  // 移除或修改可能导致问题的请求头
  newRequest.headers.delete('Host'); // 必须删除 Host 头
  newRequest.headers.set('Origin', targetUrl); //有时候需要设置正确的Origin
    // 也可以根据需要删除或者添加其他的请求头。  例如：
    // newRequest.headers.delete('Referer');
    // newRequest.headers.delete('Accept-Encoding'); // 避免压缩问题
    // newRequest.headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP'));

  // 发送请求到目标服务器
  const response = await fetch(newRequest);


  // 克隆响应，因为响应体只能被读取一次 (重要)
  const newResponse = new Response(response.body, response);

    // 移除或修改可能导致问题的响应头
  newResponse.headers.delete('Content-Security-Policy'); //CSP可能会阻止某些内容加载
  newResponse.headers.delete('X-Frame-Options'); // 允许嵌入到 iframe (如果需要)
    // 可以根据需要删除或者添加其他的响应头。例如：
   // newResponse.headers.set('Access-Control-Allow-Origin', '*'); // 允许跨域 (如果需要)



  return newResponse;
}
