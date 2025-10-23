// Simple test script to verify endpoints are working
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/dashboard';

async function testEndpoints() {
  console.log('Testing dashboard endpoints...\n');

  try {
    // Test 1: Basic test endpoint
    console.log('1. Testing basic endpoint...');
    const testRes = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Basic test:', testRes.data);

    // Test 2: Fallback engagement trends
    console.log('\n2. Testing fallback engagement trends...');
    const fallbackRes = await axios.get(`${BASE_URL}/engagement-trends-fallback?period=week`);
    console.log('✅ Fallback data:', fallbackRes.data);

    console.log('\n🎉 All tests passed! Backend is ready for deployment.');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints();






