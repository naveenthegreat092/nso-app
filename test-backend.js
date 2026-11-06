import http from 'http';
http.get('http://localhost:5000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('BACKEND OK:', data.substring(0, 150)));
}).on('error', (e) => console.log('BACKEND ERROR:', e.message));
