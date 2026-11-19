export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const sheetUrl = 'https://docs.google.com/spreadsheets/d/1q2fZWkLrFs9qF3TquXQAN5ByWwSm7YNaMMyaewPDbQI/export?format=csv&gid=1565745828';
  try {
    const response = await fetch(sheetUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Google Sheet returned ${response.status}`);
    const csv = await response.text();
    res.status(200).json({ csv, fetchedAt: new Date().toISOString() });
  } catch (error) {
    res.status(502).json({ error: 'Unable to fetch live stock sheet', details: error.message });
  }
}
