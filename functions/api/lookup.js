export async function onRequest(context) {
  const url = new URL(context.request.url);
  const jan = url.searchParams.get('jan');
  const appid = url.searchParams.get('appid');
  const accessKey = url.searchParams.get('accessKey');

  if (!jan || !appid || !accessKey) {
    return new Response(JSON.stringify({ error: 'Missing parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // accessKeyをクエリパラメータとヘッダー両方で送信
  const rakutenUrl = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401'
    + '?format=json'
    + '&formatVersion=2'
    + '&applicationId=' + encodeURIComponent(appid)
    + '&accessKey=' + encodeURIComponent(accessKey)
    + '&keyword=' + encodeURIComponent(jan)
    + '&hits=1';

  try {
    const res = await fetch(rakutenUrl, {
      headers: {
        'accessKey': accessKey,
        'Accept': 'application/json',
        'User-Agent': 'TK-STOCK/1.0'
      }
    });
    const text = await res.text();
    // エラー詳細をデバッグ用に付加
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
