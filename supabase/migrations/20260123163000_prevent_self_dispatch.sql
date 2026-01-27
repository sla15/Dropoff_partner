-- Add profile_picture to drivers table
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create function to offline driver if they are the passenger
CREATE OR REPLACE FUNCTION offline_driver_on_ride_request()
RETURNS TRIGGER AS $$
BEGIN
  -- If the passenger (customer_id) exists in the drivers table, set them offline
  IF EXISTS (SELECT 1 FROM drivers WHERE id = NEW.customer_id) THEN
    UPDATE drivers SET is_online = false WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_ride_request_offline_driver ON rides;
CREATE TRIGGER on_ride_request_offline_driver
  AFTER INSERT ON rides
  FOR EACH ROW
  EXECUTE FUNCTION offline_driver_on_ride_request();
