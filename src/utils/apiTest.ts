// API Connection Test Script
// Run this in the browser console or as a test file

const API_BASE_URL = 'http://localhost:8000';

async function testApiConnection() {
  console.log('Testing API connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test root endpoint
    const rootResponse = await fetch(`${API_BASE_URL}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData);
    
    // Test projects endpoint
    const projectsResponse = await fetch(`${API_BASE_URL}/api/projects`);
    const projectsData = await projectsResponse.json();
    console.log('✅ Projects endpoint:', projectsData);
    
    console.log('🎉 All API tests passed!');
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error);
    return false;
  }
}

// Test authentication flow
async function testAuthFlow() {
  console.log('Testing authentication flow...');
  
  try {
    // Test signup
    const signupResponse = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpassword123',
        fullName: 'Test User'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('✅ Signup test:', signupData);
    
    // Test login
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'testuser',
        password: 'testpassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login test:', loginData);
    
    if (loginData.success && loginData.data.access_token) {
      const token = loginData.data.access_token;
      
      // Test authenticated endpoint
      const profileResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const profileData = await profileResponse.json();
      console.log('✅ Profile test:', profileData);
    }
    
    console.log('🎉 Authentication flow test completed!');
    return true;
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    return false;
  }
}

// Export functions for use
if (typeof window !== 'undefined') {
  window.testApiConnection = testApiConnection;
  window.testAuthFlow = testAuthFlow;
}

// Auto-run tests if in browser
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('🚀 Running API tests automatically...');
  testApiConnection().then(() => {
    console.log('📝 To test authentication, run: testAuthFlow()');
  });
}
