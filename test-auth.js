#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests candidate and HR login/registration flows
 */

const API_BASE_URL = 'http://localhost:5000/api';

// Test credentials
const testCandidate = {
    name: 'Test Candidate',
    email: 'testcandidate@example.com',
    password: 'Test1234',
    role: 'candidate'
};

const testHR = {
    name: 'Test HR Manager',
    email: 'testhr@example.com',
    password: 'Test1234',
    role: 'hr',
    companyName: 'Test Company Inc.'
};

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(endpoint, method = 'POST', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        return {
            status: response.status,
            data
        };
    } catch (error) {
        return {
            status: 0,
            error: error.message
        };
    }
}

async function testCandidateRegistration() {
    log('\n📝 Testing Candidate Registration...', 'cyan');

    const result = await makeRequest('/auth/register', 'POST', testCandidate);

    if (result.status === 201 && result.data.success) {
        log('✅ Candidate registration successful', 'green');
        return { success: true, token: result.data.data.accessToken };
    } else if (result.status === 409) {
        log('⚠️  User already exists (expected if running multiple times)', 'yellow');
        return { success: false, userExists: true };
    } else {
        log(`❌ Candidate registration failed: ${result.data?.message || result.error || 'Unknown error'}`, 'red');
        console.log('Response:', result.data || result);
        return { success: false };
    }
}

async function testHRRegistration() {
    log('\n📝 Testing HR Registration...', 'cyan');

    const result = await makeRequest('/auth/register', 'POST', testHR);

    if (result.status === 201 && result.data.success) {
        log('✅ HR registration successful', 'green');
        return { success: true, token: result.data.data.accessToken };
    } else if (result.status === 409) {
        log('⚠️  User already exists (expected if running multiple times)', 'yellow');
        return { success: false, userExists: true };
    } else {
        log(`❌ HR registration failed: ${result.data?.message || result.error || 'Unknown error'}`, 'red');
        console.log('Response:', result.data || result);
        return { success: false };
    }
}

async function testCandidateLogin() {
    log('\n🔐 Testing Candidate Login...', 'cyan');

    const result = await makeRequest('/auth/login', 'POST', {
        email: testCandidate.email,
        password: testCandidate.password
    });

    if (result.status === 200 && result.data.success) {
        log('✅ Candidate login successful', 'green');
        return { success: true, token: result.data.data.accessToken };
    } else {
        log(`❌ Candidate login failed: ${result.data?.message || result.error || 'Unknown error'}`, 'red');
        console.log('Response:', result.data || result);
        return { success: false };
    }
}

async function testHRLogin() {
    log('\n🔐 Testing HR Login...', 'cyan');

    const result = await makeRequest('/auth/login', 'POST', {
        email: testHR.email,
        password: testHR.password
    });

    if (result.status === 200 && result.data.success) {
        log('✅ HR login successful', 'green');
        return { success: true, token: result.data.data.accessToken };
    } else {
        log(`❌ HR login failed: ${result.data?.message || result.error || 'Unknown error'}`, 'red');
        console.log('Response:', result.data || result);
        return { success: false };
    }
}

async function testDuplicateRegistration() {
    log('\n🔄 Testing Duplicate Registration Error...', 'cyan');

    const result = await makeRequest('/auth/register', 'POST', testCandidate);

    if (result.status === 409 && result.data.message === 'User with this email already exists') {
        log('✅ Duplicate registration handled correctly', 'green');
        log(`   Message: "${result.data.message}"`, 'green');
        return { success: true };
    } else {
        log(`❌ Duplicate registration not handled correctly`, 'red');
        console.log('Expected status 409 with message "User with this email already exists"');
        console.log('Received:', result);
        return { success: false };
    }
}

async function testEmailCaseInsensitivity() {
    log('\n📧 Testing Email Case Insensitivity...', 'cyan');

    // Try to login with different case
    const result = await makeRequest('/auth/login', 'POST', {
        email: testCandidate.email.toUpperCase(),
        password: testCandidate.password
    });

    if (result.status === 200 && result.data.success) {
        log('✅ Email case insensitivity working correctly', 'green');
        return { success: true };
    } else {
        log(`❌ Email case sensitivity issue`, 'red');
        console.log('Response:', result.data || result);
        return { success: false };
    }
}

async function runTests() {
    log('\n========================================', 'blue');
    log('🧪 AUTHENTICATION TESTS', 'blue');
    log('========================================', 'blue');
    log(`\nAPI Base URL: ${API_BASE_URL}`, 'blue');

    const results = {
        candidateRegistration: false,
        hrRegistration: false,
        candidateLogin: false,
        hrLogin: false,
        duplicateError: false,
        caseInsensitivity: false
    };

    // Test 1: Candidate Registration
    const candidateReg = await testCandidateRegistration();
    results.candidateRegistration = candidateReg.success || candidateReg.userExists;

    // Test 2: HR Registration
    const hrReg = await testHRRegistration();
    results.hrRegistration = hrReg.success || hrReg.userExists;

    // Test 3: Candidate Login (should work whether new or existing)
    const candidateLogin = await testCandidateLogin();
    results.candidateLogin = candidateLogin.success;

    // Test 4: HR Login (should work whether new or existing)
    const hrLogin = await testHRLogin();
    results.hrLogin = hrLogin.success;

    // Test 5: Duplicate Registration Error
    const duplicateTest = await testDuplicateRegistration();
    results.duplicateError = duplicateTest.success;

    // Test 6: Email Case Insensitivity
    const caseTest = await testEmailCaseInsensitivity();
    results.caseInsensitivity = caseTest.success;

    // Summary
    log('\n========================================', 'blue');
    log('📊 TEST RESULTS SUMMARY', 'blue');
    log('========================================', 'blue');

    const tests = [
        { name: 'Candidate Registration', result: results.candidateRegistration },
        { name: 'HR Registration', result: results.hrRegistration },
        { name: 'Candidate Login', result: results.candidateLogin },
        { name: 'HR Login', result: results.hrLogin },
        { name: 'Duplicate Error Message', result: results.duplicateError },
        { name: 'Email Case Insensitivity', result: results.caseInsensitivity }
    ];

    let passedCount = 0;
    tests.forEach(test => {
        const status = test.result ? '✅ PASS' : '❌ FAIL';
        const color = test.result ? 'green' : 'red';
        log(`${status} - ${test.name}`, color);
        if (test.result) passedCount++;
    });

    log('\n========================================', 'blue');
    log(`Total: ${passedCount}/${tests.length} tests passed`, passedCount === tests.length ? 'green' : 'yellow');
    log('========================================\n', 'blue');

    process.exit(passedCount === tests.length ? 0 : 1);
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
    log('❌ This script requires Node.js 18+ (for native fetch)', 'red');
    log('Please upgrade Node.js or install node-fetch', 'yellow');
    process.exit(1);
}

// Run tests
runTests().catch(error => {
    log(`\n❌ Test suite failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
});
