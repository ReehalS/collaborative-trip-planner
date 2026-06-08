import { NextResponse } from 'next/server';

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

/** Map raw Google place types to human-readable labels. */
const placeTypeLabels: Record<string, string> = {
  accounting: 'Accounting',
  airport: 'Airport',
  amusement_park: 'Amusement Park',
  aquarium: 'Aquarium',
  art_gallery: 'Art Gallery',
  atm: 'ATM',
  bakery: 'Bakery',
  bank: 'Bank',
  bar: 'Bar',
  beauty_salon: 'Beauty Salon',
  bicycle_store: 'Bike Shop',
  book_store: 'Bookstore',
  bowling_alley: 'Bowling Alley',
  bus_station: 'Bus Station',
  cafe: 'Cafe',
  campground: 'Campground',
  car_dealer: 'Car Dealer',
  car_rental: 'Car Rental',
  car_repair: 'Auto Repair',
  car_wash: 'Car Wash',
  casino: 'Casino',
  cemetery: 'Cemetery',
  church: 'Church',
  city_hall: 'City Hall',
  clothing_store: 'Clothing Store',
  convenience_store: 'Convenience Store',
  courthouse: 'Courthouse',
  dentist: 'Dentist',
  department_store: 'Department Store',
  doctor: 'Doctor',
  drugstore: 'Pharmacy',
  electrician: 'Electrician',
  electronics_store: 'Electronics Store',
  embassy: 'Embassy',
  fire_station: 'Fire Station',
  florist: 'Florist',
  funeral_home: 'Funeral Home',
  furniture_store: 'Furniture Store',
  gas_station: 'Gas Station',
  gym: 'Gym',
  hair_care: 'Hair Salon',
  hardware_store: 'Hardware Store',
  hindu_temple: 'Hindu Temple',
  home_goods_store: 'Home Goods',
  hospital: 'Hospital',
  insurance_agency: 'Insurance',
  jewelry_store: 'Jewelry Store',
  laundry: 'Laundry',
  lawyer: 'Lawyer',
  library: 'Library',
  light_rail_station: 'Light Rail',
  liquor_store: 'Liquor Store',
  local_government_office: 'Government Office',
  locksmith: 'Locksmith',
  lodging: 'Lodging',
  meal_delivery: 'Meal Delivery',
  meal_takeaway: 'Takeaway',
  mosque: 'Mosque',
  movie_rental: 'Movie Rental',
  movie_theater: 'Movie Theater',
  moving_company: 'Moving Company',
  museum: 'Museum',
  natural_feature: 'Natural Feature',
  night_club: 'Night Club',
  painter: 'Painter',
  park: 'Park',
  parking: 'Parking',
  pet_store: 'Pet Store',
  pharmacy: 'Pharmacy',
  physiotherapist: 'Physiotherapist',
  plumber: 'Plumber',
  police: 'Police Station',
  post_office: 'Post Office',
  primary_school: 'School',
  real_estate_agency: 'Real Estate',
  restaurant: 'Restaurant',
  roofing_contractor: 'Roofing',
  rv_park: 'RV Park',
  school: 'School',
  secondary_school: 'School',
  shoe_store: 'Shoe Store',
  shopping_mall: 'Shopping Mall',
  spa: 'Spa',
  stadium: 'Stadium',
  storage: 'Storage',
  store: 'Store',
  subway_station: 'Subway Station',
  supermarket: 'Supermarket',
  synagogue: 'Synagogue',
  taxi_stand: 'Taxi Stand',
  tourist_attraction: 'Tourist Attraction',
  train_station: 'Train Station',
  transit_station: 'Transit Station',
  travel_agency: 'Travel Agency',
  university: 'University',
  veterinary_care: 'Veterinary',
  zoo: 'Zoo',
};

/**
 * Generic types returned by Google that don't add useful info.
 * These are filtered out so only meaningful labels remain.
 */
const ignoredTypes = new Set([
  'establishment',
  'point_of_interest',
  'premise',
  'subpremise',
  'route',
  'street_address',
  'street_number',
  'floor',
  'room',
  'post_box',
  'postal_code',
  'postal_code_prefix',
  'postal_code_suffix',
  'postal_town',
  'intersection',
  'neighborhood',
  'locality',
  'sublocality',
  'sublocality_level_1',
  'sublocality_level_2',
  'sublocality_level_3',
  'sublocality_level_4',
  'sublocality_level_5',
  'administrative_area_level_1',
  'administrative_area_level_2',
  'administrative_area_level_3',
  'administrative_area_level_4',
  'administrative_area_level_5',
  'country',
  'continent',
  'geocode',
  'political',
  'colloquial_area',
  'plus_code',
  'food',
  'health',
  'general_contractor',
  'place_of_worship',
  'finance',
]);

function humanizeCategories(types: string[]): string[] {
  const labels: string[] = [];
  for (const t of types) {
    if (ignoredTypes.has(t)) continue;
    const label = placeTypeLabels[t];
    if (label) {
      labels.push(label);
    } else {
      // Fallback: convert snake_case to Title Case
      labels.push(
        t
          .split('_')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      );
    }
  }
  return labels;
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const addressComponents = data.results[0].address_components;

      const countryComponent = addressComponents.find(
        (comp: AddressComponent) => comp.types.includes('country')
      );
      const cityComponent =
        addressComponents.find((comp: AddressComponent) =>
          comp.types.includes('locality')
        ) ||
        addressComponents.find((comp: AddressComponent) =>
          comp.types.includes('administrative_area_level_2')
        ) ||
        addressComponents.find((comp: AddressComponent) =>
          comp.types.includes('administrative_area_level_1')
        );

      return NextResponse.json({
        latitude: location.lat,
        longitude: location.lng,
        country: countryComponent?.long_name || '',
        city: cityComponent?.long_name || '',
        address: data.results[0].formatted_address,
        categories: humanizeCategories(data.results[0].types || []),
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch geocode data' },
        { status: 400 }
      );
    }
  } catch (err) {
    console.error('Error fetching geocode:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
