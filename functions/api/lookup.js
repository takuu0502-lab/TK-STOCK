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

  // jan_code パラメータで検索
  const yahooUrl = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch'
    + '?appid=' + encodeURIComponent(appid)
    + '&jan_code=' + encodeURIComponent(jan)
    + '&results=1';

  try {
    const res = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TK-STOCK/1.0)',
        'Accept': 'application/json'
      }
    });
    const text = await res.text();

    let parsed;
    try { parsed = JSON.parse(text); } catch (_) { parsed = null; }

    // 400エラー時はqueryパラメータでも試みる
    if (res.status === 400 || (parsed && parsed.hits && parsed.hits.length === 0)) {
      const fallbackUrl = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch'
        + '?appid=' + encodeURIComponent(appid)
        + '&query=' + encodeURIComponent(jan)
        + '&results=1';
      const res2 = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TK-STOCK/1.0)',
          'Accept': 'application/json'
        }
      });
      const text2 = await res2.text();
      let parsed2;
      try { parsed2 = JSON.parse(text2); } catch (_) { parsed2 = null; }

      const body2 = JSON.stringify({
        _status: res2.status,
        _ok: res2.ok,
        _debug: { jan_code_status: res.status, jan_code_raw: text.slice(0, 300) },
        ...(parsed2 || { _raw: text2.slice(0, 500) })
      });
      return new Response(body2, {
        status: res2.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = JSON.stringify({
      _status: res.status,
      _ok: res.ok,
      ...(parsed || { _raw: text.slice(0, 500) })
    });
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
