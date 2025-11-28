(async () => {
  try {
    const res = await fetch('http://localhost:4000/api/anime/search?q=naruto&limit=3');
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Fetch failed', e);
    process.exitCode = 1;
  }
})();
