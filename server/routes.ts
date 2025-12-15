import { Router, Request, Response } from 'express';
import axios from 'axios';
import { User, Location, UserLocation } from './database';

const router = Router();

interface SaveLocationRequest {
  session_uuid: string;
  lat: number;
  lng: number;
  address: string;
}

// Convert lat/lng to address
router.get('/geocode', async (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    const response = await axios.get(url, {
      headers: { 'User-Agent': 'MapApp-MoE-Aydin/1.0' }
    });
    
    res.json({ address: response.data.display_name });
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: 'Failed to fetch address' });
  }
});

// Save a location and link to a user
router.post('/location', async (req: Request, res: Response) => {
  const { session_uuid, lat, lng, address } = req.body as SaveLocationRequest;
  
  if (!session_uuid || !lat || !lng || !address) {
    res.status(400).json({ error: 'Missing fields' });
    return;
  }

  try {
    const [user] = await User.findOrCreate({ where: { session_uuid } });

    const [location] = await Location.findOrCreate({
      where: { address },
      defaults: { 
        address,
        canonical_lat: lat, 
        canonical_lng: lng 
      }
    });

    const entry = await UserLocation.create({
      UserId: user.id,
      LocationId: location.id,
      click_lat: lat,
      click_lng: lng
    });

    res.json({ success: true, entry });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Fetch history
router.get('/history/:session_uuid', async (req: Request, res: Response) => {
  const { session_uuid } = req.params;

  try {
    const user = await User.findOne({ 
      where: { session_uuid },
      include: [{
        model: UserLocation,
        include: [Location]
      }],
      order: [[UserLocation, 'createdAt', 'DESC']]
    });

    if (!user) {
      res.json([]);
      return;
    }

    // "any" casting used here briefly because Sequelize associations 
    // can be tricky to type perfectly without extensive boilerplate.
    const history = (user as any).UserLocations.map((ul: any) => ({
      id: ul.id,
      address: ul.Location.address,
      date: ul.createdAt,
      lat: ul.click_lat,
      lng: ul.click_lng
    }));

    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Fetch error' });
  }
});

export default router;