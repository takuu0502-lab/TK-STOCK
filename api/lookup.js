export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { jan, appid } = req.query;
  if (!jan || !appid) {
    return res.status(400).json({ error: 'jan and appid are required' });
  }

  try {
    // JANコードで検索
    const url1 = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${encodeURIComponent(appid)}&jan_code=${encodeURIComponent(jan)}&results=3`;
    const r1 = await fetch(url1);
    const d1 = await r1.json();
    if (d1.hits && d1.hits.length > 0) {
      return res.status(200).json({ name: d1.hits[0].name });
    }

    // キーワード検索でフォールバック
    const url2 = `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?appid=${encodeURIComponent(appid)}&query=${encodeURIComponent(jan)}&results=1`;
    const r2 = await fetch(url2);
    const d2 = await r2.json();
    if (d2.hits && d2.hits.length > 0) {
      return res.status(200).json({ name: d2.hits[0].name });
    }

    return res.status(200).json({ name: null });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
