const axios = require('axios').default;
axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true; // keep cookies across requests

(async () => {
  try {
    // 1️⃣ Signup
    const signup = await axios.post('/api/auth/signup', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Password123!'
    });
    console.log('✅ Signup:', signup.status, signup.data);

    // 2️⃣ Login (in case signup didn't set cookie)
    const login = await axios.post('/api/auth/login', {
      email: 'testuser@example.com',
      password: 'Password123!'
    });
    console.log('✅ Login:', login.status, login.data);

    // 3️⃣ Me – verify session cookie works
    const me = await axios.get('/api/auth/me');
    console.log('✅ Me:', me.status, me.data);

    // 4️⃣ Logout
    const logout = await axios.post('/api/auth/logout');
    console.log('✅ Logout:', logout.status, logout.data);
  } catch (err) {
    if (err.response) {
      console.error('❌ API error:', err.response.status, err.response.data);
    } else {
      console.error('❌ Request failed:', err.message);
    }
  }
})();
