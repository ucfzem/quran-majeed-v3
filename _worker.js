export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let path = url.pathname;

    if (path === '/' || path === '') {
      path = '/index.html';
    } else if (path.endsWith('/')) {
      path = path + 'index.html';
    } else if (!path.includes('.')) {
      path = path + '/index.html';
    }

    const indexReq = new Request(new URL(path, url), request);
    const res = await env.ASSETS.fetch(indexReq);
    if (res.status === 200) return res;

    return new Response('Not Found', { status: 404 });
  }
};
