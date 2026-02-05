const request = require('supertest');

async function registerUser(app, overrides = {}) {
  const payload = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    ...overrides
  };

  const response = await request(app).post('/auth/register').send(payload);
  return response;
}

async function loginUser(app, overrides = {}) {
  const payload = {
    email: 'test@example.com',
    password: 'Password123!',
    ...overrides
  };

  const response = await request(app).post('/auth/login').send(payload);
  return response;
}

async function getAuthToken(app) {
  await registerUser(app);
  const loginResponse = await loginUser(app);
  return loginResponse.body.token;
}

module.exports = { registerUser, loginUser, getAuthToken };
