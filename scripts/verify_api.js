
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testEndpoint(name, url) {
    try {
        const res = await fetch(`${BASE_URL}${url}`);
        const data = await res.json();

        if (res.status === 200 && data.success) {
            console.log(`✅ [PASS] ${name} (${url})`);
        } else {
            console.error(`❌ [FAIL] ${name} (${url}) - Status: ${res.status}, Error: ${data.error || 'Unknown'}`);
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(`❌ [FAIL] ${name} (${url}) - Network Error: ${error.message}`);
        process.exitCode = 1;
    }
}

async function runTests() {
    console.log('🚀 Starting API Verification...');

    // Give server a moment to start if running in parallel
    await new Promise(resolve => setTimeout(resolve, 2000));

    await testEndpoint('Categories', '/categories');
    await testEndpoint('Market Items', '/market-items');
    await testEndpoint('Jobs', '/jobs');
    await testEndpoint('Community Posts', '/community-posts');
    await testEndpoint('Guides', '/guides');

    console.log('✨ Verification Complete');
}

runTests();
