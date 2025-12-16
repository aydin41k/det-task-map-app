import request from 'supertest';
import app from '../app';
import { sequelize } from '../database';
import axios from 'axios';

// Mock API
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Map App Backend API', () => {
  
  // Setup: In-memory DB
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  // Teardown
  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/geocode', () => {
    it('should return an address when given valid coordinates', async () => {

      mockedAxios.get.mockResolvedValue({
        data: { display_name: 'Mocked Address, Test City' }
      });

      const res = await request(app).get('/api/geocode?lat=10&lng=20');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('address', 'Mocked Address, Test City');
    });
  });

  describe('POST /api/location', () => {
    it('should save a new location and session', async () => {
      const payload = {
        session_uuid: 'test-session-1',
        lat: 50.0,
        lng: 10.0,
        address: '123 Test St'
      };

      const res = await request(app).post('/api/location').send(payload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entry).toHaveProperty('id');
      expect(res.body.entry.click_lat).toBe(50.0);
    });
  });

  describe('GET /api/history/:session_uuid', () => {
    it('should retrieve the history for the user', async () => {
      const res = await request(app).get('/api/history/test-session-1');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].address).toBe('123 Test St');
    });

    it('should return empty array for unknown session', async () => {
      const res = await request(app).get('/api/history/unknown-user');
      expect(res.body).toEqual([]);
    });
  });
});