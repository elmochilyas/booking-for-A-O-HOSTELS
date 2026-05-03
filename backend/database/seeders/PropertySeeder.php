<?php

namespace Database\Seeders;

use App\Models\Property;
use App\Models\RoomType;
use App\Models\Room;
use App\Models\Amenity;
use App\Models\Extra;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PropertySeeder extends Seeder
{
    private const BASE_DORM    = 19.00;
    private const BASE_FEMALE  = 22.00;
    private const BASE_PRIVATE = 49.00;
    private const BASE_TRIPLE  = 75.00;
    private const BASE_FAMILY  = 105.00;

    private const PRICE_TIERS = [
        'London'    => 1.85,
        'Amsterdam' => 1.55,
        'Vienna'    => 1.30,
        'Salzburg'  => 1.30,
        'Munich'    => 1.25,
        'Frankfurt' => 1.20,
        'Hamburg'   => 1.20,
        'Berlin'    => 1.20,
        'Cologne'   => 1.15,
        'Düsseldorf'=> 1.15,
        'Edinburgh' => 1.25,
        'Brighton'  => 1.20,
        'Manchester'=> 1.15,
        'Milan'     => 1.25,
        'Florence'  => 1.20,
        'Venice'    => 1.35,
        'Brussels'  => 1.15,
        'Antwerp'   => 1.10,
        'Copenhagen'=> 1.40,
        'Prague'    => 0.80,
        'Budapest'  => 0.80,
        'Warsaw'    => 0.75,
    ];

    private const CITY_IMAGES = [
        'Berlin'     => 'https://cdn.aohostels.com/img/cities/webp/3.webp',
        'Hamburg'    => 'https://cdn.aohostels.com/img/cities/webp/5.webp',
        'Munich'     => 'https://cdn.aohostels.com/img/cities/webp/10.webp',
        'Vienna'     => 'https://cdn.aohostels.com/img/cities/webp/13.webp',
        'Prague'     => 'https://cdn.aohostels.com/img/cities/webp/7.webp',
        'Amsterdam'  => 'https://cdn.aohostels.com/img/cities/webp/1.webp',
        'London'     => 'https://cdn.aohostels.com/img/cities/webp/32.webp',
        'Cologne'    => 'https://cdn.aohostels.com/img/cities/webp/19.webp',
        'Salzburg'   => 'https://cdn.aohostels.com/img/cities/webp/20.webp',
        'Budapest'   => 'https://cdn.aohostels.com/img/cities/webp/24.webp',
        'Copenhagen' => 'https://cdn.aohostels.com/img/cities/webp/8.webp',
        'Edinburgh'  => 'https://cdn.aohostels.com/img/cities/webp/25.webp',
        'Brighton'   => 'https://cdn.aohostels.com/img/cities/webp/28.webp',
        'Brussels'   => 'https://cdn.aohostels.com/img/cities/webp/30.webp',
        'Florence'   => 'https://cdn.aohostels.com/img/cities/webp/27.webp',
        'Milan'      => 'https://cdn.aohostels.com/img/cities/webp/31.webp',
        'Venice'     => 'https://cdn.aohostels.com/img/cities/webp/12.webp',
        'Frankfurt'  => 'https://cdn.aohostels.com/img/cities/webp/17.webp',
        'Leipzig'    => 'https://cdn.aohostels.com/img/cities/webp/16.webp',
        'Aachen'     => 'https://cdn.aohostels.com/img/cities/webp/1.webp',
        'Antwerp'    => 'https://cdn.aohostels.com/img/cities/webp/29.webp',
        'Bremen'     => 'https://cdn.aohostels.com/img/cities/webp/4.webp',
        'Dortmund'   => 'https://cdn.aohostels.com/img/cities/webp/15.webp',
        'Dresden'    => 'https://cdn.aohostels.com/img/cities/webp/9.webp',
        'Düsseldorf' => 'https://cdn.aohostels.com/img/cities/webp/14.webp',
        'Graz'       => 'https://cdn.aohostels.com/img/cities/webp/6.webp',
        'Nuremberg'  => 'https://cdn.aohostels.com/img/cities/webp/21.webp',
        'Rotterdam'   => 'https://cdn.aohostels.com/img/cities/webp/26.webp',
        'Stuttgart'   => 'https://cdn.aohostels.com/img/cities/webp/11.webp',
        'Weimar'      => 'https://cdn.aohostels.com/img/cities/webp/22.webp',
        'Warsaw'      => 'https://cdn.aohostels.com/img/cities/webp/23.webp',
    ];

    private const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800';

    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        Extra::truncate();
        Amenity::truncate();
        DB::table('room_types')->truncate();
        Property::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $properties = $this->propertyData();

        foreach ($properties as $data) {
            $propertyId = Str::uuid()->toString();
            $city = $data['location'];
            $tier = self::PRICE_TIERS[$city] ?? 1.0;

            Property::create([
                'id'             => $propertyId,
                'name'           => $data['name'],
                'location'       => $city,
                'address'        => $data['address'],
                'latitude'       => $data['latitude'],
                'longitude'      => $data['longitude'],
                'check_in_time'  => '15:00:00',
                'check_out_time' => '10:00:00',
                'total_rooms'    => $data['rooms'] ?? rand(60, 120),
                'description'    => $data['description'],
                'phone'          => $data['phone'],
                'email'          => $data['email'],
                'images'         => json_encode([[
                    'url' => self::CITY_IMAGES[$city] ?? self::FALLBACK_IMAGE,
                    'alt' => $data['name'],
                ]]),
                'rating'         => $data['rating'],
                'review_count'   => $data['review_count'],
            ]);

            $this->seedRoomTypes($propertyId, $tier);
            $this->seedAmenities($propertyId);
            $this->seedExtras($propertyId);
        }
    }

    private function seedRoomTypes(string $propertyId, float $tier): void
    {
        $types = [
            ['name' => 'Mixed Dorm (8-bed)', 'capacity' => 8, 'base_price' => round(self::BASE_DORM * $tier, 2), 'description' => 'Budget-friendly shared dormitory with 8 beds, lockers and reading lights.'],
            ['name' => 'Female-Only Dorm (8-bed)', 'capacity' => 8, 'base_price' => round(self::BASE_FEMALE * $tier, 2), 'description' => 'Women-only shared dorm with 8 beds, en-suite bathroom and extra security.'],
            ['name' => 'Private Twin/Double', 'capacity' => 2, 'base_price' => round(self::BASE_PRIVATE * $tier, 2), 'description' => 'Private room with double bed or two single beds — perfect for couples or friends.'],
            ['name' => 'Family Room', 'capacity' => 4, 'base_price' => round(self::BASE_FAMILY * $tier, 2), 'description' => 'Spacious family room with double bed and bunk beds, accommodates up to 4.'],
        ];

        foreach ($types as $type) {
            RoomType::create([
                'id'           => Str::uuid()->toString(),
                'property_id'  => $propertyId,
                'name'         => $type['name'],
                'description'  => $type['description'],
                'capacity'     => $type['capacity'],
                'max_occupancy'=> $type['capacity'],
                'base_price'   => $type['base_price'],
                'amenities'    => json_encode(['Free WiFi', 'Lockers', 'Reading Light', 'Power Outlet']),
            ]);
        }
    }

    private function seedAmenities(string $propertyId): void
    {
        $amenities = [
            ['name' => 'Free WiFi', 'category' => 'internet', 'icon' => 'wifi', 'is_free' => true],
            ['name' => '24-hour Reception', 'category' => 'service', 'icon' => 'clock', 'is_free' => true],
            ['name' => 'Bar & Lounge', 'category' => 'food', 'icon' => 'coffee', 'is_free' => false],
            ['name' => 'Breakfast Buffet', 'category' => 'food', 'icon' => 'coffee', 'is_free' => false],
            ['name' => 'Shared Kitchen', 'category' => 'kitchen', 'icon' => 'utensils', 'is_free' => true],
            ['name' => 'Luggage Storage', 'category' => 'service', 'icon' => 'suitcase', 'is_free' => true],
            ['name' => 'Laundry Facilities', 'category' => 'service', 'icon' => 'shirt', 'is_free' => false],
            ['name' => 'Bicycle Rental', 'category' => 'rental', 'icon' => 'bike', 'is_free' => false],
            ['name' => 'Parking', 'category' => 'parking', 'icon' => 'car', 'is_free' => false],
            ['name' => 'Games & TV Room', 'category' => 'entertainment', 'icon' => 'tv', 'is_free' => true],
        ];

        foreach ($amenities as $amenity) {
            Amenity::create([
                'id'          => Str::uuid()->toString(),
                'property_id' => $propertyId,
                'name'        => $amenity['name'],
                'category'    => $amenity['category'],
                'icon'        => $amenity['icon'],
                'is_free'     => $amenity['is_free'],
            ]);
        }
    }

    private function seedExtras(string $propertyId): void
    {
        $extras = [
            ['name' => 'Towel Rental', 'price' => 2.50, 'price_type' => 'per_stay'],
            ['name' => 'Breakfast Buffet', 'price' => 8.50, 'price_type' => 'per_person'],
            ['name' => 'Parking', 'price' => 12.00, 'price_type' => 'per_night'],
            ['name' => 'Bicycle Rental', 'price' => 8.00, 'price_type' => 'per_night'],
            ['name' => 'Late Check-out', 'price' => 15.00, 'price_type' => 'per_stay'],
            ['name' => 'Early Check-in', 'price' => 15.00, 'price_type' => 'per_stay'],
        ];

        foreach ($extras as $extra) {
            Extra::create([
                'id'          => Str::uuid()->toString(),
                'property_id' => $propertyId,
                'name'        => $extra['name'],
                'price'       => $extra['price'],
                'price_type'  => $extra['price_type'],
            ]);
        }
    }

    private function propertyData(): array
    {
        return [
            // GERMANY
            ['name' => 'a&o Aachen Hauptbahnhof', 'location' => 'Aachen', 'address' => 'Lagerhausstraße 5, 52064 Aachen, Germany', 'latitude' => 50.768347, 'longitude' => 6.093143, 'description' => 'Central location steps from Aachen main station and just 0.1 km from the city centre. Perfect base for the UNESCO-listed cathedral and historic market square.', 'phone' => '+49 241 4012680', 'email' => 'aachen@aohostels.com', 'rating' => 4.1, 'review_count' => 3241, 'rooms' => 80],
            ['name' => 'a&o Berlin Hauptbahnhof', 'location' => 'Berlin', 'address' => 'Lehrter Straße 12-15, 10557 Berlin, Germany', 'latitude' => 52.529048, 'longitude' => 13.363677, 'description' => 'Newly renovated hostel just 0.4 km from Berlin Central Station and a short walk to the Brandenburg Gate. Rooftop bar with panoramic views.', 'phone' => '+49 30 80948220', 'email' => 'berlin.hbf@aohostels.com', 'rating' => 4.3, 'review_count' => 8741, 'rooms' => 150],
            ['name' => 'a&o Berlin Mitte', 'location' => 'Berlin', 'address' => 'Köpenicker Straße 127-129, 10179 Berlin, Germany', 'latitude' => 52.508844, 'longitude' => 13.424000, 'description' => 'In the heart of Berlin, steps from the vibrant Kreuzberg district. Ideal for exploring galleries, street food markets and the East Side Gallery.', 'phone' => '+49 30 80948221', 'email' => 'berlin.mitte@aohostels.com', 'rating' => 4.2, 'review_count' => 6532, 'rooms' => 120],
            ['name' => 'a&o Berlin Friedrichshain', 'location' => 'Berlin', 'address' => 'Boxhagener Straße 73, 10245 Berlin, Germany', 'latitude' => 52.507040, 'longitude' => 13.469043, 'description' => 'Colourful Friedrichshain neighbourhood with red-brick charm. Surrounded by indie cafés, clubs and the famous Boxhagener Platz weekend market.', 'phone' => '+49 30 80948222', 'email' => 'berlin.friedrichshain@aohostels.com', 'rating' => 4.1, 'review_count' => 4871, 'rooms' => 100],
            ['name' => 'a&o Berlin Kolumbus', 'location' => 'Berlin', 'address' => 'Columbiadamm 160, 10965 Berlin, Germany', 'latitude' => 52.539216, 'longitude' => 13.498276, 'description' => 'Quiet yet well-connected Berlin location near Tempelhof Airport Park. Great starting point for exploring Cold War history.', 'phone' => '+49 30 80948223', 'email' => 'berlin.kolumbus@aohostels.com', 'rating' => 4.0, 'review_count' => 3102, 'rooms' => 90],
            ['name' => 'a&o Bremen Hauptbahnhof', 'location' => 'Bremen', 'address' => 'Bahnhofsplatz 6, 28195 Bremen, Germany', 'latitude' => 53.085560, 'longitude' => 8.804932, 'description' => 'Right next to Bremen main station, 1.2 km from the UNESCO-listed old town. Discover the famous Bremen Town Musicians statue.', 'phone' => '+49 421 3378460', 'email' => 'bremen@aohostels.com', 'rating' => 4.0, 'review_count' => 2876, 'rooms' => 80],
            ['name' => 'a&o Dortmund Hauptbahnhof', 'location' => 'Dortmund', 'address' => 'Königswall 8, 44137 Dortmund, Germany', 'latitude' => 51.517528, 'longitude' => 7.464483, 'description' => 'Super central location 0.3 km from the city centre near the iconic Dortmunder U cultural centre. Football fans love Signal Iduna Park nearby.', 'phone' => '+49 231 5869010', 'email' => 'dortmund@aohostels.com', 'rating' => 4.0, 'review_count' => 3547, 'rooms' => 85],
            ['name' => 'a&o Dresden Hauptbahnhof', 'location' => 'Dresden', 'address' => 'Ammonstraße 26, 01069 Dresden, Germany', 'latitude' => 51.036537, 'longitude' => 13.739611, 'description' => '0.4 km from the city centre with a stunning rooftop bar overlooking Dresden\'s famous Baroque Old Town skyline. The Frauenkirche is a short walk away.', 'phone' => '+49 351 8638400', 'email' => 'dresden@aohostels.com', 'rating' => 4.4, 'review_count' => 5123, 'rooms' => 95],
            ['name' => 'a&o Düsseldorf Hauptbahnhof', 'location' => 'Düsseldorf', 'address' => 'Worringer Straße 71-73, 40210 Düsseldorf, Germany', 'latitude' => 51.216280, 'longitude' => 6.782215, 'description' => '0.2 km from the main station with walking distance to the world-famous Königsallee shopping boulevard and charming Old Town.', 'phone' => '+49 211 5504940', 'email' => 'duesseldorf@aohostels.com', 'rating' => 4.1, 'review_count' => 4210, 'rooms' => 88],
            ['name' => 'a&o Frankfurt Galluswarte', 'location' => 'Frankfurt', 'address' => 'Gallusanlage 6, 60329 Frankfurt, Germany', 'latitude' => 50.103858, 'longitude' => 8.645863, 'description' => '10 minutes from Frankfurt Central Station and 2 km from the city centre. Great base for exploring the impressive skyline and Römer medieval old town.', 'phone' => '+49 69 24001940', 'email' => 'frankfurt.gallus@aohostels.com', 'rating' => 4.1, 'review_count' => 4855, 'rooms' => 100],
            ['name' => 'a&o Frankfurt Ostend', 'location' => 'Frankfurt', 'address' => 'Sonnemannstraße 16, 60314 Frankfurt, Germany', 'latitude' => 50.114426, 'longitude' => 8.719127, 'description' => 'Brand new property in Frankfurt\'s creative Ostend district, 4 km from the city centre. Modern design hostel close to the European Central Bank.', 'phone' => '+49 69 24001941', 'email' => 'frankfurt.ostend@aohostels.com', 'rating' => 4.3, 'review_count' => 1847, 'rooms' => 120],
            ['name' => 'a&o Hamburg Hauptbahnhof', 'location' => 'Hamburg', 'address' => 'Amsinckstraße 2, 20097 Hamburg, Germany', 'latitude' => 53.547531, 'longitude' => 10.010716, 'description' => 'Real Hanseatic spirit in a beautifully restored old brick trading house, just 0.5 km from the city centre. Steps from the historic Speicherstadt.', 'phone' => '+49 40 28406660', 'email' => 'hamburg.hbf@aohostels.com', 'rating' => 4.3, 'review_count' => 7432, 'rooms' => 140],
            ['name' => 'a&o Hamburg City', 'location' => 'Hamburg', 'address' => 'Billhorner Brückenstraße 2, 20539 Hamburg, Germany', 'latitude' => 53.550699, 'longitude' => 10.022508, 'description' => 'New-design hostel with rooftop terrace and premium meeting spaces. 1 km from the city centre, great views of Hamburg\'s iconic red-brick warehouses.', 'phone' => '+49 40 28406661', 'email' => 'hamburg.city@aohostels.com', 'rating' => 4.2, 'review_count' => 3981, 'rooms' => 110],
            ['name' => 'a&o Hamburg Reeperbahn', 'location' => 'Hamburg', 'address' => 'Simon-von-Utrecht-Straße 63, 20359 Hamburg, Germany', 'latitude' => 53.549708, 'longitude' => 9.958658, 'description' => 'Rustic and cosy hostel directly on the famous Reeperbahn entertainment mile. Live the Hamburg nightlife to the fullest.', 'phone' => '+49 40 28406662', 'email' => 'hamburg.reeperbahn@aohostels.com', 'rating' => 4.2, 'review_count' => 5216, 'rooms' => 95],
            ['name' => 'a&o Hamburg Hammer Kirche', 'location' => 'Hamburg', 'address' => 'Hammer Landstraße 170, 20537 Hamburg, Germany', 'latitude' => 53.554364, 'longitude' => 10.060380, 'description' => 'Boutique-style hostel in the residential Hamm district, 3.8 km from the city centre. A more local Hamburg experience with easy U-Bahn connections.', 'phone' => '+49 40 28406663', 'email' => 'hamburg.hammerkirche@aohostels.com', 'rating' => 4.0, 'review_count' => 2103, 'rooms' => 75],
            ['name' => 'a&o Köln Dom', 'location' => 'Cologne', 'address' => 'Marzellenstraße 44-56, 50668 Cologne, Germany', 'latitude' => 50.941482, 'longitude' => 6.954737, 'description' => 'Directly beside the magnificent Cologne Cathedral — a UNESCO World Heritage Site — and Central Station. Wake up to one of Europe\'s most dramatic Gothic skylines.', 'phone' => '+49 221 9128580', 'email' => 'koeln.dom@aohostels.com', 'rating' => 4.5, 'review_count' => 9821, 'rooms' => 130],
            ['name' => 'a&o Köln Hauptbahnhof', 'location' => 'Cologne', 'address' => 'Johannisstraße 76-80, 50668 Cologne, Germany', 'latitude' => 50.945379, 'longitude' => 6.955440, 'description' => 'Cologne\'s newest a&o hostel with the highest modern standards right next to the main station. Explore the Old Town and Rhine riverfront on foot.', 'phone' => '+49 221 9128581', 'email' => 'koeln.hbf@aohostels.com', 'rating' => 4.3, 'review_count' => 4217, 'rooms' => 115],
            ['name' => 'a&o Köln Neumarkt', 'location' => 'Cologne', 'address' => 'Kyotostraße 1, 50679 Cologne, Germany', 'latitude' => 50.933359, 'longitude' => 6.941276, 'description' => 'Stylish property in the lively Südstadt quarter, 2.1 km from the city centre. Surrounded by independent restaurants and cocktail bars.', 'phone' => '+49 221 9128582', 'email' => 'koeln.neumarkt@aohostels.com', 'rating' => 4.1, 'review_count' => 3412, 'rooms' => 90],
            ['name' => 'a&o Leipzig Hauptbahnhof', 'location' => 'Leipzig', 'address' => 'Brandenburger Straße 2, 04103 Leipzig, Germany', 'latitude' => 51.344531, 'longitude' => 12.385603, 'description' => 'Opulent lobby and lively bar just 0.1 km from Leipzig\'s magnificent European-style station. The city\'s music heritage is all around you.', 'phone' => '+49 341 2221150', 'email' => 'leipzig@aohostels.com', 'rating' => 4.3, 'review_count' => 5674, 'rooms' => 105],
            ['name' => 'a&o München Hauptbahnhof', 'location' => 'Munich', 'address' => 'Bayerstraße 75, 80335 Munich, Germany', 'latitude' => 48.138940, 'longitude' => 11.553572, 'description' => '0.5 km from Munich\'s grand central station — perfect for Oktoberfest, the English Garden, Marienplatz and day trips to Neuschwanstein Castle.', 'phone' => '+49 89 4523160', 'email' => 'muenchen.hbf@aohostels.com', 'rating' => 4.4, 'review_count' => 10234, 'rooms' => 145],
            ['name' => 'a&o München Hackerbrücke', 'location' => 'Munich', 'address' => 'Arnulfstraße 101, 80636 Munich, Germany', 'latitude' => 48.145665, 'longitude' => 11.541067, 'description' => 'Stunning balcony and rooftop with panoramic Alpine views, 1.6 km from the city centre. Walk to Oktoberfest grounds in under 10 minutes.', 'phone' => '+49 89 4523161', 'email' => 'muenchen.hackerbruecke@aohostels.com', 'rating' => 4.3, 'review_count' => 6891, 'rooms' => 125],
            ['name' => 'a&o München Laim', 'location' => 'Munich', 'address' => 'Albert-Roßhaupter-Straße 4, 81369 Munich, Germany', 'latitude' => 48.144105, 'longitude' => 11.494882, 'description' => 'Stylish hostel in Munich\'s Laim district, 2 km from the city centre and just 4 S-Bahn stops from Central Station. Great value in one of Germany\'s most popular cities.', 'phone' => '+49 89 4523162', 'email' => 'muenchen.laim@aohostels.com', 'rating' => 4.1, 'review_count' => 4102, 'rooms' => 95],
            ['name' => 'a&o Nürnberg Hauptbahnhof', 'location' => 'Nuremberg', 'address' => 'Bahnhofstraße 14, 90402 Nuremberg, Germany', 'latitude' => 49.447361, 'longitude' => 11.086225, 'description' => 'Right in the heart of Nuremberg, 0.3 km from the old town centre. Explore the imperial castle, vibrant Christmas market and WWII documentation centre.', 'phone' => '+49 911 4244730', 'email' => 'nuernberg@aohostels.com', 'rating' => 4.2, 'review_count' => 4763, 'rooms' => 90],
            ['name' => 'a&o Stuttgart City', 'location' => 'Stuttgart', 'address' => 'Rosensteinstraße 11, 70191 Stuttgart, Germany', 'latitude' => 48.793073, 'longitude' => 9.190989, 'description' => 'Modern hostel in Stuttgart\'s Europaviertel, 2.5 km from the city centre near Rosensteinpark. Ideal for visiting the Mercedes-Benz and Porsche Museums.', 'phone' => '+49 711 2194470', 'email' => 'stuttgart@aohostels.com', 'rating' => 4.1, 'review_count' => 3102, 'rooms' => 85],
            ['name' => 'a&o Weimar', 'location' => 'Weimar', 'address' => 'Friedensstraße 12, 99423 Weimar, Germany', 'latitude' => 50.997606, 'longitude' => 11.331964, 'description' => 'Charming hostel near Central Station with its own garden, orchard and hammocks, 1 km from the city centre. Explore the UNESCO World Heritage sites.', 'phone' => '+49 3643 4852790', 'email' => 'weimar@aohostels.com', 'rating' => 4.4, 'review_count' => 2341, 'rooms' => 70],
            // AUSTRIA
            ['name' => 'a&o Graz Hauptbahnhof', 'location' => 'Graz', 'address' => 'Eggenberger Gürtel 7, 8020 Graz, Austria', 'latitude' => 47.070553, 'longitude' => 15.415273, 'description' => 'Along the scenic River Mur, 1.9 km from the historic Graz city centre. Visit the UNESCO-listed old town and the modern Kunsthaus museum.', 'phone' => '+43 316 7122580', 'email' => 'graz@aohostels.com', 'rating' => 4.1, 'review_count' => 2891, 'rooms' => 80],
            ['name' => 'a&o Salzburg Hauptbahnhof', 'location' => 'Salzburg', 'address' => 'Ferdinand-Hanusch-Platz 2, 5020 Salzburg, Austria', 'latitude' => 47.815224, 'longitude' => 13.044224, 'description' => 'Directly at Central Station in a beautifully converted old bread factory with a designer look, 0.8 km from Mozart\'s birthplace.', 'phone' => '+43 662 8827270', 'email' => 'salzburg@aohostels.com', 'rating' => 4.4, 'review_count' => 5432, 'rooms' => 100],
            ['name' => 'a&o Wien Hauptbahnhof', 'location' => 'Vienna', 'address' => 'Alfred-Adler-Straße 3, 1100 Vienna, Austria', 'latitude' => 48.182849, 'longitude' => 16.378636, 'description' => 'Super close to Vienna\'s new central station with a fantastic rooftop terrace, 1.9 km from the city centre. The Belvedere Palace and Naschmarkt are within easy reach.', 'phone' => '+43 1 6060360', 'email' => 'wien.hbf@aohostels.com', 'rating' => 4.3, 'review_count' => 6743, 'rooms' => 130],
            ['name' => 'a&o Wien Stadthalle', 'location' => 'Vienna', 'address' => 'Hackengasse 37-39, 1150 Vienna, Austria', 'latitude' => 48.205013, 'longitude' => 16.336248, 'description' => 'Cosy reading corner, 24-hour bar and a charming green courtyard near the Stadthalle arena, 2 km from the city centre. Well connected to the Ring and Schönbrunn Palace.', 'phone' => '+43 1 6060361', 'email' => 'wien.stadthalle@aohostels.com', 'rating' => 4.2, 'review_count' => 4102, 'rooms' => 95],
            // BELGIUM
            ['name' => 'a&o Antwerpen Centraal', 'location' => 'Antwerp', 'address' => 'Pelikanstraat 22-24, 2018 Antwerp, Belgium', 'latitude' => 51.216230, 'longitude' => 4.420120, 'description' => 'Directly opposite the stunning Antwerp Central Station — one of the world\'s most beautiful railway stations — in the heart of the diamond district.', 'phone' => '+32 3 2317940', 'email' => 'antwerpen@aohostels.com', 'rating' => 4.2, 'review_count' => 3541, 'rooms' => 85],
            ['name' => 'a&o Brussel Centrum', 'location' => 'Brussels', 'address' => 'Rue du Damier 23, 1000 Brussels, Belgium', 'latitude' => 50.864847, 'longitude' => 4.358897, 'description' => 'Near Brussels-North Station, 2 km from the magnificent Grand-Place. Enjoy Belgian waffles, chocolate and the Atomium from this perfectly located hostel.', 'phone' => '+32 2 2181730', 'email' => 'brussel@aohostels.com', 'rating' => 4.0, 'review_count' => 2987, 'rooms' => 90],
            // NETHERLANDS
            ['name' => 'a&o Rotterdam City', 'location' => 'Rotterdam', 'address' => 'Willemsplein 1, 3016 DN Rotterdam, Netherlands', 'latitude' => 51.928690, 'longitude' => 4.473700, 'description' => 'Near central station in downtown Rotterdam, 1.9 km from the city centre. Discover the iconic Cube Houses and world-class contemporary architecture.', 'phone' => '+31 10 2413830', 'email' => 'rotterdam@aohostels.com', 'rating' => 4.1, 'review_count' => 2743, 'rooms' => 80],
            ['name' => 'a&o Amsterdam Zuidoost', 'location' => 'Amsterdam', 'address' => 'Karspeldreef 2, 1101 CJ Amsterdam, Netherlands', 'latitude' => 52.307067, 'longitude' => 4.949837, 'description' => '5 minutes from Johan Cruyff Arena and the Bullewijk metro, 9 km from the city centre. Great value base to explore Amsterdam\'s canals and museums.', 'phone' => '+31 20 5191920', 'email' => 'amsterdam@aohostels.com', 'rating' => 4.0, 'review_count' => 4321, 'rooms' => 120],
            // CENTRAL & EASTERN EUROPE
            ['name' => 'a&o Budapest City', 'location' => 'Budapest', 'address' => 'Erzsébet körút 12, 1073 Budapest, Hungary', 'latitude' => 47.502841, 'longitude' => 19.067852, 'description' => 'In the heart of Budapest\'s trendy Erzsébetváros "ruin bar" district, 4 km from the city centre. Explore the thermal baths and the vibrant Jewish quarter on foot.', 'phone' => '+36 1 8770680', 'email' => 'budapest@aohostels.com', 'rating' => 4.3, 'review_count' => 5123, 'rooms' => 110],
            ['name' => 'a&o Praha Rhea', 'location' => 'Prague', 'address' => 'Třinecká 2, 180 00 Prague, Czech Republic', 'latitude' => 50.079771, 'longitude' => 14.499555, 'description' => 'Recently renovated with modern rooms and facilities, 6.2 km from the city centre with easy metro access. Great budget base for Charles Bridge and Prague Castle.', 'phone' => '+420 266 799 500', 'email' => 'praha@aohostels.com', 'rating' => 4.1, 'review_count' => 3872, 'rooms' => 100],
            ['name' => 'a&o Warszawa Wola', 'location' => 'Warsaw', 'address' => 'Prosta 7, 00-838 Warsaw, Poland', 'latitude' => 52.229531, 'longitude' => 20.972051, 'description' => 'Our first Warsaw property, 10 minutes from all the city highlights. Explore the beautifully reconstructed Old Town and the Palace of Culture.', 'phone' => '+48 22 3065100', 'email' => 'warszawa@aohostels.com', 'rating' => 4.2, 'review_count' => 2541, 'rooms' => 90],
            // SCANDINAVIA
            ['name' => 'a&o København Nørrebro', 'location' => 'Copenhagen', 'address' => 'Ravnsborggade 18, 2200 Copenhagen, Denmark', 'latitude' => 55.705285, 'longitude' => 12.543818, 'description' => 'In Copenhagen\'s hip Nørrebro district — multicultural, artistic and full of life. Indie coffee shops, vintage stores and the lakes are your neighbours.', 'phone' => '+45 3396 9800', 'email' => 'koebenhavn.norrebro@aohostels.com', 'rating' => 4.3, 'review_count' => 3218, 'rooms' => 95],
            ['name' => 'a&o København Sydhavn', 'location' => 'Copenhagen', 'address' => 'Sluseholmen 3, 2450 Copenhagen, Denmark', 'latitude' => 55.652966, 'longitude' => 12.540001, 'description' => 'Authentic maritime flair in Copenhagen\'s emerging Sydhavn harbour district, 5 minutes from Central Station. Experience Copenhagen\'s waterfront culture.', 'phone' => '+45 3396 9801', 'email' => 'koebenhavn.sydhavn@aohostels.com', 'rating' => 4.2, 'review_count' => 1987, 'rooms' => 85],
            // UNITED KINGDOM
            ['name' => 'a&o Brighton Beach', 'location' => 'Brighton', 'address' => 'Kings Road, BN1 2FN Brighton, United Kingdom', 'latitude' => 50.820505, 'longitude' => -0.138106, 'description' => 'Beach hostel in the vibrant centre of Brighton with stunning sea views. Walk the famous pier, explore the Royal Pavilion and the Lanes antique quarter.', 'phone' => '+44 1273 220300', 'email' => 'brighton@aohostels.com', 'rating' => 4.3, 'review_count' => 4123, 'rooms' => 100],
            ['name' => 'a&o Edinburgh City', 'location' => 'Edinburgh', 'address' => 'Royal Mile, EH1 1SR Edinburgh, United Kingdom', 'latitude' => 55.949700, 'longitude' => -3.186010, 'description' => 'Right on the iconic Royal Mile, 0.1 km from the city centre with 131 thoughtfully designed rooms. Edinburgh Castle and Arthur\'s Seat are within easy walking distance.', 'phone' => '+44 131 5228800', 'email' => 'edinburgh@aohostels.com', 'rating' => 4.5, 'review_count' => 6741, 'rooms' => 131],
            ['name' => 'a&o London Docklands Riverside', 'location' => 'London', 'address' => '265A Rotherhithe Street, SE16 5HW London, United Kingdom', 'latitude' => 51.498910, 'longitude' => -0.050000, 'description' => 'Thames-side hostel with a free boat shuttle to Tower Bridge. 7.6 km from the centre with stunning river views. The Tate Modern and Borough Market are easily reachable.', 'phone' => '+44 20 71071800', 'email' => 'london@aohostels.com', 'rating' => 4.2, 'review_count' => 7432, 'rooms' => 140],
            ['name' => 'a&o Manchester City Centre', 'location' => 'Manchester', 'address' => 'Pollard Street, M4 7AL Manchester, United Kingdom', 'latitude' => 53.477242, 'longitude' => -2.241798, 'description' => 'Modern hostel 0.5 km from Manchester city centre with bright and cosily furnished rooms. Explore the Northern Quarter and Old Trafford.', 'phone' => '+44 161 8392200', 'email' => 'manchester@aohostels.com', 'rating' => 4.1, 'review_count' => 3541, 'rooms' => 110],
            // ITALY
            ['name' => 'a&o Firenze Campo di Marte', 'location' => 'Florence', 'address' => 'Via Mannelli 16, 50132 Florence, Italy', 'latitude' => 43.777100, 'longitude' => 11.276320, 'description' => 'Adjacent to Campo di Marte railway station, 2.8 km from the city centre. Easy tram access to the Duomo, Uffizi Gallery and Piazzale Michelangelo.', 'phone' => '+39 055 6236010', 'email' => 'firenze@aohostels.com', 'rating' => 4.2, 'review_count' => 4312, 'rooms' => 95],
            ['name' => 'a&o Milano Ca Granda', 'location' => 'Milan', 'address' => 'Via Sammartini 56, 20125 Milan, Italy', 'latitude' => 45.506538, 'longitude' => 9.196564, 'description' => '5 km from the city centre with convenient metro access to the Duomo, Galleria Vittorio Emanuele II and Milan\'s world-famous fashion district.', 'phone' => '+39 02 67391010', 'email' => 'milano@aohostels.com', 'rating' => 4.1, 'review_count' => 3891, 'rooms' => 100],
            ['name' => 'a&o Venezia Mestre', 'location' => 'Venice', 'address' => 'Viale Venezia 12, 30172 Mestre, Italy', 'latitude' => 45.481372, 'longitude' => 12.239197, 'description' => 'In the Mestre mainland district, 2.2 km from the centre with regular bus and train services directly to Venice island. The most affordable way to experience La Serenissima.', 'phone' => '+39 041 5350550', 'email' => 'venezia@aohostels.com', 'rating' => 4.0, 'review_count' => 3102, 'rooms' => 115],
        ];
    }
}