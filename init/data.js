const sampleListings = [
  {
    title: "The Cliffside Bohemian Villa with Private Plunge Pool",
    description:
      "Perched atop the red cliffs of North Goa overlooking Vagator beach and the Arabian Sea. This sunlit bohemian villa features an infinity plunge pool, open-air sun deck, vibrant tropical garden, and direct access to Ozran beach. Minutes away from famous beach clubs, flea markets, and coastal cafes. Ideal for sunset lovers, creative retreats, and beach vacations.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    },
    price: 4200,
    location: "Vagator, Goa",
    country: "India",
    category: "Beachfront",
    geometry: {
      type: "Point",
      coordinates: [73.7439, 15.5898]
    }
  },
  {
    title: "Royal Heritage Haveli Suite on Lake Pichola",
    description:
      "Immerse yourself in Rajasthani royalty at this 18th-century restored palace haveli in Udaipur. Featuring handcrafted jharokhas, traditional Mewari frescoes, marble courtyard fountains, and private rooftop dining with unobstructed views of the City Palace and Lake Pichola. Enjoy candlelit dinners, cultural folk dance performances, and serene boat cruises.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
    },
    price: 5500,
    location: "Udaipur, Rajasthan",
    country: "India",
    category: "Castles",
    geometry: {
      type: "Point",
      coordinates: [73.6800, 24.5760]
    }
  },
  {
    title: "Panoramic Cedar Treehouse in Old Manali Pine Forest",
    description:
      "Nestled high up in an apple orchard and deodar pine forest in Old Manali. This handcrafted wooden treehouse boasts floor-to-ceiling glass windows framing snow-capped Himalayan peaks and the Rohtang pass horizon. Features a stone fireplace, private balcony hammock, radiant wooden interiors, and stargazing skylights. Wake up to fresh mountain air, birdsong, and trekking trails right at your doorstep.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    },
    price: 2800,
    location: "Old Manali, Himachal Pradesh",
    country: "India",
    category: "Mountains",
    geometry: {
      type: "Point",
      coordinates: [77.1892, 32.2396]
    }
  },
  {
    title: "Misty Cloud Heritage Tea Estate Cottage",
    description:
      "Surrounded by rolling emerald tea plantations and misty valleys in Munnar, Kerala. A colonial-style stone cottage featuring a cozy British fireplace, plantation-view verandas, and tea tasting tours. Hike through aromatic cardamom hills, spot endemic birds at Eravikulam National Park, and sip freshly brewed single-estate tea in tranquil isolation.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    },
    price: 3100,
    location: "Munnar, Kerala",
    country: "India",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [77.0595, 10.0889]
    }
  },
  {
    title: "Alleppey Backwater Luxury Houseboat with Private Chef",
    description:
      "Cruise the tranquil palm-fringed canals of Alleppey on a handcrafted eco-friendly bamboo and teakwood houseboat (Kettuvallam). Includes a personal captain and dedicated private chef serving authentic Karimeen Pollichathu, Kerala sadhya, and coconut curries. Features sun loungers, air-conditioned master staterooms, and sunset views over Vembanad Lake.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    },
    price: 6800,
    location: "Alleppey, Kerala",
    country: "India",
    category: "Boats",
    geometry: {
      type: "Point",
      coordinates: [76.3388, 9.4981]
    }
  },
  {
    title: "The Ganges Glass Sanctuary - Yoga & Meditation Retreat",
    description:
      "Situated right along the holy turquoise waters of the sacred Ganges in Rishikesh. This peaceful sanctuary offers private river access, daily morning yoga pavilions, an Ayurvedic herbal garden, and evening views of the Parmarth Niketan Ganga Aarti. Perfect for spiritual seekers, writers, digital nomads, and mindfulness practitioners looking to recharge amidst the Himalayan foothills.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    },
    price: 1950,
    location: "Rishikesh, Uttarakhand",
    country: "India",
    category: "Rooms",
    geometry: {
      type: "Point",
      coordinates: [78.3248, 30.0869]
    }
  },
  {
    title: "Royal Maharaja Stargazing Tent in Sam Sand Dunes",
    description:
      "Experience the magic of the Golden City under a thousand stars in the heart of the Thar Desert. Luxury Swiss glamping tents equipped with carved sheesham wood furnishings, attached marble baths, and private verandahs. Includes sunset camel safaris across golden dunes, live Kalbelia folk performances around a crackling bonfire, and traditional Rajasthani thali dinners.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    },
    price: 2600,
    location: "Jaisalmer, Rajasthan",
    country: "India",
    category: "Camping",
    geometry: {
      type: "Point",
      coordinates: [70.5186, 26.8282]
    }
  },
  {
    title: "Whispering Pines Coffee & Pepper Estate Villa",
    description:
      "Tucked inside a sprawling 40-acre private coffee and spice plantation in Madikeri, Coorg. Wake up to the rich aroma of blooming Robusta coffee blossoms, misty mountain slopes, and cascading natural stream pools. Features vintage Kodava architecture, evening barbecue bonfires, plantation guided walks, and home-cooked pandi curry and akki roti.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    price: 3400,
    location: "Coorg, Karnataka",
    country: "India",
    category: "Farms",
    geometry: {
      type: "Point",
      coordinates: [75.7382, 12.4244]
    }
  },
  {
    title: "Maison Jaune - 19th Century French Colonial Townhouse",
    description:
      "Located on Rue Suffren in the heart of Pondicherry's historic French Quarter (White Town). With bright mustard-yellow stucco walls, arched shuttered windows, high ceilings, antique teakwood four-poster beds, and an internal leafy bougainvillea courtyard. Stroll 2 minutes to the seaside Promenade Beach, Aurobindo Ashram, and artisanal French bakeries.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    },
    price: 3800,
    location: "Pondicherry, Tamil Nadu",
    country: "India",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [79.8359, 11.9338]
    }
  },
  {
    title: "Varkala Cliffside Ocean Oasis with Infinity Pool",
    description:
      "Dramatic 180-degree ocean views perched directly on the famed Varkala North Cliff. Listen to the rhythmic waves of Papanasam beach right from your private terrace infinity pool. Step down the cliff pathway to organic cafes, yoga centers, and surf schools. Unrivaled panoramic sunsets every evening.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    },
    price: 3200,
    location: "Varkala, Kerala",
    country: "India",
    category: "Amazing Pools",
    geometry: {
      type: "Point",
      coordinates: [76.7163, 8.7379]
    }
  },
  {
    title: "Cosmic Geodesic Glamping Dome under the Milky Way",
    description:
      "A luxury geodesic sky dome perched at 7,500 feet overlooking the Pir Panjal range in Sethan, Hampta Valley. Features a transparent panoramic ceiling allowing you to sleep directly under crystal-clear Himalayan starry night skies. Equipped with indoor heating, plush goose-down duvets, stargazing telescope, and warm hot cocoa.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
    },
    price: 4100,
    location: "Sethan Valley, Himachal Pradesh",
    country: "India",
    category: "Domes",
    geometry: {
      type: "Point",
      coordinates: [77.2345, 32.2215]
    }
  },
  {
    title: "Silk Route Luxury Yurt in Nubra Valley Dunes",
    description:
      "Nestled between the rugged Karakoram and Ladakh mountain ranges near the Shyok River in Hunder. Surrounded by dramatic white sand dunes home to rare double-humped Bactrian camels. Handcrafted Mongolian-style heated luxury yurts with handwoven Ladakhi rugs, solar warming, and panoramic glacier views. Truly a once-in-a-lifetime high altitude adventure.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    },
    price: 4900,
    location: "Nubra Valley, Ladakh",
    country: "India",
    category: "Arctic",
    geometry: {
      type: "Point",
      coordinates: [77.5771, 34.1526]
    }
  },
  {
    title: "Amer Heritage Fortress Palace with Peacocks & Fountains",
    description:
      "Located in the shadow of the majestic Amber Fort in Jaipur. Built with pink Dholpur sandstone, hand-carved jali stone lattice screens, step-well courtyards, and tranquil swimming pools where wild peacocks roam. Experience royal Rajput hospitality, traditional block-printing workshops, and easy access to the Pink City bazaars.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=800&q=80",
    },
    price: 4800,
    location: "Jaipur, Rajasthan",
    country: "India",
    category: "Castles",
    geometry: {
      type: "Point",
      coordinates: [75.8507, 26.9855]
    }
  },
  {
    title: "Vintage Indo-Portuguese Villa in South Goa Coconut Palms",
    description:
      "Step back in time at this 120-year-old preserved Indo-Portuguese villa in quiet Benaulim, South Goa. Features red terracotta roofs, mother-of-pearl window shutters, antique rocking chairs, and an outdoor rain shower enclosed in banana groves. Just a 5-minute bicycle ride through paddy fields to white sand beaches.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    },
    price: 2400,
    location: "Benaulim, South Goa",
    country: "India",
    category: "Trending",
    geometry: {
      type: "Point",
      coordinates: [73.9297, 15.2608]
    }
  },
  {
    title: "Sea-Facing Bandra Designer Penthouse with Skyline Terrace",
    description:
      "Soak in breathtaking Arabian Sea sunsets and the Mumbai skyline from this ultra-modern designer duplex penthouse on Carter Road, Bandra. Features double-height floor-to-ceiling glass walls, wrap-around private terrace, state-of-the-art chef's kitchen, and curated modern art. Minutes from Mumbai's hottest celebrity restaurants, bars, and cafes.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    },
    price: 8500,
    location: "Mumbai, Maharashtra",
    country: "India",
    category: "Iconic Cities",
    geometry: {
      type: "Point",
      coordinates: [72.8258, 19.0596]
    }
  },
  {
    title: "Cozy Beachfront Cottage",
    description:
      "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1500,
    location: "Malibu",
    country: "United States",
  },
  {
    title: "Modern Loft in Downtown",
    description:
      "Stay in the heart of the city in this stylish loft apartment. Perfect for urban explorers!",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHRyYXZlbHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1200,
    location: "New York City",
    country: "United States",
  },
  {
    title: "Mountain Retreat",
    description:
      "Unplug and unwind in this peaceful mountain cabin. Surrounded by nature, it's a perfect place to recharge.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1000,
    location: "Aspen",
    country: "United States",
  },
  {
    title: "Historic Villa in Tuscany",
    description:
      "Experience the charm of Tuscany in this beautifully restored villa. Explore the rolling hills and vineyards.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 2500,
    location: "Florence",
    country: "Italy",
  },
  {
    title: "Secluded Treehouse Getaway",
    description:
      "Live among the treetops in this unique treehouse retreat. A true nature lover's paradise.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 800,
    location: "Portland",
    country: "United States",
  },
  {
    title: "Beachfront Paradise",
    description:
      "Step out of your door onto the sandy beach. This beachfront condo offers the ultimate relaxation.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGhvdGVsc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 2000,
    location: "Cancun",
    country: "Mexico",
  },
  {
    title: "Rustic Cabin by the Lake",
    description:
      "Spend your days fishing and kayaking on the serene lake. This cozy cabin is perfect for outdoor enthusiasts.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 900,
    location: "Lake Tahoe",
    country: "United States",
  },
  {
    title: "Luxury Penthouse with City Views",
    description:
      "Indulge in luxury living with panoramic city views from this stunning penthouse apartment.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 3500,
    location: "Los Angeles",
    country: "United States",
  },
  {
    title: "Ski-In/Ski-Out Chalet",
    description:
      "Hit the slopes right from your doorstep in this ski-in/ski-out chalet in the Swiss Alps.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 3000,
    location: "Verbier",
    country: "Switzerland",
  },
  {
    title: "Safari Lodge in the Serengeti",
    description:
      "Experience the thrill of the wild in a comfortable safari lodge. Witness the Great Migration up close.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 4000,
    location: "Serengeti National Park",
    country: "Tanzania",
  },
  {
    title: "Historic Canal House",
    description:
      "Stay in a piece of history in this beautifully preserved canal house in Amsterdam's iconic district.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2FtcGluZ3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1800,
    location: "Amsterdam",
    country: "Netherlands",
  },
  {
    title: "Private Island Retreat",
    description:
      "Have an entire island to yourself for a truly exclusive and unforgettable vacation experience.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1618140052121-39fc6db33972?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bG9kZ2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 10000,
    location: "Fiji",
    country: "Fiji",
  },
  {
    title: "Charming Cottage in the Cotswolds",
    description:
      "Escape to the picturesque Cotswolds in this quaint and charming cottage with a thatched roof.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YmVhY2glMjB2YWNhdGlvbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1200,
    location: "Cotswolds",
    country: "United Kingdom",
  },
  {
    title: "Historic Brownstone in Boston",
    description:
      "Step back in time in this elegant historic brownstone located in the heart of Boston.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1533619239233-6280475a633a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fHNreSUyMHZhY2F0aW9ufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 2200,
    location: "Boston",
    country: "United States",
  },
  {
    title: "Beachfront Bungalow in Bali",
    description:
      "Relax on the sandy shores of Bali in this beautiful beachfront bungalow with a private pool.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1602391833977-358a52198938?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fGNhbXBpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1800,
    location: "Bali",
    country: "Indonesia",
  },
  {
    title: "Mountain View Cabin in Banff",
    description:
      "Enjoy breathtaking mountain views from this cozy cabin in the Canadian Rockies.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1500,
    location: "Banff",
    country: "Canada",
  },
  {
    title: "Art Deco Apartment in Miami",
    description:
      "Step into the glamour of the 1920s in this stylish Art Deco apartment in South Beach.",
    image: {
      filename: "listingimage",
      url: "https://plus.unsplash.com/premium_photo-1670963964797-942df1804579?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1600,
    location: "Miami",
    country: "United States",
  },
  {
    title: "Tropical Villa in Phuket",
    description:
      "Escape to a tropical paradise in this luxurious villa with a private infinity pool in Phuket.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1470165301023-58dab8118cc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 3000,
    location: "Phuket",
    country: "Thailand",
  },
  {
    title: "Historic Castle in Scotland",
    description:
      "Live like royalty in this historic castle in the Scottish Highlands. Explore the rugged beauty of the area.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGJlYWNoJTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 4000,
    location: "Scottish Highlands",
    country: "United Kingdom",
  },
  {
    title: "Desert Oasis in Dubai",
    description:
      "Experience luxury in the middle of the desert in this opulent oasis in Dubai with a private pool.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZHViYWl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 5000,
    location: "Dubai",
    country: "United Arab Emirates",
  },
  {
    title: "Rustic Log Cabin in Montana",
    description:
      "Unplug and unwind in this cozy log cabin surrounded by the natural beauty of Montana.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1100,
    location: "Montana",
    country: "United States",
  },
  {
    title: "Beachfront Villa in Greece",
    description:
      "Enjoy the crystal-clear waters of the Mediterranean in this beautiful beachfront villa on a Greek island.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmlsbGF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 2500,
    location: "Mykonos",
    country: "Greece",
  },
  {
    title: "Eco-Friendly Treehouse Retreat",
    description:
      "Stay in an eco-friendly treehouse nestled in the forest. It's the perfect escape for nature lovers.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8c2t5JTIwdmFjYXRpb258ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 750,
    location: "Costa Rica",
    country: "Costa Rica",
  },
  {
    title: "Historic Cottage in Charleston",
    description:
      "Experience the charm of historic Charleston in this beautifully restored cottage with a private garden.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1587381420270-3e1a5b9e6904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGxvZGdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 1600,
    location: "Charleston",
    country: "United States",
  },
  {
    title: "Modern Apartment in Tokyo",
    description:
      "Explore the vibrant city of Tokyo from this modern and centrally located apartment.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHRva3lvfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    },
    price: 2000,
    location: "Tokyo",
    country: "Japan",
  },
  {
    title: "Lakefront Cabin in New Hampshire",
    description:
      "Spend your days by the lake in this cozy cabin in the scenic White Mountains of New Hampshire.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1578645510447-e20b4311e3ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDF8fGNhbXBpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1200,
    location: "New Hampshire",
    country: "United States",
  },
  {
    title: "Luxury Villa in the Maldives",
    description:
      "Indulge in luxury in this overwater villa in the Maldives with stunning views of the Indian Ocean.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bGFrZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 6000,
    location: "Maldives",
    country: "Maldives",
  },
  {
    title: "Ski Chalet in Aspen",
    description:
      "Hit the slopes in style with this luxurious ski chalet in the world-famous Aspen ski resort.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxha2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 4000,
    location: "Aspen",
    country: "United States",
  },
  {
    title: "Secluded Beach House in Costa Rica",
    description:
      "Escape to a secluded beach house on the Pacific coast of Costa Rica. Surf, relax, and unwind.",
    image: {
      filename: "listingimage",
      url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVhY2glMjBob3VzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    },
    price: 1800,
    location: "Costa Rica",
    country: "Costa Rica",
  },
];

module.exports = { data: sampleListings };