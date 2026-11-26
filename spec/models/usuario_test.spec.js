const mongoose = require('mongoose');
const Usuario = require('../../models/usuario');

describe('Testing Usuario.findOneOrCreateByGoogle', function() {
  beforeAll(async function() {
    const mongoDB = 'mongodb://127.0.0.1:27017/test_ecotransporte_prod';
    await mongoose.connect(mongoDB);
  });

  afterEach(async function() {
    await Usuario.deleteMany({});
  });

  afterAll(async function() {
    await mongoose.connection.close();
  });

  it('crea un usuario nuevo cuando no existe en Google OAuth', async function() {
    const mockGoogleProfile = {
      id: 'google-123456789',
      displayName: 'Cristobal Pavon',
      emails: [{ value: 'cristobal.test@gmail.com' }]
    };

    const user = await Usuario.findOneOrCreateByGoogle(mockGoogleProfile);
    expect(user).toBeDefined();
    expect(user.googleId).toBe('google-123456789');
    expect(user.email).toBe('cristobal.test@gmail.com');
    expect(user.verificado).toBe(true);
  });
});
