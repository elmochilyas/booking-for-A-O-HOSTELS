'use client'

import { use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Coffee, Train, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePropertySearch } from '@/hooks/useProperties'
import { formatCurrency } from '@/lib/utils'

interface CityData {
  name: string
  tagline: string
  heroImage: string
  transport: string
  attractions: { name: string; distance: string }[]
  eatDrink: { name: string; type: string }[]
  staffTip: { name: string; quote: string }
}

const cityInfo: Record<string, CityData> = {
  berlin: {
    name: 'Berlin', tagline: 'Where history meets innovation',
    heroImage: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200',
    transport: 'Berlin\'s public transport (BVG) covers the whole city with U-Bahn, S-Bahn, trams and buses running 24/7 on weekends. The Berlin Welcome Card offers unlimited travel plus museum discounts.',
    attractions: [
      { name: 'Brandenburg Gate', distance: '15 min walk' },
      { name: 'East Side Gallery', distance: '20 min tram' },
      { name: 'Museum Island', distance: '25 min walk' },
      { name: 'Checkpoint Charlie', distance: '10 min walk' },
      { name: 'Reichstag Building', distance: '20 min walk' },
    ],
    eatDrink: [
      { name: 'Markthalle Neun', type: 'Food market — Street Food Thursday is legendary' },
      { name: 'Prater Garten', type: 'Germany\'s oldest beer garden' },
      { name: 'Curry 36', type: 'Iconic Currywurst stand' },
    ],
    staffTip: { name: 'Klaus, Front Desk', quote: 'Start your day with a sunrise walk along the Spree — it\'s magical and completely free!' },
  },
  hamburg: {
    name: 'Hamburg', tagline: 'Gateway to the world',
    heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
    transport: 'Hamburg has an excellent HVV network of U-Bahn, S-Bahn, buses and harbour ferries. The Hamburg Card gives unlimited public transport and free or discounted museum entry.',
    attractions: [
      { name: 'Elbphilharmonie', distance: '10 min walk' },
      { name: 'Miniatur Wunderland', distance: '20 min walk' },
      { name: 'Port of Hamburg', distance: '25 min walk' },
      { name: 'St. Michael\'s Church', distance: '15 min walk' },
    ],
    eatDrink: [
      { name: 'Fischmarkt', type: 'Famous Sunday fish market from 5 AM' },
      { name: 'Schanzenviertel', type: 'Trendy neighbourhood full of cafés and bars' },
      { name: 'Alt Hamburger Aalspeicher', type: 'Classic Hamburg eel restaurant' },
    ],
    staffTip: { name: 'Anna, Front Desk', quote: 'Take harbour ferry line 62 — it\'s a public bus fare and gives you the best views of the port!' },
  },
  munich: {
    name: 'Munich', tagline: 'Beer, Alps and Bavarian charm',
    heroImage: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=1200',
    transport: 'Munich\'s MVV network is one of Germany\'s best — U-Bahn, S-Bahn, trams and buses cover everything. Day tickets are great value. The S-Bahn also connects directly to the airport.',
    attractions: [
      { name: 'Marienplatz & Glockenspiel', distance: '15 min U-Bahn' },
      { name: 'English Garden', distance: '20 min walk' },
      { name: 'Nymphenburg Palace', distance: '25 min tram' },
      { name: 'BMW Museum', distance: '20 min U-Bahn' },
      { name: 'Oktoberfest Grounds (seasonal)', distance: '10 min walk' },
    ],
    eatDrink: [
      { name: 'Hofbräuhaus', type: 'World-famous beer hall since 1589' },
      { name: 'Viktualienmarkt', type: 'Daily food market with beer garden' },
      { name: 'Augustiner Keller', type: 'Traditional Bavarian beer garden' },
    ],
    staffTip: { name: 'Markus, Front Desk', quote: 'For Oktoberfest, arrive at the tents before 9 AM to guarantee a seat — they fill up in minutes after opening!' },
  },
  cologne: {
    name: 'Cologne', tagline: 'Cathedral city on the Rhine',
    heroImage: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200',
    transport: 'Cologne\'s KVB runs U-Bahn, S-Bahn and trams connecting the whole city. The WelcomeCard includes unlimited public transport and discounts at 30+ attractions.',
    attractions: [
      { name: 'Cologne Cathedral (UNESCO)', distance: '5 min walk' },
      { name: 'Museum Ludwig', distance: '5 min walk' },
      { name: 'Rhine promenade', distance: '10 min walk' },
      { name: 'Chocolate Museum', distance: '20 min walk' },
      { name: 'Old Town (Altstadt)', distance: '10 min walk' },
    ],
    eatDrink: [
      { name: 'Früh am Dom', type: 'Classic Kölsch brewery right by the cathedral' },
      { name: 'Belgisches Viertel', type: 'Trendy neighbourhood with cafés and restaurants' },
      { name: 'Fischmarkt', type: 'Historic riverside square with local taverns' },
    ],
    staffTip: { name: 'Stefan, Front Desk', quote: 'Kölsch is served in small 200ml glasses — just don\'t cover it with a beer mat or they\'ll keep bringing more!' },
  },
  frankfurt: {
    name: 'Frankfurt', tagline: 'Finance, culture and apple wine',
    heroImage: 'https://images.unsplash.com/photo-1577465882459-7a78d84b7264?w=1200',
    transport: 'Frankfurt\'s RMV network covers the whole region. The Tagesticket (day ticket) is excellent value. The U-Bahn takes you from the airport to the centre in 11 minutes.',
    attractions: [
      { name: 'Römerberg (Medieval Old Town)', distance: '20 min U-Bahn' },
      { name: 'Städel Museum', distance: '25 min U-Bahn' },
      { name: 'Palmengarten', distance: '15 min U-Bahn' },
      { name: 'Sachsenhausen Apple Wine District', distance: '25 min walk' },
    ],
    eatDrink: [
      { name: 'Zum Gemalten Haus', type: 'Traditional apple wine tavern' },
      { name: 'Kleinmarkthalle', type: 'Best covered food market in Germany' },
      { name: 'Berger Straße', type: 'Neighbourhood strip with bakeries and restaurants' },
    ],
    staffTip: { name: 'Julia, Front Desk', quote: 'Try Ebbelwoi (Frankfurt apple wine) with Handkäse mit Musik — it\'s the local snack pairing every Frankfurter loves!' },
  },
  vienna: {
    name: 'Vienna', tagline: 'Imperial elegance meets modern flair',
    heroImage: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200',
    transport: 'Vienna\'s Wiener Linien U-Bahn, trams and buses run reliably until 12:30 AM (and 24h on weekends). The Vienna City Card gives unlimited travel and 210+ discounts.',
    attractions: [
      { name: 'Schönbrunn Palace', distance: '15 min U-Bahn' },
      { name: 'St. Stephen\'s Cathedral', distance: '10 min U-Bahn' },
      { name: 'Belvedere Palace', distance: '20 min tram' },
      { name: 'Kunsthistorisches Museum', distance: '15 min U-Bahn' },
    ],
    eatDrink: [
      { name: 'Café Central', type: 'Iconic Viennese coffeehouse since 1876' },
      { name: 'Naschmarkt', type: 'Vienna\'s biggest open-air food market' },
      { name: 'Figlmüller', type: 'Famous schnitzel the size of a plate' },
    ],
    staffTip: { name: 'Thomas, Front Desk', quote: 'The Museumsquartier courtyard is free to enter and a great spot to relax with locals on summer evenings.' },
  },
  london: {
    name: 'London', tagline: 'A world city like no other',
    heroImage: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200',
    transport: 'Use the Oyster card or contactless payment on the Tube, Overground, buses and Thames Clippers. Buses are brilliant value and let you see the city above ground.',
    attractions: [
      { name: 'Tower of London', distance: '20 min by boat shuttle' },
      { name: 'Tate Modern', distance: '25 min by boat' },
      { name: 'Borough Market', distance: '20 min by boat' },
      { name: 'Greenwich Park & Observatory', distance: '10 min walk' },
    ],
    eatDrink: [
      { name: 'Borough Market', type: 'London\'s oldest food market, open Thu–Sat' },
      { name: 'Maltby Street Market', type: 'Local foodie favourite under the arches' },
      { name: 'The Mayflower', type: 'Historic Thames-side pub from 1550' },
    ],
    staffTip: { name: 'Sophie, Front Desk', quote: 'Take our free boat shuttle to Tower Bridge — it\'s the most scenic commute in London and saves your Oyster card!' },
  },
  edinburgh: {
    name: 'Edinburgh', tagline: 'Scotland\'s dramatic capital',
    heroImage: 'https://images.unsplash.com/photo-1594394489098-74ac04c0fc2e?w=1200',
    transport: 'Edinburgh is very walkable in the centre. Lothian Buses cover the wider city and are reliable and affordable. The Tram connects the airport to the city centre.',
    attractions: [
      { name: 'Edinburgh Castle', distance: '2 min walk' },
      { name: 'Holyrood Palace', distance: '10 min walk' },
      { name: 'Arthur\'s Seat', distance: '20 min walk' },
      { name: 'Scottish National Museum', distance: '5 min walk' },
      { name: 'Greyfriars Kirkyard', distance: '5 min walk' },
    ],
    eatDrink: [
      { name: 'Grassmarket', type: 'Historic square full of pubs and restaurants' },
      { name: 'Brew Lab', type: 'Best specialty coffee on the Royal Mile' },
      { name: 'The Devil\'s Advocate', type: 'Cocktail bar in a converted Victorian pump house' },
    ],
    staffTip: { name: 'Fiona, Front Desk', quote: 'Hike Arthur\'s Seat at sunrise for the most spectacular free view of the city — arrive 30 mins before dawn!' },
  },
  prague: {
    name: 'Prague', tagline: 'The city of a hundred spires',
    heroImage: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1200',
    transport: 'Prague\'s DPP metro, trams and buses are cheap and comprehensive. A 24-hour pass costs just a few euros. Trams are the most scenic way to travel.',
    attractions: [
      { name: 'Prague Castle (UNESCO)', distance: '20 min metro+walk' },
      { name: 'Charles Bridge', distance: '20 min metro+walk' },
      { name: 'Old Town Square', distance: '20 min metro' },
      { name: 'Josefov Jewish Quarter', distance: '25 min metro' },
    ],
    eatDrink: [
      { name: 'Lokál Dlouhá', type: 'Best unfiltered Pilsner Urquell in the city' },
      { name: 'Manifesto Market', type: 'Cool container street food market' },
      { name: 'Café Louvre', type: 'Grand café where Kafka once wrote' },
    ],
    staffTip: { name: 'Petra, Front Desk', quote: 'Visit Charles Bridge at 6 AM — you\'ll have it almost to yourself and the morning light on the castle is stunning.' },
  },
  budapest: {
    name: 'Budapest', tagline: 'The Paris of the East',
    heroImage: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200',
    transport: 'BKK runs metro, trams and buses across Budapest. The 24-hour travelcard is great value. Tram 2 along the Danube is considered one of Europe\'s most scenic tram routes.',
    attractions: [
      { name: 'Széchenyi Baths', distance: '20 min metro' },
      { name: 'Parliament Building', distance: '20 min tram' },
      { name: 'Fisherman\'s Bastion', distance: '25 min walk+bus' },
      { name: 'Ruin Bars, Kazinczy Street', distance: '5 min walk' },
    ],
    eatDrink: [
      { name: 'Szimpla Kert', type: 'Original and most famous ruin bar' },
      { name: 'Central Market Hall', type: 'Stunning 1897 market for local produce' },
      { name: 'Gerbeaud', type: 'Legendary pastry shop on Vörösmarty Square' },
    ],
    staffTip: { name: 'Balázs, Front Desk', quote: 'Book the thermal baths in the morning on a weekday — you\'ll share the pools with mostly locals, not tourists!' },
  },
  amsterdam: {
    name: 'Amsterdam', tagline: 'Canals, culture and freedom',
    heroImage: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200',
    transport: 'GVB runs trams, buses and metro. The I Amsterdam City Card includes public transport and free entry to 70+ museums including the Rijksmuseum. Renting a bike is strongly recommended.',
    attractions: [
      { name: 'Rijksmuseum', distance: '25 min metro+tram' },
      { name: 'Anne Frank House (book ahead!)', distance: '30 min metro+tram' },
      { name: 'Van Gogh Museum', distance: '25 min metro+tram' },
      { name: 'Jordaan Neighbourhood', distance: '30 min tram' },
    ],
    eatDrink: [
      { name: 'Albert Cuyp Market', type: 'Amsterdam\'s largest street market' },
      { name: 'Brouwerij \'t IJ', type: 'Microbrewery inside a windmill' },
      { name: 'Foodhallen', type: 'Indoor food market in a former tram depot' },
    ],
    staffTip: { name: 'Sander, Front Desk', quote: 'Rent a bike for €10/day — it\'s the only way to truly experience Amsterdam like a local.' },
  },
  copenhagen: {
    name: 'Copenhagen', tagline: 'Hygge, design and the world\'s best food',
    heroImage: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1200',
    transport: 'DSB and Metro cover the city. The Copenhagen Card includes public transport and 80+ attractions. Cycling is the default way Copenhageners get around — rental bikes are everywhere.',
    attractions: [
      { name: 'Nyhavn Harbour', distance: '20 min metro' },
      { name: 'Tivoli Gardens', distance: '15 min metro' },
      { name: 'Christiania (Freetown)', distance: '20 min metro+walk' },
      { name: 'National Museum of Denmark', distance: '20 min metro' },
    ],
    eatDrink: [
      { name: 'Torvehallerne', type: 'Copenhagen\'s best covered food market' },
      { name: 'Nørreport street food stalls', type: 'Quick, affordable lunch options' },
      { name: 'Mikkeller Bar', type: 'World-famous craft beer bar' },
    ],
    staffTip: { name: 'Maja, Front Desk', quote: 'Copenhagen is expensive — buy your groceries at Netto or Rema 1000 and picnic by the canals. Far more local than any restaurant!' },
  },
  dresden: {
    name: 'Dresden', tagline: 'Florence on the Elbe',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'DVB trams and buses cover the whole city. Day tickets are affordable. The S-Bahn connects Dresden to surrounding areas including Saxon Switzerland National Park.',
    attractions: [
      { name: 'Frauenkirche', distance: '5 min walk' },
      { name: 'Zwinger Palace', distance: '10 min walk' },
      { name: 'Dresden Castle', distance: '10 min walk' },
      { name: 'Semperoper Opera House', distance: '10 min walk' },
    ],
    eatDrink: [
      { name: 'Neustadt district', type: 'Alternative neighbourhood with great bars and cafés' },
      { name: 'Altmarkt-Galerie', type: 'Shopping and food in the heart of the city' },
      { name: 'Brauhaus am Waldschlösschen', type: 'Brewery with city panorama views' },
    ],
    staffTip: { name: 'Lukas, Front Desk', quote: 'Our rooftop bar has one of the best views of the Dresden Old Town skyline — grab a drink at sunset!' },
  },
  leipzig: {
    name: 'Leipzig', tagline: 'The new Berlin — without the crowds',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'LVB trams and buses are the main way to get around. The centre is compact and very walkable. The main station — one of the largest in Europe — is 5 minutes from our hostel.',
    attractions: [
      { name: 'Bach Museum', distance: '10 min walk' },
      { name: 'Völkerschlachtdenkmal', distance: '20 min tram' },
      { name: 'Spinnerei Arts Complex', distance: '15 min tram' },
      { name: 'Leipzig Zoo', distance: '15 min walk' },
    ],
    eatDrink: [
      { name: 'Karli (Karl-Liebknecht-Straße)', type: 'The hippest street in Leipzig for bars and food' },
      { name: 'Café Grundmann', type: 'Beautiful Jugendstil coffeehouse' },
      { name: 'Bayerischer Bahnhof', type: 'Gose brewery in a historic railway station' },
    ],
    staffTip: { name: 'Nadine, Front Desk', quote: 'Thursday night in the Südvorstadt is Leipzig at its best — live music, street food and the city\'s creative scene all in one place.' },
  },
  salzburg: {
    name: 'Salzburg', tagline: 'Mozart, mountains and Mozartkugeln',
    heroImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200',
    transport: 'Salzburg\'s compact old town is very walkable. City buses cover the wider area. The Salzburg Card gives unlimited bus rides and free entry to almost every attraction.',
    attractions: [
      { name: 'Hohensalzburg Fortress', distance: '10 min walk+funicular' },
      { name: 'Mirabell Gardens', distance: '15 min walk' },
      { name: 'Mozart\'s Birthplace', distance: '15 min walk' },
      { name: 'Hellbrunn Palace & Trick Fountains', distance: '20 min bus' },
    ],
    eatDrink: [
      { name: 'Augustiner Bräustübl', type: 'Massive brewery pub — get your beer in a stone mug!' },
      { name: 'Grünmarkt', type: 'Daily market in the old town with local produce' },
      { name: 'Café Tomaselli', type: 'Austria\'s oldest coffeehouse, open since 1700' },
    ],
    staffTip: { name: 'Birgit, Front Desk', quote: 'Climb the Kapuzinerberg at sunset for the best free panoramic view over the old town and fortress.' },
  },
  warsaw: {
    name: 'Warsaw', tagline: 'Resilient, creative and unstoppable',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'ZTM metro lines, trams and buses cover the city comprehensively. Warsaw is also very cycle-friendly. Tickets are cheap and 24/72-hour passes are excellent value.',
    attractions: [
      { name: 'Old Town Market Square (UNESCO)', distance: '20 min metro' },
      { name: 'Warsaw Rising Museum', distance: '10 min walk' },
      { name: 'Łazienki Park & Palace', distance: '20 min bus' },
      { name: 'POLIN Museum', distance: '15 min tram' },
    ],
    eatDrink: [
      { name: 'Hala Koszyki', type: 'Revived 1908 market hall with top food stalls' },
      { name: 'Praga Koneser Centre', type: 'Former vodka distillery turned food & culture hub' },
      { name: 'Bar Mleczny (Milk Bar)', type: 'Traditional communist-era canteen — authentic and cheap' },
    ],
    staffTip: { name: 'Agnieszka, Front Desk', quote: 'Don\'t skip the Warsaw Rising Museum — it\'s one of the most moving and brilliantly designed museums in Europe.' },
  },
  brussels: {
    name: 'Brussels', tagline: 'Waffles, chocolate and the heart of Europe',
    heroImage: 'https://images.unsplash.com/photo-1559570278-7e2b6a9d4944?w=1200',
    transport: 'STIB/MIVB metro, trams and buses cover Brussels. The Brussels Card includes unlimited transport and free museum entry. Walking between the main sights is very feasible.',
    attractions: [
      { name: 'Grand-Place (UNESCO)', distance: '15 min metro' },
      { name: 'Atomium', distance: '25 min metro' },
      { name: 'Manneken Pis', distance: '15 min metro' },
      { name: 'Magritte Museum', distance: '15 min metro' },
    ],
    eatDrink: [
      { name: 'Rue du Marché aux Herbes', type: 'Waffles, chocolate and fries on every corner' },
      { name: 'Moeder Lambic Fontainas', type: 'Best Belgian beer bar in the city' },
      { name: 'Marché du Midi', type: 'Huge Sunday market — North Africa meets Belgium' },
    ],
    staffTip: { name: 'Marie, Front Desk', quote: 'The best Belgian waffles are from street stalls, not restaurants — Maison Dandoy near Grand-Place is worth the queue!' },
  },
  florence: {
    name: 'Florence', tagline: 'The cradle of the Renaissance',
    heroImage: 'https://images.unsplash.com/photo-1541370976299-4d24ebbc9077?w=1200',
    transport: 'Florence\'s compact centre is best explored on foot. ATAF buses and the new tram line connect the wider city. The ZTL restricted traffic zone makes the historic centre wonderfully walkable.',
    attractions: [
      { name: 'Uffizi Gallery (book ahead!)', distance: '20 min tram' },
      { name: 'Galleria dell\'Accademia (David)', distance: '20 min tram' },
      { name: 'Duomo & Baptistery', distance: '20 min tram' },
      { name: 'Piazzale Michelangelo', distance: '30 min bus' },
    ],
    eatDrink: [
      { name: 'Mercato Centrale', type: 'Two-floor food market — the upstairs is outstanding' },
      { name: 'Trattoria Mario', type: 'Legendary no-frills lunch spot since 1953' },
      { name: 'Brac', type: 'Bookshop-bar with great aperitivo' },
    ],
    staffTip: { name: 'Giulia, Front Desk', quote: 'Book the Uffizi online at least 2 weeks ahead in summer — the queue without a ticket can be 3+ hours!' },
  },
  milan: {
    name: 'Milan', tagline: 'Fashion, design and spritz o\'clock',
    heroImage: 'https://images.unsplash.com/photo-1525874684015-58379d421a52?w=1200',
    transport: 'ATM metro (4 lines), trams and buses cover the whole city. The metro is fast and runs until 12:30 AM (2 AM on weekends). A 24-hour pass is great value for visitors.',
    attractions: [
      { name: 'Duomo di Milano', distance: '15 min metro' },
      { name: 'Galleria Vittorio Emanuele II', distance: '15 min metro' },
      { name: 'The Last Supper (book months ahead!)', distance: '20 min metro' },
      { name: 'Brera Art Gallery', distance: '20 min metro' },
    ],
    eatDrink: [
      { name: 'Navigli district', type: 'Canal-side bars perfect for aperitivo hour' },
      { name: 'Mercato Metropolitano', type: 'Excellent Italian food market' },
      { name: 'Luini', type: 'Famous panzerotti bakery — always a queue, always worth it' },
    ],
    staffTip: { name: 'Lorenzo, Front Desk', quote: 'Book Leonardo\'s Last Supper months in advance online — only 25 people allowed in at a time and it sells out fast.' },
  },
  venice: {
    name: 'Venice', tagline: 'La Serenissima — the most unique city on earth',
    heroImage: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200',
    transport: 'ACTV vaporetti (water buses) are the public transport of Venice. Line 1 down the Grand Canal is a must. From Mestre, direct buses and trains reach Venice island in 10–15 minutes.',
    attractions: [
      { name: 'St. Mark\'s Basilica', distance: '15 min bus+vaporetto' },
      { name: 'Doge\'s Palace', distance: '15 min bus+vaporetto' },
      { name: 'Rialto Market', distance: '15 min bus+vaporetto' },
      { name: 'Murano & Burano Islands', distance: '45 min vaporetto' },
    ],
    eatDrink: [
      { name: 'Rialto Market Bacari', type: 'Traditional wine bars serving cicchetti (Venetian tapas)' },
      { name: 'Osteria alle Testiere', type: 'Best seafood in Venice — book ahead' },
      { name: 'Pasticceria Tonolo', type: 'The locals\' favourite bakery since 1886' },
    ],
    staffTip: { name: 'Marco, Front Desk', quote: 'Stay away from St. Mark\'s Square for meals — walk 10 minutes into Cannaregio or Dorsoduro and pay half the price for twice the quality.' },
  },
  brighton: {
    name: 'Brighton', tagline: 'Seaside freedom, pride and the quirky south',
    heroImage: 'https://images.unsplash.com/photo-1567447803219-ccf5aa54d30b?w=1200',
    transport: 'Brighton is very walkable. Trains from London Victoria and London Bridge take just 55 minutes. Local buses cover the surrounding areas.',
    attractions: [
      { name: 'Brighton Palace Pier', distance: '5 min walk' },
      { name: 'Royal Pavilion', distance: '10 min walk' },
      { name: 'The Lanes (antiques & vintage)', distance: '10 min walk' },
      { name: 'British Airways i360 Tower', distance: '10 min walk' },
    ],
    eatDrink: [
      { name: 'Brighton Open Market', type: 'Community food market with street food' },
      { name: 'The Foodilic', type: 'Best brunch spot in Brighton' },
      { name: 'North Laine cafés', type: 'Alternative neighbourhood full of independent coffee shops' },
    ],
    staffTip: { name: 'Alice, Front Desk', quote: 'Hire a beach hut for a few hours and spend the afternoon on the shingle — it\'s the most Brighton thing you can do!' },
  },
  manchester: {
    name: 'Manchester', tagline: 'Music, football and Madchester',
    heroImage: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=1200',
    transport: 'Metrolink trams cover the city centre and wider Greater Manchester. Local buses are comprehensive. The airport is connected directly to the city by Metrolink.',
    attractions: [
      { name: 'Manchester Museum', distance: '15 min bus' },
      { name: 'Museum of Science & Industry', distance: '15 min walk' },
      { name: 'Northern Quarter', distance: '10 min walk' },
      { name: 'Old Trafford (stadium tour)', distance: '20 min Metrolink' },
    ],
    eatDrink: [
      { name: 'Mackie Mayor', type: 'Converted market hall with excellent food stalls' },
      { name: 'Arndale Market', type: 'Affordable street food in the heart of the city' },
      { name: 'Chinatown', type: 'One of the UK\'s largest Chinatowns' },
    ],
    staffTip: { name: 'Ryan, Front Desk', quote: 'Head to the Northern Quarter on a Friday evening — the independent bars, record shops and street art make it the city\'s cultural soul.' },
  },
  antwerp: {
    name: 'Antwerp', tagline: 'Diamonds, fashion and Flemish masters',
    heroImage: 'https://images.unsplash.com/photo-1559570278-7e2b6a9d4944?w=1200',
    transport: 'De Lijn trams and buses serve the whole city. Antwerp is also very bike-friendly. The city centre is compact and largely pedestrianised.',
    attractions: [
      { name: 'Cathedral of Our Lady', distance: '20 min walk' },
      { name: 'Rubenshuis (Rubens\' House)', distance: '25 min walk' },
      { name: 'MAS Museum', distance: '20 min walk' },
      { name: 'Antwerp Central Station', distance: '1 min walk' },
    ],
    eatDrink: [
      { name: 'Vrijdagmarkt', type: 'Historic square surrounded by cafés and restaurants' },
      { name: 'De Koninck Brewery', type: 'Antwerp\'s legendary local beer brewery' },
      { name: 'Foodie\'s Market', type: 'Weekend market with the best Belgian food' },
    ],
    staffTip: { name: 'Nathalie, Front Desk', quote: 'Antwerp Central Station is one of the world\'s most beautiful railway stations — walk through the main hall even if you\'re not travelling!' },
  },
  rotterdam: {
    name: 'Rotterdam', tagline: 'Europe\'s most modern skyline',
    heroImage: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200',
    transport: 'RET metro, trams and buses are fast and efficient. The OV-chipkaart (or contactless card) works across all transport. Rotterdam is extremely bike-friendly.',
    attractions: [
      { name: 'Cube Houses (Kubuswoningen)', distance: '15 min metro' },
      { name: 'Markthal Rotterdam', distance: '15 min metro' },
      { name: 'Museum Boijmans Van Beuningen', distance: '20 min metro' },
      { name: 'Kinderdijk Windmills (UNESCO)', distance: '40 min ferry' },
    ],
    eatDrink: [
      { name: 'Markthal', type: 'Stunning arched food market and the first in the Netherlands' },
      { name: 'Fenix Food Factory', type: 'Warehouse food market on the waterfront' },
      { name: 'Kaapse Brouwers', type: 'Local craft brewery in the harbour' },
    ],
    staffTip: { name: 'Thijs, Front Desk', quote: 'Rotterdam was bombed flat in WWII and rebuilt from scratch — walk around and appreciate that every building you see was built after 1945.' },
  },
  aachen: {
    name: 'Aachen', tagline: 'City of emperors and hot springs',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'ASEAG buses cover the city and connect to Aachen main station. The city centre is compact and very walkable. Aachen is also close to the Dutch and Belgian borders.',
    attractions: [
      { name: 'Aachen Cathedral (UNESCO)', distance: '10 min walk' },
      { name: 'Charlemagne\'s Palatine Chapel', distance: '10 min walk' },
      { name: 'Centre Charlemagne', distance: '10 min walk' },
      { name: 'Carolus Thermen (hot springs spa)', distance: '15 min bus' },
    ],
    eatDrink: [
      { name: 'Domkeller', type: 'Historic bar right by the cathedral' },
      { name: 'Aachener Weihnachtsmarkt (seasonal)', type: 'One of Germany\'s most famous Christmas markets' },
      { name: 'Leo van den Daele', type: 'Historic café famous for its Printen gingerbread' },
    ],
    staffTip: { name: 'Petra, Front Desk', quote: 'Try Aachener Printen (the city\'s special spiced gingerbread) from a local bakery — it\'s completely different from anything you\'ve tasted before!' },
  },
  bremen: {
    name: 'Bremen', tagline: 'Free Hanseatic city on the Weser',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'BSAG trams and buses cover the whole city. The old town is compact and easily walkable from the main station. Day tickets offer great value.',
    attractions: [
      { name: 'Bremen Town Hall (UNESCO)', distance: '20 min walk' },
      { name: 'Böttcherstraße', distance: '20 min walk' },
      { name: 'The Schnoor District', distance: '25 min walk' },
      { name: 'Bremen Town Musicians Statue', distance: '20 min walk' },
    ],
    eatDrink: [
      { name: 'Schlachte Riverfront', type: 'Row of restaurants and bars on the Weser' },
      { name: 'Schüttinger Gasthausbrauerei', type: 'Excellent local brewery in the old town' },
      { name: 'Markt', type: 'Weekly market with local produce' },
    ],
    staffTip: { name: 'Carsten, Front Desk', quote: 'Rub the foot of the Bremen Town Musicians statue for good luck — tradition says it grants your wish!' },
  },
  dortmund: {
    name: 'Dortmund', tagline: 'Steel, football and culture',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'DSW21 U-Bahn, trams and buses cover the whole Ruhr region. The Ruhr RegionalExpress connects Dortmund to Essen, Bochum and Duisburg quickly.',
    attractions: [
      { name: 'Signal Iduna Park (stadium tour)', distance: '20 min U-Bahn' },
      { name: 'German Football Museum', distance: '5 min walk' },
      { name: 'Dortmunder U Cultural Centre', distance: '10 min walk' },
      { name: 'Westfalenpark', distance: '15 min tram' },
    ],
    eatDrink: [
      { name: 'Hövels Haus', type: 'Historic pub serving the local Dortmunder Bier' },
      { name: 'Kreuzviertel', type: 'Trendy neighbourhood with cafés and street food' },
      { name: 'Westenhellweg', type: 'Pedestrian shopping street with food stalls' },
    ],
    staffTip: { name: 'Kevin, Front Desk', quote: 'Even if you\'re not a football fan, the Signal Iduna Park stadium tour is genuinely fascinating — the atmosphere on match day is electric!' },
  },
  dusseldorf: {
    name: 'Düsseldorf', tagline: 'Fashion capital of Germany on the Rhine',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'Rheinbahn U-Bahn, trams and buses cover the city excellently. The Altstadt, Königsallee and Medienhafen are all connected. Day tickets are affordable.',
    attractions: [
      { name: 'Königsallee (Kö)', distance: '5 min walk' },
      { name: 'Altstadt (Old Town)', distance: '15 min walk' },
      { name: 'K20 & K21 Art Museums', distance: '10 min walk' },
      { name: 'Medienhafen', distance: '20 min walk' },
    ],
    eatDrink: [
      { name: 'Brauerei Schumacher', type: 'Original Düsseldorf Altbier brewery' },
      { name: 'Carlsplatz Market', type: 'Daily market loved by locals' },
      { name: 'Berger Straße', type: 'Casual restaurants and bars' },
    ],
    staffTip: { name: 'Nicole, Front Desk', quote: 'The Altbier pub crawl in the old town is a Düsseldorf tradition — the small dark beers come fast and free flow from the barrel!' },
  },
  nuremberg: {
    name: 'Nuremberg', tagline: 'Medieval wonders and honest Franconian food',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'VAG U-Bahn and trams cover the city well. The old town is almost entirely walkable. The Christmas market is completely pedestrianised in December.',
    attractions: [
      { name: 'Nuremberg Castle', distance: '15 min walk' },
      { name: 'Documentation Centre (Nazi history)', distance: '25 min tram' },
      { name: 'Germanisches Nationalmuseum', distance: '10 min walk' },
      { name: 'Nuremberg Christkindlesmarkt (Dec)', distance: '10 min walk' },
    ],
    eatDrink: [
      { name: 'Bratwurst Röslein', type: 'Best Nuremberg bratwurst in the old town' },
      { name: 'Hütt\'n', type: 'Traditional Franconian tavern' },
      { name: 'Hauptmarkt', type: 'Daily market in the main square' },
    ],
    staffTip: { name: 'Sabine, Front Desk', quote: 'Nuremberg bratwursts are tiny but mighty — always order at least six and eat them with mustard in a bread roll!' },
  },
  stuttgart: {
    name: 'Stuttgart', tagline: 'Engineers, vineyards and Swabian soul food',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'VVS S-Bahn, U-Bahn and buses provide excellent coverage. The StuttCard includes unlimited transport and free museum entry including the Porsche Museum.',
    attractions: [
      { name: 'Mercedes-Benz Museum', distance: '20 min U-Bahn' },
      { name: 'Porsche Museum', distance: '25 min S-Bahn' },
      { name: 'Stuttgart State Gallery', distance: '10 min U-Bahn' },
      { name: 'Killesberg Park', distance: '20 min U-Bahn' },
    ],
    eatDrink: [
      { name: 'Markthalle Stuttgart', type: 'Art Nouveau market hall with fantastic food' },
      { name: 'Stuttgart wine villages', type: 'Vineyards within the city limits — unique in Germany' },
      { name: 'Bohnenviertel', type: 'Historic quarter with Swabian restaurants' },
    ],
    staffTip: { name: 'Florian, Front Desk', quote: 'Take the rack railway (Zahnradbahn) up to the vineyards at Rotenberg — stunning city views and actual wine growing right inside Stuttgart!' },
  },
  weimar: {
    name: 'Weimar', tagline: 'Goethe, Bauhaus and timeless culture',
    heroImage: 'https://images.unsplash.com/photo-1467803738586-46b7eb7b16a1?w=1200',
    transport: 'Weimar is a small city — the entire historic centre is walkable from our hostel. City buses cover the wider area.',
    attractions: [
      { name: 'Goethe\'s House (UNESCO)', distance: '15 min walk' },
      { name: 'Schiller\'s House', distance: '15 min walk' },
      { name: 'Bauhaus Museum', distance: '10 min walk' },
      { name: 'Duchess Anna Amalia Library', distance: '10 min walk' },
    ],
    eatDrink: [
      { name: 'ACC Galerie Café', type: 'Artist café in a historic courtyard' },
      { name: 'Zum Weissen Schwan', type: 'Goethe\'s favourite restaurant — still serving today' },
      { name: 'Marktplatz', type: 'Weekly market with local Thuringian produce' },
    ],
    staffTip: { name: 'Katja, Front Desk', quote: 'Sit in our hostel garden with a Thuringian beer on a warm evening — it\'s one of the most peaceful spots in Germany!' },
  },
  graz: {
    name: 'Graz', tagline: 'Austria\'s second city — first for food',
    heroImage: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200',
    transport: 'GVB trams and buses cover the whole city. Graz is very bike-friendly and flat. The Schlossberg hill is best reached by the historic funicular.',
    attractions: [
      { name: 'Schlossberg (castle hill)', distance: '25 min walk' },
      { name: 'Graz Old Town (UNESCO)', distance: '20 min walk' },
      { name: 'Kunsthaus Graz', distance: '20 min walk' },
      { name: 'Eggenberg Palace (UNESCO)', distance: '20 min tram' },
    ],
    eatDrink: [
      { name: 'Kaiser-Josef-Markt', type: 'Best fresh food market in Styria' },
      { name: 'Lendplatz street food', type: 'Hip neighbourhood market on Saturdays' },
      { name: 'Der Steirer', type: 'Authentic Styrian cuisine with local wines' },
    ],
    staffTip: { name: 'Christoph, Front Desk', quote: 'Graz is the foodie capital of Austria — the Styrian pumpkin seed oil is on everything. Try it drizzled on Kürbissuppe (pumpkin soup)!' },
  },
}

