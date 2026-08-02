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

  const rakutenUrl = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401'
    + '?format=json'
    + '&formatVersion=2'
    + '&applicationId=' + encodeURIComponent(appid)
    + '&keyword=' + encodeURIComponent(jan)
    + '&hits=1';

  try {
    const res = await fetch(rakutenUrl, {
      headers: {
        'accessKey': accessKey,
        'Accept': 'application/json'
      }
    });
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
