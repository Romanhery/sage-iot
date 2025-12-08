-- =====================================================
-- SEED DATA: Plant Presets for Popular Plants Carousel
-- =====================================================

INSERT INTO public.plant_presets (species_name, common_name, ideal_moisture_min, ideal_moisture_max, ideal_temp_min, ideal_temp_max, ideal_light_hours, image_url, description, care_tips)
VALUES 
  (
    'Ocimum basilicum',
    'Basil',
    40,
    60,
    18.0,
    28.0,
    6,
    'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=400',
    'A fragrant culinary herb perfect for kitchens. Easy to grow and harvest.',
    'Water when top inch of soil is dry. Pinch off flower buds to encourage leaf growth.'
  ),
  (
    'Solanum lycopersicum',
    'Tomato',
    50,
    70,
    18.0,
    30.0,
    8,
    'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400',
    'Popular garden vegetable. Produces fruit throughout the growing season.',
    'Requires consistent watering. Stake or cage plants for support.'
  ),
  (
    'Mentha',
    'Mint',
    50,
    75,
    15.0,
    25.0,
    4,
    'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400',
    'Vigorous aromatic herb. Great for teas and cocktails.',
    'Keep soil moist. Can be invasive - best in containers.'
  ),
  (
    'Monstera deliciosa',
    'Monstera',
    40,
    60,
    18.0,
    28.0,
    6,
    'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400',
    'Iconic tropical houseplant with distinctive split leaves.',
    'Allow soil to dry slightly between waterings. Provide indirect light.'
  ),
  (
    'Sansevieria trifasciata',
    'Snake Plant',
    20,
    40,
    15.0,
    30.0,
    4,
    'https://images.unsplash.com/photo-1593482892290-f54927ae2966?w=400',
    'Nearly indestructible houseplant. Excellent air purifier.',
    'Very drought tolerant. Water sparingly, especially in winter.'
  ),
  (
    'Epipremnum aureum',
    'Pothos',
    40,
    60,
    18.0,
    30.0,
    4,
    'https://images.unsplash.com/photo-1654343849969-f0f1e7d6f7fa?w=400',
    'Easy-care trailing vine. Perfect for beginners.',
    'Tolerates low light. Let soil dry between waterings.'
  ),
  (
    'Capsicum annuum',
    'Bell Pepper',
    50,
    70,
    20.0,
    32.0,
    8,
    'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
    'Colorful vegetable garden staple. Sweet and crunchy.',
    'Needs warm conditions. Water consistently for best fruit production.'
  ),
  (
    'Lactuca sativa',
    'Lettuce',
    60,
    80,
    10.0,
    22.0,
    6,
    'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
    'Fast-growing salad green. Perfect for indoor gardens.',
    'Keep soil consistently moist. Prefers cooler temperatures.'
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- SAMPLE DATA: Demo Plants (Optional)
-- =====================================================

-- Only insert if no plants exist
INSERT INTO public.plants (name, plant_type, device_id, location, target_moisture, target_light_hours)
SELECT 'Monstera Deliciosa', 'Monstera', 'ESP32_001', 'Living Room', 50, 6
WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE device_id = 'ESP32_001');

INSERT INTO public.plants (name, plant_type, device_id, location, target_moisture, target_light_hours)
SELECT 'Kitchen Basil', 'Basil', 'ESP32_002', 'Kitchen', 55, 8
WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE device_id = 'ESP32_002');

INSERT INTO public.plants (name, plant_type, device_id, location, target_moisture, target_light_hours)
SELECT 'Office Snake Plant', 'Snake Plant', 'ESP32_003', 'Office', 30, 4
WHERE NOT EXISTS (SELECT 1 FROM public.plants WHERE device_id = 'ESP32_003');

-- Create control states for new plants
INSERT INTO public.control_states (plant_id, water_pump_on, fan_on, grow_light_on)
SELECT id, false, false, false FROM public.plants
WHERE id NOT IN (SELECT plant_id FROM public.control_states);

-- Generate sample sensor readings for the last 24 hours (if none exist)
INSERT INTO public.sensor_readings (plant_id, temperature, humidity, soil_moisture, light_level, water_level, timestamp)
SELECT 
  p.id,
  20 + (random() * 10)::numeric(4,1),
  40 + (random() * 40)::numeric(4,1),
  30 + (random() * 50)::numeric(4,1),
  200 + (random() * 800)::numeric(6,1),
  70 + (random() * 30)::numeric(4,1),
  NOW() - (i || ' minutes')::interval
FROM public.plants p
CROSS JOIN generate_series(0, 1440, 15) AS i
WHERE NOT EXISTS (SELECT 1 FROM public.sensor_readings WHERE plant_id = p.id);
