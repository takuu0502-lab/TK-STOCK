export async function onRequest(context) {
  const url = new URL(context.request.url);
  const jan = url.searchParams.get('jan');
  const appid = url.searchParams.get('appid');

  if (!jan || !appid) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const yahooUrl = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch'
    + '?appid=' + encodeURIComponent(appid)
    + '&jan_code=' + encodeURIComponent(jan)
    + '&results=1';

  try {
    const res = await fetch(yahooUrl);
    const text = await res.text();
    // Yahoo APIのレスポンスをそのまま返す（デバッグ用にstatusも付加）
    let body;
    try {
      const parsed = JSON.parse(text);
      body = JSON.stringify({ _status: res.status, _ok: res.ok, ...parsed });
    } catch (_) {
      body = JSON.stringify({ _status: res.status, _ok: res.ok, _raw: text.slice(0, 500) });
    }
    return new Response(body, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ _status: 500, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
