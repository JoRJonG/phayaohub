// Native fetch is available in Node.js 18+


const BASE_URL = 'http://localhost:3001/api/user/jobs'; // Protected route

async function testAuth(name, headers) {
    try {
        const response = await fetch(BASE_URL, { headers });
        const data = await response.json();
        console.log(`[${name}] Status: ${response.status}, Error: ${data.error}`);
    } catch (error) {
        console.error(`[${name}] Failed:`, error.message);
    }
}

async function run() {
    console.log('Testing Auth Middleware...');

    // 1. No Header
    await testAuth('No Header', {});

    // 2. Bearer null
    await testAuth('Bearer null', { 'Authorization': 'Bearer null' });

    // 3. Bearer undefined
    await testAuth('Bearer undefined', { 'Authorization': 'Bearer undefined' });

    // 4. Invalid Token
    await testAuth('Invalid Token', { 'Authorization': 'Bearer invalidtoken' });

    // 5. Empty Bearer
    await testAuth('Empty Bearer', { 'Authorization': 'Bearer ' });
}

run();
