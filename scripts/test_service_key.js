const k = process.argv[2];
if (!k) {
  console.error('Usage: node test_service_key.js <SERVICE_KEY>');
  process.exit(2);
}

const url = 'https://tehtbnwlaoyvtnnyplsm.supabase.co/rest/v1/test_messages?select=*';
(async () => {
  try {
    const r = await fetch(url, { method: 'GET', headers: { apikey: k, Authorization: 'Bearer ' + k } });
    console.log('STATUS', r.status);
    try { console.log('HEADERS', JSON.stringify(Object.fromEntries(r.headers))); } catch (e) {}
    const txt = await r.text();
    console.log('BODY', txt);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
