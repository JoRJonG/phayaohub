
const BASE_URL = 'http://localhost:3001/api';

async function testEndpoint(name, url) {
    console.log(`\n--- Testing ${name} (${url}) ---`);
    try {
        const res = await fetch(`${BASE_URL}${url}`);
        console.log(`Status: ${res.status}`);

        const text = await res.text();
        console.log(`Raw Body Preview: ${text.substring(0, 500)}`);

        try {
            const data = JSON.parse(text);
            if (res.status === 200 && data.success) {
                console.log(`✅ [PASS]`);
            } else {
                console.error(`❌ [FAIL] API Error: ${data.error || 'Unknown'}`);
            }
        } catch (e) {
            console.error(`❌ [FAIL] Non-JSON Response: ${e.message}`);
        }

    } catch (error) {
        console.error(`❌ [FAIL] Network Error: ${error.message}`);
    }
}

async function runTests() {
    console.log('🚀 Starting Deep Debug...');

    // Give server a moment to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test a simple one first
    await testEndpoint('Categories', '/categories');
    // Test the failing settings one
    await testEndpoint('Settings Hero', '/settings/hero-bg');
    // Test others
    await testEndpoint('Jobs', '/jobs?limit=1');
}

runTests();
