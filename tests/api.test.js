const axios = require('axios');

const PYTHON_URL = 'http://localhost:8000';
const EXPRESS_URL = 'http://localhost:5000';

async function testFastAPIRisk() {
  console.log('Testing Python FastAPI Risk Engine...');
  try {
    const payload = {
      zone: 'Zone B',
      sensor_data: {
        gas: 85.5,
        temperature: 78.2,
        pressure: 135.0,
        humidity: 50.0,
        smoke: 12.0
      },
      context_data: {
        worker_nearby: true,
        maintenance_active: true,
        permit_active: true,
        incident_history_count: 2
      }
    };
    
    const res = await axios.post(`${PYTHON_URL}/api/v1/risk/predict`, payload);
    console.log('Python Service Response:');
    console.log(JSON.stringify(res.data, null, 2));
    if (res.data.risk_score > 75) {
      console.log('✅ Python Risk calculation verification SUCCESSFUL');
    } else {
      console.log('❌ Unexpected risk calculation values');
    }
  } catch (err) {
    console.error('❌ Python Risk Service check failed:', err.message);
    console.log('Is the Python FastAPI server running on port 8000?');
  }
}

async function testExpressServer() {
  console.log('\nTesting Express API Server health...');
  try {
    const res = await axios.get(`${EXPRESS_URL}/`);
    console.log('Express health check response:', res.data);
    if (res.data.status === 'online') {
      console.log('✅ Express Server verification SUCCESSFUL');
    } else {
      console.log('❌ Express server returned offline status');
    }
  } catch (err) {
    console.error('❌ Express Server check failed:', err.message);
    console.log('Is the Express server running on port 5000?');
  }
}

async function runTests() {
  console.log('--- SENTINEL AI INTEGRATION TEST SUITE ---');
  await testFastAPIRisk();
  await testExpressServer();
}

runTests();
