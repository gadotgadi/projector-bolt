import { createServer } from './index.js';

async function testLogin() {
  try {
    const app = await createServer();
    
    // Start server on port 3001 for testing
    const server = app.listen(3001, () => {
      console.log('Test server running on port 3001');
      
      // Test login endpoint
      fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId: '1001',
          password: '123456'
        })
      })
      .then(response => {
        console.log('Response status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Response body:', text);
        server.close();
        process.exit(0);
      })
      .catch(error => {
        console.error('Login test failed:', error);
        server.close();
        process.exit(1);
      });
    });
  } catch (error) {
    console.error('Server creation failed:', error);
    process.exit(1);
  }
}

testLogin();