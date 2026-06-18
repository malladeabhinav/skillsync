const axios = require('axios');

(async () => {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/signup', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!'
    }, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    console.log('Signup success:', response.data);
  } catch (err) {
    if (err.response) {
      console.error('Signup error response:', err.response.status, err.response.data);
    } else {
      console.error('Signup request failed:', err.message);
    }
  }
})();
