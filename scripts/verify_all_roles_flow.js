// Verification script for testing 2-Card Ulangan & Ujian architecture across Siswa, Guru, and Admin
const http = require('http');

async function testEndpoint(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const dataStr = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(dataStr ? { 'Content-Length': Buffer.byteLength(dataStr) } : {}),
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(rawData) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: rawData });
          }
        });
      }
    );
    req.on('error', (e) => reject(e));
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

async function runVerification() {
  console.log('=== VERIFYING EXAM FLOW ARCHITECTURE ===\n');

  // 1. Verify token endpoint for Ulangan Matematika (MTK-ULG26)
  console.log('1. Testing Token Verification for MTK-ULG26...');
  try {
    const verifyRes = await testEndpoint('/api/siswa/ujian/verify-token', 'POST', {
      ujianId: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      token: 'MTK-ULG26',
    });
    console.log('Result:', verifyRes.status, verifyRes.data);
  } catch (err) {
    console.log('Verify Token Error:', err.message);
  }

  // 2. Verify invalid token rejection
  console.log('\n2. Testing Invalid Token Rejection...');
  try {
    const invalidRes = await testEndpoint('/api/siswa/ujian/verify-token', 'POST', {
      ujianId: 'e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      token: 'WRONG-TOKEN',
    });
    console.log('Result:', invalidRes.status, invalidRes.data);
  } catch (err) {
    console.log('Invalid Token Test Error:', err.message);
  }

  console.log('\n=== VERIFICATION FINISHED ===');
}

runVerification();