export default function CityGuidePage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = use(params)
  const info = cityInfo[city] ?? cityInfo.berlin
  const { data: properties } = usePropertySearch({ location: info.name })

  const transport = info.transport.replace('Berlin', info.name)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[50vh]">
        <Image src={info.heroImage} alt={info.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <h1 className="text-5xl font-bold text-white mb-2">{info.name}</h1>
            <p className="text-xl text-white/80">{info.tagline}</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">

        {/* A&O Properties */}
        {properties && properties.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Our {properties.length > 1 ? 'Hostels' : 'Hostel'} in {info.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {properties.slice(0, 4).map((property) => (
                <Link key={property.id} href={`/hostels/${property.slug}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all">
                    <div className="relative h-48">
                      <Image
                        src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600'}
                        alt={property.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                      <p className="text-primary font-bold mt-2">from {formatCurrency(property.priceFrom)}/night</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Attractions */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6" /> Top Attractions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {info.attractions.map((a) => (
              <Card key={a.name}>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{a.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{a.distance} from our hostel</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Getting Around */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Train className="h-6 w-6" /> Getting Around
          </h2>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground leading-relaxed">{transport}</p>
            </CardContent>
          </Card>
        </section>

        {/* Eat & Drink */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Coffee className="h-6 w-6" /> Eat & Drink
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {info.eatDrink.map((place) => (
              <Card key={place.name}>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{place.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{place.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Staff Tip */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lightbulb className="h-6 w-6" /> Insider Tip from Our Team
          </h2>
          <Card className="bg-primary/5 border-primary">
            <CardContent className="p-6">
              <p className="text-lg italic mb-4">&ldquo;{info.staffTip.quote}&rdquo;</p>
              <p className="font-semibold">— {info.staffTip.name}, A&O {info.name}</p>
            </CardContent>
          </Card>
        </section>

        {/* CTA */}
        <Card className="bg-secondary text-secondary-foreground">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Visit {info.name}?</h3>
            <p className="text-muted-foreground mb-6">Book your stay and discover the city like a local</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href={`/search?location=${info.name}`}>
                <Button size="lg">Search Hostels</Button>
              </Link>
              <Link href="/experiences">
                <Button size="lg" variant="outline" className="border-secondary-foreground text-secondary-foreground hover:bg-secondary-foreground hover:text-secondary">
                  All Cities
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
