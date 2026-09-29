const http = require('http');

http.get('http://localhost:3000/bab/5f649043-e4b7-4d11-a353-991b07a77d5c', (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Location:', res.headers.location);
}).on('error', err => console.error('Error:', err.message));
