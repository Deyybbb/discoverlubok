/* =====================================================================
   STARTING CONTENT
   ---------------------------------------------------------------------
   This is only the first-run content. After that, everything is edited
   in Admin. Items marked "to be confirmed" are still missing from the
   LGU data and should be replaced with official details.

   Sources (data provided by LGU Loboc, October 2026):
   - LIST-OF-OFFICIALS-MUNICIPAL-BRGY.-CAP-SK-CHAIR.xlsx (officials)
   - List-of-Registered-Accommodations.xlsx, CY 2026 sheet (stay)
   - List-of-Souvenir-Shops.docx (shops at the Tourism Complex)
   - Population Loboc.pdf (2024 CBMS, PSA)
   - Barangay_Bndry shapefile (boundaries and land area, js/loboc-shapes.js)
   - TDP Loboc 2026-2028.pdf (attractions, activities, dining, festivals,
     history, transport). Page numbers below are the PDF page.
   ===================================================================== */
window.LOBOC_SEED = {

  /* Bump this number whenever the starting content changes. In preview
     mode, browsers that still hold older sample data reload this content. */
  dataVersion: 3,

  settings: {
    siteName: "DiscoverLubok",
    heroTitle: "LOBOC",
    quote: "A piece of heaven",
    heroSub: "River town and Music Capital of Bohol",
    landHeadline: "Hear the [RIVER.]\nFeel the [MUSIC.]",
    landSub: "The **Music Capital of Bohol**. Cruise the green Loboc River, call trusted local guides and homestays, and discover heritage beyond the usual stops.",
    welcomeTitle: "Where the river keeps time.",
    welcomeText: "Cruise the jade-green Loboc River, hear the Loboc Children's Choir and the Loboc Band, and walk through four centuries of history.",
    officeName: "Loboc Municipal Tourism Office",
    officeAddress: "Loboc Tourism Complex, Villaflor, Loboc, Bohol 6316 (to be confirmed)",
    officeHours: "Monday to Friday, 8:00 AM – 5:00 PM (to be confirmed)",
    hymnTitle: "Loboc Hymn",
    hymnLyrics: "Hymn lyrics to be added by the LGU in Admin > Site settings.",
    safety: "Respect church rules and dress modestly in churches. Wear life vests on all river activities. The zipline and cable car stop during moderate and heavy rain. The river cruise accepts cash and GCash only. Do not litter in the river. Ask before photographing people. Agree on tricycle and habal-habal fares before riding.",
    aboutText: "Loboc is a third-class municipality in the interior of Bohol, about 24 km northeast of Tagbilaran City (around 35 minutes by road). It has 28 barangays and a land area of about 57.7 km², and lies within the Loboc Watershed Forest Reserve. Known as the Music Capital of Bohol, it is home to the Loboc Children's Choir, the Loboc Band and the coral-stone San Pedro Apostol Church, a National Cultural Treasure. The Loboc River cruise and the Loboc Eco-Adventure Park welcomed 547,833 visitors in 2024."
  },

  barangays: ["Agape","Alegria","Bagumbayan","Bahian","Bonbon Lower","Bonbon Upper","Buenavista","Bugho","Cabadiangan","Calunasan Norte","Calunasan Sur","Camayaan","Cambance","Candabong","Candasag","Canlasid","Gon-ob","Gotozon","Jimilian","Oy","Poblacion Ondol","Poblacion Sawang","Quinoguitan","Taytay","Tigbao","Ugpong","Valladolid","Villaflor"],

  /* Household population per barangay: 2024 Community-Based Monitoring System (PSA). Town total: 16,724. */
  population: { "Agape": 629, "Alegria": 652, "Bagumbayan": 654, "Bahian": 519, "Bonbon Lower": 216, "Bonbon Upper": 508, "Buenavista": 350, "Bugho": 500, "Cabadiangan": 315, "Calunasan Norte": 741, "Calunasan Sur": 421, "Camayaan": 1157, "Cambance": 352, "Candabong": 857, "Candasag": 263, "Canlasid": 336, "Gon-ob": 262, "Gotozon": 937, "Jimilian": 976, "Oy": 1442, "Poblacion Ondol": 722, "Poblacion Sawang": 417, "Quinoguitan": 508, "Taytay": 340, "Tigbao": 949, "Ugpong": 379, "Valladolid": 501, "Villaflor": 821 },

  highlights: [
    { id: "hl-floating", order: 1, color: "leaf", kicker: "River cruise", title: "Floating Restaurant",
      summary: "Lunch on a floating restaurant while the jade-green Loboc River carries you past palms, villages and live music.",
      story: "The Loboc River cruise is the town's best-known experience. Large floating restaurants leave the Tourism Docking Port at the Loboc Tourism Complex with a buffet of local dishes while musicians play on board. Along the way, balsa performers on bamboo rafts welcome guests with folk dances such as the kuradang and tinikling. In 2024 the cruise carried 442,682 guests, about 1,149 a day.",
      facts: [["Boarding","Tourism Docking Port, Loboc Tourism Complex, Villaflor"],["Operators","CS Village Resto, Long River Cruise, One Amore Cruises, Riverwatch Floating Restaurant"],["Payment","Cash and GCash"],["Fee","To be confirmed"]],
      photos: [], pub: true },
    { id: "hl-ecopark", order: 2, color: "river", kicker: "Adventure", title: "Loboc Eco Adventure Park",
      summary: "Ride the zipline and cable car across the Loboc River toward Mt. Guimba for a bird's-eye view of the valley.",
      story: "The Loboc Eco-Adventure Park (LEAP) in Barangay Gotozon is owned and run by the Municipality of Loboc. Its zipline and cable car cross the Loboc River toward Mt. Guimba in Jimilian, with views of the river, the forest and the town below. Nature trails introduce visitors to local plants and wildlife. Rides stop during moderate and heavy rain.",
      facts: [["Where","Gotozon"],["Rides","Zipline and cable car"],["Run by","Municipality of Loboc"],["Fee","To be confirmed"]],
      photos: [], pub: true },
    { id: "hl-rondalla", order: 3, color: "forest", kicker: "Music", title: "Rondalla",
      summary: "The bandurria, octavina and guitar: string music passed from one Loboc generation to the next.",
      story: "Loboc's rondalla groups keep alive the Filipino string-band tradition. They play alongside the town's choirs, the Loboc Band and the Loboc Youth Ambassador's Band at fiestas, river cruises and church celebrations. Every November 22, the feast of Santa Cecilia, patroness of music, brings choirs, rondallas and bands together at the town plaza.",
      facts: [["Instruments","Bandurria, octavina, laud, guitar, bass"],["Where to hear","River cruise, fiestas, Loboc Plaza"],["Big night","Feast of Santa Cecilia, November 22"],["Contact","Tourism Office"]],
      photos: [], pub: true },
    { id: "hl-bolibong", order: 4, color: "leaf", kicker: "Main festival", title: "Bolibongkingking",
      summary: "Drums, gongs and the whole town dancing. A healing and thanksgiving dance said to be practised only in Loboc.",
      story: "Bolibongkingking takes its name from the bolibong (drum) and kingking (gong). Played with the guimbao and agong, they drive a dance of healing and thanksgiving before the image of Our Lady of Guadalupe, the town's second patron. Today barangays compete in street dancing and dance-drama during the May fiesta, at the JAD Cultural Complex.",
      facts: [["When","May, during the Guadalupe fiesta (date to be confirmed)"],["Where","JAD Cultural Complex and Poblacion streets"],["Instruments","Bolibong (drum), kingking (gong), guimbao, agong"],["Fee","Free to watch"]],
      photos: [], pub: true },
    { id: "hl-suroy", order: 5, color: "river", kicker: "Christmas tradition", title: "Suroy sa Musikero",
      summary: "Forty days of caroling: the Loboc Band visits homes across the barangays from Christmas Day to February 2.",
      story: "Suroy sa Musikero (the musicians' rounds) is a Loboc Christmas tradition. From December 25 to February 2, the Loboc Band, with its cantoras, cantores and young tiples, goes house to house across the barangays singing Spanish, Latin and Visayan carols. Visits include the kuradang dance and the Pastores nativity play, and every New Year's Day the band visits the Municipal Hall.",
      facts: [["When","December 25 to February 2"],["Who","Loboc Band with cantoras, cantores and tiples"],["New Year's Day","Visit to the Municipal Hall"],["Contact","Tourism Office"]],
      photos: [], pub: true }
  ],

  places: [
    { id: "pl-church", name: "San Pedro Apostol Church (Loboc Church)", kind: "Heritage", brgy: "Poblacion Ondol", status: "Open", hours: "Mass schedule to be confirmed", fee: "To be confirmed", desc: "Coral-stone church declared a National Historical Landmark and a National Cultural Treasure, and on the UNESCO tentative list. Restored after the 2013 earthquake and handed over by the National Museum on May 16, 2021.", story: "Inside are 1920s ceiling murals by Ray Francia and Canuto Avila, seven old retablos and a relic of St. Ignatius of Loyola. The church is also the Diocesan Shrine of Our Lady of Guadalupe.", guide: "Dress modestly (cover shoulders and knees). Keep quiet during Mass. Ask before taking photos inside.", photos: [], pub: true },
    { id: "pl-belltower", name: "Loboc Bell Tower", kind: "Heritage", brgy: "Poblacion Sawang", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Free-standing bell tower across the street from Loboc Church, built in 1851 and damaged in the 2013 earthquake.", photos: [], pub: true },
    { id: "pl-hall", name: "Loboc Municipal Hall", kind: "Heritage", brgy: "Poblacion Sawang", status: "Open", hours: "Office hours", fee: "Free", desc: "Heritage building that houses the LGU offices. The Loboc Band plays here every New Year's Day.", photos: [], pub: true },
    { id: "pl-gabaldon", name: "Gabaldon Building, Loboc Central Elementary School", kind: "Heritage", brgy: "Poblacion Ondol", status: "Open", hours: "To be confirmed", fee: "Free", desc: "American-era school building whose design draws on the bahay kubo and the bahay na bato.", photos: [], pub: true },
    { id: "pl-santonino", name: "Señor Santo Niño Shrine", kind: "Heritage", brgy: "Poblacion Sawang", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Known as the oldest Señor Santo Niño shrine in Loboc.", photos: [], pub: true },
    { id: "pl-plaza", name: "Loboc Plaza (Plaza Rizal)", kind: "Tourist spot", brgy: "Poblacion Sawang", status: "Open", hours: "Open daily", fee: "Free", desc: "Public square in front of the Municipal Hall, venue of the Santa Cecilia feast and the June food fair.", photos: [], pub: true },
    { id: "pl-tourism", name: "Loboc Tourism Complex", kind: "Tourist spot", brgy: "Villaflor", status: "Open", hours: "To be confirmed", fee: "Free", desc: "LGU-owned docking port for the floating restaurants, with waiting areas and souvenir shops. Its buildings and pathways are designed for persons with disabilities.", photos: [], pub: true },
    { id: "pl-krus", name: "Krus Daku", kind: "Tourist spot", brgy: "Cambance", status: "Open", hours: "Open daily", fee: "To be confirmed", desc: "An 80-foot white cross on a hillside with a commanding view of Loboc. On Good Friday, pilgrims climb 3 km past the 14 Stations of the Cross to watch the sunrise.", guide: "Start early and bring water. Wear good walking shoes.", photos: [], pub: true },
    { id: "pl-guadalupe", name: "Birhen sa Guadalupe Statue and Shrine", kind: "Tourist spot", brgy: "Gon-ob", status: "Open", hours: "Open daily", fee: "To be confirmed", desc: "A 50-foot hilltop statue of Our Lady of Guadalupe overlooking Loboc, with a view of the sea at Loay. Popular for prayer, especially in May.", photos: [], pub: true },
    { id: "pl-busay", name: "Busay Falls", kind: "Tourist spot", brgy: "Gotozon", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Natural falls at the upper reaches of the Loboc River, between Gotozon and Jimilian.", guide: "Wear non-slip footwear. Swim only in safe areas. Bring your trash back with you.", photos: [], pub: true },
    { id: "pl-guimba", name: "Mount Guimba", kind: "Tourist spot", brgy: "Jimilian", status: "Open", hours: "Daytime", fee: "To be confirmed", desc: "One of Bohol's popular trails. The route crosses the Loboc River, and the summit looks over the river and Bohol's mountains.", guide: "Wear proper hiking gear, bring water, and check the weather before you go.", photos: [], pub: true },
    { id: "pl-forest", name: "Man-made Forest", kind: "Tourist spot", brgy: "Candabong", status: "Open", hours: "Open daily", fee: "Free", desc: "A dense stretch of mahogany trees along the national road; a cool, quiet stop on the way to the Chocolate Hills.", guide: "Park safely off the road.", photos: [], pub: true },
    { id: "pl-zoo", name: "Zoocolate Thrills", kind: "Tourist spot", brgy: "Gotozon", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Private zoo of wild and exotic animals, each kept on its own hill shaped like the Chocolate Hills.", photos: [], pub: true },
    { id: "pl-salabat", name: "Loboc Salabat Ginger Facility", kind: "Tourist spot", brgy: "Candabong", status: "Open", hours: "By appointment", fee: "To be confirmed", desc: "Ginger and turmeric processing facility of the Candabong RIC MP Cooperative, home of the award-winning Loboc Salabat. Educational tours by booking.", photos: [], pub: true },
    { id: "pl-quinoguitan", name: "Quinoguitan Parish Church", kind: "Heritage", brgy: "Quinoguitan", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Roman Catholic church that became a parish in 2000.", photos: [], pub: true },
    { id: "pl-rosario", name: "Santo Rosario Chapel", kind: "Heritage", brgy: "Calunasan Norte", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "A small old chapel.", photos: [], pub: true },
    { id: "pl-busai", name: "Busai Dream Falls", kind: "Hidden gem", brgy: "Quinoguitan", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Natural spring and falls, with an access path developed by the owner of the next lot.", guide: "Wear non-slip footwear.", photos: [], pub: true },
    { id: "pl-loctob", name: "Loctob Spring", kind: "Hidden gem", brgy: "Gotozon", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Natural basin of cold spring water from the Loboc River.", photos: [], pub: true },
    { id: "pl-jimilianspring", name: "Jimilian Spring", kind: "Hidden gem", brgy: "Jimilian", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Natural, untouched spring.", photos: [], pub: true },
    { id: "pl-guimbacave", name: "Guimba Cave", kind: "Hidden gem", brgy: "Jimilian", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Untouched natural cave near Mt. Guimba.", guide: "Go with a local guide, bring a flashlight and wear a helmet if you can.", photos: [], pub: true },
    { id: "pl-bonboncave", name: "Bonbon Upper Cave", kind: "Hidden gem", brgy: "Bonbon Upper", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Untouched natural cave in the uplands of Bonbon Upper.", guide: "Go with a local guide, bring a flashlight and wear a helmet if you can.", photos: [], pub: true },
    { id: "pl-kasampong", name: "Kasampong Cave", kind: "Hidden gem", brgy: "Buenavista", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Untouched natural cave on private land.", guide: "Ask the landowner's permission before entering.", photos: [], pub: true },
    { id: "pl-pangas", name: "Pangas Falls", kind: "Hidden gem", brgy: "Bagumbayan", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Untouched falls and spring on private land.", guide: "Ask the landowner's permission before visiting.", photos: [], pub: true },
    { id: "pl-isla", name: "Isla Eden", kind: "Hidden gem", brgy: "Tigbao", status: "Open", hours: "To be confirmed", fee: "To be confirmed", desc: "Private aquaponic farm open for agri-tourism visits.", photos: [], pub: true }
  ],

  activities: [
    { id: "ac-zip", cat: "adventure", name: "Zipline over the river", desc: "Fly across the Loboc River at the Loboc Eco-Adventure Park in Gotozon.", duration: "Short ride", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-cable", cat: "adventure", name: "Cable car ride", desc: "A slower ride across the river toward Mt. Guimba, with views of the treetops and the town.", duration: "Short ride", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-guimba", cat: "adventure", name: "Mt. Guimba trek", desc: "Cross the Loboc River and climb one of Bohol's popular trails for views of the river and the mountains.", duration: "Half day", price: "Guide fee to be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-caves", cat: "adventure", name: "Cave exploring", desc: "Untouched caves in Bonbon Upper, Jimilian (Guimba Cave), Bugho and Buenavista. Go with a local guide.", duration: "2–4 hours", price: "Guide fee to be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-krus", cat: "adventure", name: "Krus Daku climb", desc: "Climb 3 km past the 14 Stations of the Cross to the 80-foot cross in Cambance; on Good Friday pilgrims go before dawn to watch the sunrise.", duration: "2–3 hours", price: "Free", contact: "", photos: [], pub: true },
    { id: "ac-cruise", cat: "river", name: "Loboc River Cruise", desc: "Buffet on a floating restaurant with live music and balsa cultural shows, from the Tourism Docking Port in Villaflor.", duration: "About 1 hour", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-sup", cat: "river", name: "Stand-up paddleboarding", desc: "Paddle the calm river in Valladolid with operators such as Suptour, A & G Water Recreational Services, Bugsai Ta and Fox and the Firefly.", duration: "1–3 hours", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-firefly", cat: "river", name: "Firefly watching", desc: "Night river trip in Camayaan to see fireflies light up the riverbank trees.", duration: "1–2 hours", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-kayak", cat: "river", name: "Kayaking", desc: "Explore the river at your own pace from Loboc River Resort in Camayaan.", duration: "1–2 hours", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-boat", cat: "river", name: "Boat rental", desc: "Rent a boat to cruise the river at your own pace (Sarimanok Rent a Boat in Gotozon, Cool River Tourist Boat Rental in Valladolid).", duration: "Varies", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-home", cat: "home", name: "Homestay with a local family", desc: "Stay with a Lobocanon family and share home-cooked meals. See Stay, Eat and Shop for homestays.", duration: "Overnight", price: "Varies", contact: "", photos: [], pub: true },
    { id: "ac-carabao", cat: "home", name: "Carabao dishes", desc: "Try Loboc's traditional carabao dishes at Tres Hermanas in Poblacion Sawang, or kusajos and chicharon kabaw at the June food fair.", duration: "Meal", price: "Varies", contact: "", photos: [], pub: true },
    { id: "ac-salabat", cat: "home", name: "Ginger farm tour", desc: "See how the award-winning Loboc Salabat (ginger powder) and ginger candy are made in Candabong. Tours by booking.", duration: "1–2 hours", price: "To be confirmed", contact: "", photos: [], pub: true },
    { id: "ac-pasalubong", cat: "home", name: "Pasalubong and native snacks", desc: "Take home Loboc Salabat, chicharon kabaw, molido (sweet potato bar), banana chips and oven-baked Jimilian cookies.", duration: "Any time", price: "Varies", contact: "", photos: [], pub: true },
    { id: "ac-crafts", cat: "home", name: "Handicraft villages", desc: "Woven baskets in Tigbao, nipa shingles in Canlasid, candles in Gon-ob and rattan furniture in Oy.", duration: "Varies", price: "Varies", contact: "", photos: [], pub: true }
  ],

  /* Accommodations: LGU list of registered accommodations, CY 2026 (with contact numbers).
     Descriptions: TDP 2026-2028, p.46. Dining and services: TDP p.42-43, 46. Shops: LGU list of souvenir shops. */
  listings: [
    { id: "ls-southside", type: "Inn", name: "Southside Tourist Inn", brgy: "Valladolid", priceFrom: 0, desc: "Native-style inn with comfortable rooms.", amenities: "", phone: "0998 472 3545", email: "", fb: "", photos: [], pub: true },
    { id: "ls-coolriver", type: "Resort", name: "Loboc Cool River Resort", brgy: "Valladolid", priceFrom: 0, desc: "Private resort facing the Loboc River, with a restaurant and tourist boat rental.", amenities: "Restaurant, Boat rental, Riverside", phone: "0970 759 6719", email: "", fb: "", photos: [], pub: true },
    { id: "ls-foxfirefly", type: "Resort", name: "Fox and the Firefly Resort", brgy: "Valladolid", priceFrom: 0, desc: "Native cottages beside the river, with water sports such as stand-up paddling.", amenities: "Riverside, Stand-up paddling", phone: "0928 321 9792", email: "", fb: "", photos: [], pub: true },
    { id: "ls-nipahuts", type: "Lodge", name: "Bohol Nipa Huts Cottages", brgy: "Valladolid", priceFrom: 0, desc: "Nipa hut cottages beside the river.", amenities: "Riverside", phone: "0926 763 2413", email: "", fb: "", photos: [], pub: true },
    { id: "ls-waterforest", type: "Resort", name: "Water to Forest Ecoresort", brgy: "Valladolid", priceFrom: 0, desc: "Air-cooled native treehouse rooms in the forest, with sustainable river tours.", amenities: "Treehouse rooms, River tours", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "ls-lobocriver", type: "Resort", name: "Loboc River Resort", brgy: "Camayaan", priceFrom: 0, desc: "Riverside resort with a pool and restaurant; offers paddling and kayaking.", amenities: "Pool, Restaurant, Kayaking, Riverside", phone: "0917 590 5200", email: "", fb: "", photos: [], pub: true },
    { id: "ls-riversideinn", type: "Inn", name: "Loboc Riverside Inn & Restaurant", brgy: "Poblacion Sawang", priceFrom: 0, desc: "Inn and restaurant in the town center.", amenities: "Restaurant", phone: "0917 324 2217", email: "", fb: "", photos: [], pub: true },
    { id: "ls-gbu", type: "Inn", name: "GBU Bohol Loboc River Guest House", brgy: "Jimilian", priceFrom: 0, desc: "Guest house near the Loboc River.", amenities: "", phone: "0951 641 6930", email: "", fb: "", photos: [], pub: true },
    { id: "ls-andresa", type: "Homestay", name: "Andresa's Homestay", brgy: "Villaflor", priceFrom: 0, desc: "Affordable, spacious rooms in a clean, friendly home.", amenities: "", phone: "0925 762 5226", email: "", fb: "", photos: [], pub: true },
    { id: "ls-stefanie", type: "Inn", name: "Stefanie Grace Paradise Inn & Restobar", brgy: "Villaflor", priceFrom: 0, desc: "Riverside inn with a pool and restaurant.", amenities: "Pool, Restaurant, Riverside", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "ls-melie", type: "Inn", name: "Melie's Riverside", brgy: "Villaflor", priceFrom: 0, desc: "Inn with comfortable rooms by the river.", amenities: "Riverside", phone: "0926 755 1465", email: "", fb: "", photos: [], pub: true },
    { id: "ls-geras", type: "Lodge", name: "Gera's Boarding House", brgy: "Calunasan Norte", priceFrom: 0, desc: "Boarding house near the highway; long-term rentals accepted.", amenities: "Long-term stay", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "ls-villamo", type: "Inn", name: "Villamo's Inn", brgy: "Calunasan Norte", priceFrom: 0, desc: "Overnight rooms near the highway.", amenities: "", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "ls-msmountain", type: "Inn", name: "MS Mountain Inn", brgy: "Calunasan Norte", priceFrom: 0, desc: "Mountaintop inn with views of the town.", amenities: "Mountain view", phone: "0994 914 5156", email: "", fb: "", photos: [], pub: true },
    { id: "ls-element", type: "Resort", name: "Element Resort", brgy: "Calunasan Sur", priceFrom: 0, desc: "Hilltop resort with a pool and comfortable rooms.", amenities: "Pool, Hilltop view", phone: "0995 631 5593", email: "", fb: "", photos: [], pub: true },
    { id: "ls-michelina", type: "Inn", name: "Michelina Princess Guest House", brgy: "Alegria", priceFrom: 0, desc: "Two-storey guest house with views of the rice fields.", amenities: "Rice field view", phone: "0938 077 6770", email: "", fb: "", photos: [], pub: true },
    { id: "ls-mn", type: "Inn", name: "M & N Penshion House", brgy: "Alegria", priceFrom: 0, desc: "Inn with comfortable rooms.", amenities: "", phone: "0917 655 9339", email: "", fb: "", photos: [], pub: true },
    { id: "ls-racaddisson", type: "Inn", name: "Racaddisson Tourist Inn", brgy: "Alegria", priceFrom: 0, desc: "Inn with a pool, near the town's businesses.", amenities: "Pool", phone: "0929 165 0395", email: "", fb: "", photos: [], pub: true },
    { id: "ls-busai", type: "Resort", name: "Busai Dreamfalls", brgy: "Tigbao", priceFrom: 0, desc: "Registered accommodation in Tigbao.", amenities: "", phone: "0962 160 7723", email: "", fb: "", photos: [], pub: true },

    { id: "rs-cs", type: "Restaurant", name: "CS Village Resto (floating restaurant)", brgy: "Villaflor", priceFrom: 0, desc: "Floating restaurant on the Loboc River cruise.", amenities: "River cruise, Buffet, Live music", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-longriver", type: "Restaurant", name: "Long River Cruise and Floating Restaurant", brgy: "Poblacion Ondol", priceFrom: 0, desc: "Floating restaurant and boat builder on the Loboc River.", amenities: "River cruise, Buffet", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-oneamore", type: "Restaurant", name: "One Amore Cruises", brgy: "Villaflor", priceFrom: 0, desc: "Floating restaurant on the Loboc River cruise.", amenities: "River cruise, Buffet", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-riverwatch", type: "Restaurant", name: "Riverwatch Floating Restaurant", brgy: "Villaflor", priceFrom: 0, desc: "Floating restaurant on the Loboc River cruise.", amenities: "River cruise, Buffet", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-treshermanas", type: "Restaurant", name: "Tres Hermanas", brgy: "Poblacion Sawang", priceFrom: 0, desc: "Well-known town restaurant that specializes in traditional carabao dishes.", amenities: "Local food", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-sarimanok", type: "Restaurant", name: "Sarimanok Inn & Restaurant", brgy: "Gotozon", priceFrom: 0, desc: "Restaurant serving local cuisine.", amenities: "Local food", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-lbbistro", type: "Restaurant", name: "LB Travellers Inn & Bistro", brgy: "Poblacion Sawang", priceFrom: 0, desc: "Café and restaurant in the town center.", amenities: "Café", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-ocho", type: "Restaurant", name: "Ocho Food Stop", brgy: "Jimilian", priceFrom: 0, desc: "Local restaurant.", amenities: "", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-aninaw", type: "Restaurant", name: "Aninaw Café", brgy: "Gotozon", priceFrom: 0, desc: "Café.", amenities: "Coffee", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-beanberry", type: "Restaurant", name: "Bean & Berry Loboc Café", brgy: "Poblacion Ondol", priceFrom: 0, desc: "Café.", amenities: "Coffee", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-amando", type: "Restaurant", name: "Café Amando", brgy: "Jimilian", priceFrom: 0, desc: "Café.", amenities: "Coffee", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-beansriver", type: "Restaurant", name: "Beans & River Coffee Shop", brgy: "Villaflor", priceFrom: 0, desc: "Coffee shop near the river.", amenities: "Coffee", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "rs-ilawd", type: "Restaurant", name: "Cafe Ilawd", brgy: "Valladolid", priceFrom: 0, desc: "Resto bar.", amenities: "", phone: "", email: "", fb: "", photos: [], pub: true },

    { id: "sh-wk4j30", type: "Souvenir shop", name: "WK-4J-30 Souvenir Shop", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs", phone: "0920 612 3731", email: "", fb: "", photos: [], pub: true },
    { id: "sh-aproniana", type: "Souvenir shop", name: "Aproniana Giftshop", brgy: "Villaflor", priceFrom: 0, desc: "Gift shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs, Gifts", phone: "0917 501 9950", email: "", fb: "", photos: [], pub: true },
    { id: "sh-bohowonders", type: "Souvenir shop", name: "Bohol Wonders Souvenir Shop", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs", phone: "0963 645 8376", email: "", fb: "", photos: [], pub: true },
    { id: "sh-island", type: "Souvenir shop", name: "Island Souvenirs", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs, Shirts", phone: "0927 625 6354", email: "", fb: "", photos: [], pub: true },
    { id: "sh-crissander", type: "Souvenir shop", name: "Crissander Enterprises", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs", phone: "0948 107 1744", email: "", fb: "", photos: [], pub: true },
    { id: "sh-db", type: "Souvenir shop", name: "DB Souvenir Shop", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sh-odette", type: "Souvenir shop", name: "Odette Souvenir Shop", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs", phone: "0938 948 8322", email: "", fb: "", photos: [], pub: true },
    { id: "sh-ij", type: "Souvenir shop", name: "IJ Garments", brgy: "Villaflor", priceFrom: 0, desc: "Garments and souvenirs at the Exit Building of the Loboc Tourism Complex.", amenities: "Shirts, Garments", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sh-babafrankie", type: "Souvenir shop", name: "Baba N Frankie", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs", phone: "0951 233 4001", email: "", fb: "", photos: [], pub: true },
    { id: "sh-enzo", type: "Souvenir shop", name: "Enzo Souvenir Shop", brgy: "Villaflor", priceFrom: 0, desc: "Souvenir shop at the Exit Building of the Loboc Tourism Complex.", amenities: "Souvenirs", phone: "0917 501 9950", email: "", fb: "", photos: [], pub: true },

    { id: "sv-suptour", type: "Service", name: "Suptour Stand Up Paddling", brgy: "Valladolid", priceFrom: 0, desc: "Stand-up paddling tours on the Loboc River.", amenities: "Stand-up paddling, River tours", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sv-ag", type: "Service", name: "A & G Water Recreational Services", brgy: "Valladolid", priceFrom: 0, desc: "Stand-up paddling and water recreation.", amenities: "Stand-up paddling", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sv-bugsai", type: "Service", name: "Bugsai Ta Water Recreational Services", brgy: "Valladolid", priceFrom: 0, desc: "Stand-up paddling and water recreation.", amenities: "Stand-up paddling", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sv-firefly", type: "Service", name: "Loboc River Watersports and Firefly Watching", brgy: "Camayaan", priceFrom: 0, desc: "Stand-up paddling, boat rental and night-time firefly watching.", amenities: "Firefly watching, Stand-up paddling, Boat rental", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sv-sarimanokboat", type: "Service", name: "Sarimanok Rent a Boat", brgy: "Gotozon", priceFrom: 0, desc: "Boat rental for cruising the Loboc River.", amenities: "Boat rental", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sv-bamboogakz", type: "Service", name: "Bamboo Gakz River Safari", brgy: "Tigbao", priceFrom: 0, desc: "River safari tours.", amenities: "River tours", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sv-hanseph", type: "Service", name: "Hanseph's Rides", brgy: "Valladolid", priceFrom: 0, desc: "Motorbike rental.", amenities: "Motorbike rental", phone: "", email: "", fb: "", photos: [], pub: true },
    { id: "sv-jmyles", type: "Service", name: "Jmyles Motorcycle Rental", brgy: "Villaflor", priceFrom: 0, desc: "Motorbike rental.", amenities: "Motorbike rental", phone: "", email: "", fb: "", photos: [], pub: true }
  ],

  guides: [
    { id: "gd-1", name: "Tour guide name", phone: "09XX-XXX-XXXX", languages: "Cebuano, Filipino, English", accNo: "To be confirmed", photos: [], pub: true },
    { id: "gd-2", name: "Tour guide name", phone: "09XX-XXX-XXXX", languages: "Cebuano, English", accNo: "To be confirmed", photos: [], pub: true }
  ],

  hotlines: [
    { id: "ht-911", name: "National Emergency Hotline", number: "911", note: "Police, fire, medical", order: 1 },
    { id: "ht-mdrrmo", name: "Loboc MDRRMO", number: "09XX-XXX-XXXX", note: "To be confirmed", order: 2 },
    { id: "ht-pnp", name: "PNP Loboc", number: "09XX-XXX-XXXX", note: "To be confirmed", order: 3 },
    { id: "ht-bfp", name: "BFP Loboc (Fire)", number: "09XX-XXX-XXXX", note: "To be confirmed", order: 4 },
    { id: "ht-rhu", name: "Loboc Primary Care Facility (Rural Health Unit)", number: "09XX-XXX-XXXX", note: "Poblacion Sawang. Free LGU ambulance for emergencies. Number to be confirmed.", order: 5 },
    { id: "ht-tour", name: "Tourism Office", number: "09XX-XXX-XXXX", note: "To be confirmed", order: 6 }
  ],

  transport: [
    { id: "tr-1", title: "From Tagbilaran City", desc: "Loboc is 24 km northeast of Tagbilaran, about 35 minutes by road. Jeepneys on the Tagbilaran–Loay–Loboc route leave about every 15 minutes, and buses on the Loay interior road about every hour. You can also hire a van or taxi. Fares to be confirmed.", order: 1 },
    { id: "tr-2", title: "From the airport or seaport", desc: "From Bohol-Panglao International Airport or the Tagbilaran seaport, hire a van or taxi to Loboc via Baclayon or Corella. Many countryside tours stop at Loboc on the way to the Chocolate Hills in Carmen.", order: 2 },
    { id: "tr-3", title: "From other towns", desc: "National roads link Loboc to Tubigon via Carmen, Jagna via Loay, and Ubay via Trinidad or Alicia.", order: 3 },
    { id: "tr-4", title: "Getting around Loboc", desc: "Habal-habal (motorcycle taxis) are the most common way to reach the barangays. Tricycles, V-hires and jeepneys run from early morning until evening. There is no formal terminal; jeepneys and habal-habal wait in Poblacion Ondol and Villaflor. Agree on the fare before the ride.", order: 4 }
  ],

  access: [
    { id: "ax-bf", kind: "breastfeeding", name: "Breastfeeding Station", location: "Loboc Tourism Complex", desc: "Private, clean room for nursing mothers. Ask the information desk (to be confirmed).", order: 1 },
    { id: "ax-ramp", kind: "pwd", name: "Accessible buildings and pathways", location: "Loboc Tourism Complex", desc: "The complex's buildings and pathways are designed for persons with disabilities.", order: 2 },
    { id: "ax-cr", kind: "restroom", name: "Accessible restroom", location: "Loboc Tourism Complex", desc: "PWD-friendly restroom (to be confirmed).", order: 3 },
    { id: "ax-lane", kind: "priority", name: "Priority lane", location: "River cruise port", desc: "For seniors, PWDs and pregnant women (to be confirmed).", order: 4 }
  ],

  /* Festival calendar: TDP 2026-2028, p.75-78. Movable dates are marked so visitors are told to confirm. */
  events: [
    { id: "ev-cecilia", title: "Feast of Santa Cecilia", type: "culture", date: "2026-11-22", time: "", venue: "Loboc Plaza", desc: "Feast of the patroness of music. The Loboc Band opens with the Jornada, followed by choirs, rondallas, drum-and-lyre groups, the Loboc Children's Choir and the Loboc Youth Ambassador's Band.", movable: false },
    { id: "ev-gallo", title: "Misa de Gallo begins", type: "church", date: "2026-12-16", time: "", venue: "San Pedro Apostol Church", desc: "Nine days of dawn Masses with Latin hymns and Spanish villancicos, until December 24.", movable: false },
    { id: "ev-calenda", title: "Calenda", type: "church", date: "2026-12-24", time: "", venue: "San Pedro Apostol Church", desc: "The 'Januarii Octavo Calenda' is chanted in Visayan plainsong by a teenage boy, a rite of passage into the Loboc Band since the 1870s.", movable: false },
    { id: "ev-suroy", title: "Suroy sa Musikero begins", type: "culture", date: "2026-12-25", time: "", venue: "Barangays of Loboc", desc: "The Loboc Band starts 40 days of house-to-house caroling, until February 2.", movable: false },
    { id: "ev-xmas", title: "Christmas Day", type: "holiday", date: "2026-12-25", time: "", venue: "", desc: "Public holiday.", movable: false },
    { id: "ev-ny", title: "New Year's Day", type: "holiday", date: "2027-01-01", time: "", venue: "Loboc Municipal Hall", desc: "Public holiday. The Loboc Band visits the Municipal Hall as part of Suroy sa Musikero.", movable: false },
    { id: "ev-gf", title: "Good Friday pilgrimage to Krus Daku", type: "church", date: "2027-03-26", time: "", venue: "Krus Daku, Cambance", desc: "Pilgrims climb past the 14 Stations of the Cross before dawn to watch the sunrise from the cross.", movable: true },
    { id: "ev-hugos", title: "Hugos", type: "church", date: "2027-03-28", time: "", venue: "San Pedro Apostol Church", desc: "Easter dawn re-enactment of the meeting of the Risen Christ and Mary; a child 'angel' is lowered from the church arch singing the Regina Caeli.", movable: true },
    { id: "ev-flores", title: "Flores de Mayo", type: "church", date: "2027-05-01", time: "", venue: "San Pedro Apostol Church", desc: "Daily flower offerings to the Virgin Mary throughout May, ending with a procession.", movable: false },
    { id: "ev-suba", title: "Suba Festival", type: "fiesta", date: "2027-05-18", time: "", venue: "Loboc River", desc: "Celebration of the Loboc River with a fluvial parade, swimming, kayaking and paddle boat contests. Date to be confirmed with the Tourism Office.", movable: true },
    { id: "ev-bolibong", title: "Bolibongkingking Festival", type: "fiesta", date: "2027-05-19", time: "", venue: "JAD Cultural Complex", desc: "Barangays compete in street dancing and dance-drama to the beat of drums and gongs. Date to be confirmed with the Tourism Office.", movable: true },
    { id: "ev-guadalupe", title: "Fiesta of Our Lady of Guadalupe and Sambat", type: "fiesta", date: "2027-05-24", time: "", venue: "San Pedro Apostol Church and the Loboc River", desc: "Thanksgiving fiesta after a nine-day novena, with the Sambat fluvial procession on the river in the afternoon.", movable: false },
    { id: "ev-foodfair", title: "Fiesta Food Fair", type: "fiesta", date: "2027-06-20", time: "", venue: "Loboc Plaza and JAD Cultural Complex", desc: "Local vendors sell food and drinks, including kusajos kabaw and chicharon kabaw, until June 29.", movable: false },
    { id: "ev-stpeter", title: "Fiesta of St. Peter the Apostle and Sambat", type: "fiesta", date: "2027-06-29", time: "", venue: "Poblacion", desc: "Main town fiesta: novena, nightly music and dance, the 'altares' at the church's four doors, and the Sambat river procession.", movable: false },
    { id: "ev-foundation", title: "Foundation Day celebration", type: "culture", date: "2027-07-10", time: "", venue: "JAD Cultural Complex", desc: "Foundation Day is June 30 and is celebrated on the 2nd Saturday of July, highlighted by the Drum and Lyre Showdown.", movable: true }
  ],


  news: [
    { id: "nw-1", type: "Announcement", title: "Welcome to the new DiscoverLubok website", body: "This is a sample announcement. The PIO can post, edit, pin and archive news and announcements from the dashboard.", date: "2026-10-08", pinned: true, expires: "", status: "Published", cover: "", author: "PIO" },
    { id: "nw-2", type: "News", title: "Sample news story", body: "News stories appear here with a cover photo. Replace this sample in the PIO dashboard.", date: "2026-10-05", pinned: false, expires: "", status: "Published", cover: "", author: "PIO" }
  ],

  /* Officials: LGU list of municipal officials, barangay captains and SK chairpersons. */
  officials: [
    { id: "of-mayor", group: "municipal", role: "Municipal Mayor", name: "Hon. Raymond G. Jala", office: "", brgy: "", term: "2025–2028", photos: [], order: 1 },
    { id: "of-vmayor", group: "municipal", role: "Municipal Vice Mayor", name: "Hon. Helen C. Alaba", office: "", brgy: "", term: "2025–2028", photos: [], order: 2 },
    ...["Hon. Efren B. Mandin", "Atty. Jansyl Lovan P. Tumanda", "Hon. Wenster C. Dango", "Hon. Asterio B. Calacar", "Hon. Rose Katherine D. Odal", "Hon. Nerea T. Saranillo", "Hon. Marylou B. Ampoloquio", "Hon. Alexander B. Zafra, Jr."]
      .map((name, i) => ({ id: "of-sb" + (i + 1), group: "sb", role: "Sangguniang Bayan Member", name, office: "", brgy: "", term: "2025–2028", photos: [], order: 10 + i })),
    { id: "of-sb-abc", group: "sb", role: "Sangguniang Bayan Member (ex officio)", name: "Hon. Alex L. Mandin", office: "Liga ng mga Barangay (ABC) President", brgy: "", term: "", photos: [], order: 18 },
    { id: "of-sb-sk", group: "sb", role: "Sangguniang Bayan Member (ex officio)", name: "Hon. Myka J. Cempron", office: "SK Federation President", brgy: "", term: "", photos: [], order: 19 },
    ...[
      ["Municipal Administrator","Office of the Municipal Administrator"],
      ["Municipal Planning and Development Coordinator","MPDO"],
      ["Municipal Treasurer","Municipal Treasurer's Office"],
      ["Municipal Accountant","Municipal Accounting Office"],
      ["Municipal Budget Officer","Municipal Budget Office"],
      ["Municipal Assessor","Municipal Assessor's Office"],
      ["Municipal Civil Registrar","Local Civil Registry Office"],
      ["Municipal Engineer","Municipal Engineering Office"],
      ["Municipal Health Officer","Rural Health Unit"],
      ["Municipal Social Welfare and Development Officer","MSWDO"],
      ["Municipal Agriculturist","Municipal Agriculture Office"],
      ["MDRRM Officer","MDRRMO"],
      ["Municipal Tourism Officer","Municipal Tourism Office"],
      ["Human Resource Management Officer","HRMO"]
    ].map(([role, office], i) => ({ id: "of-dh" + (i + 1), group: "department", role: "Department Head", name: "", office: office + " · " + role, brgy: "", term: "", photos: [], order: 30 + i })),
    ...Object.entries({
      "Agape": ["Hon. Conchita G. Caberte", "Hon. Mercy Grace A. Labajos"],
      "Alegria": ["Hon. Jernigal G. Cempron", "Hon. Myka J. Cempron"],
      "Bagumbayan": ["Hon. Vanrico B. Marfe", "Hon. Aljie S. Salig"],
      "Bahian": ["Hon. Leonario M. Baguio", "Hon. John Carlo C. Baguio"],
      "Bonbon Lower": ["Hon. Isabel C. Dapitilla", "Hon. Grace B. Quiao"],
      "Bonbon Upper": ["Hon. Jenny R. Palarao", "Hon. Christopher Jan D. Legaspi"],
      "Buenavista": ["Hon. Yolando C. Magallen", "Hon. Honey Rose T. Balog"],
      "Bugho": ["Hon. Genaro O. Wenceslao", "Hon. Rowena P. Bato-on"],
      "Cabadiangan": ["Hon. Virgilia T. Cornito", "Hon. Ethyl Lou T. Tumanda"],
      "Calunasan Norte": ["Hon. Angelo L. Maghuyop", "Hon. Nicka R. Aliwanag"],
      "Calunasan Sur": ["Hon. Rosemar Aian S. Tumala", "Hon. Aldrin M. Baslote"],
      "Camayaan": ["Hon. Rodulfo J. Baluran", "Hon. Jericha B. Vega"],
      "Cambance": ["Hon. Alberto P. Tuba", "Hon. Roger A. Budiongan"],
      "Candabong": ["Hon. Placido B. Alambatin", "Hon. Patrick James Kate B. Lee"],
      "Candasag": ["Hon. Arnold I. Bualat", "Hon. Babylin Marie B. Fuertes"],
      "Canlasid": ["Hon. Josephine L. Matildo", "Hon. Tommy Merca Jr."],
      "Gon-ob": ["Hon. Gaudencio Tuba", "Hon. Melvin Berenguer"],
      "Gotozon": ["Hon. Susan B. Digamon", "Hon. Karen Mae O. Cerino"],
      "Jimilian": ["Hon. Virgilio V. Sarigumba", "Hon. Rey Adrianne T. Abaya"],
      "Oy": ["Hon. Marcelo C. Oracion", "Hon. Mia T. Biloy"],
      "Poblacion Ondol": ["Hon. Rosendo S. Maquindang", "Hon. Leelord J. Calipusan"],
      "Poblacion Sawang": ["Hon. Orlando D. Sarigumba", "Hon. Linus Q. Digal"],
      "Quinoguitan": ["Hon. Cristita L. Orillo", "Hon. Jayrald C. Tac-an"],
      "Taytay": ["Hon. Alex L. Mandin", "Hon. Jessel B. Anino"],
      "Tigbao": ["Hon. Narnel G. Jamoner", "Hon. Rae Javier J. Man-on"],
      "Ugpong": ["Hon. Teodosio A. Bucog", "Hon. Murphie Edil D. Berenguer"],
      "Valladolid": ["Hon. Pedro M. Acuña", "Hon. Angeline T. Odal"],
      "Villaflor": ["Hon. Lemuel L. Digal", "Hon. Gregg T. Jimenez"]
    }).flatMap(([brgy, [cap, sk]], i) => [
      { id: "of-pb" + (i + 1), group: "barangay", role: "Punong Barangay", name: cap, office: "", brgy, term: "", photos: [], order: 100 + i * 2 },
      { id: "of-sk" + (i + 1), group: "barangay", role: "SK Chairperson", name: sk, office: "", brgy, term: "", photos: [], order: 101 + i * 2 }
    ])
  ],

  faqs: [
    { id: "fq-1", q: "How do I get to Loboc?", a: "Loboc is 24 km northeast of Tagbilaran City, about 35 minutes by road. Jeepneys on the Tagbilaran–Loay–Loboc route leave about every 15 minutes, and buses about every hour. You can also hire a van or taxi. See the Visitor Guide for details.", order: 1 },
    { id: "fq-2", q: "Is there an entrance fee?", a: "The river cruise, the Eco-Adventure Park and some falls and resorts have their own fees (to be confirmed with the Tourism Office).", order: 2 },
    { id: "fq-5", q: "How do I pay for the river cruise?", a: "The river cruise accepts cash and GCash.", order: 3 },
    { id: "fq-3", q: "When is the best time to visit?", a: "The dry months (roughly December to May) are best for river and waterfall trips. The zipline and cable car stop during moderate and heavy rain. Check the Calendar for fiestas in May and June.", order: 4 },
    { id: "fq-4", q: "Are there facilities for PWDs and nursing mothers?", a: "Yes. The Loboc Tourism Complex buildings and pathways are designed for persons with disabilities. See Visitor Guide > Accessibility.", order: 5 }
  ],

  gallery: ["Church","River","Choir","Falls","Weaving","Bamboo crafts","Local food","Market"].map((t, i) => ({ id: "ga-" + (i + 1), title: t, photos: [], order: i + 1 })),

  heritage: {
    established: [["Established","June 29, 1597"],["Founder","Fr. Juan de Torres, S.J."],["Patron","St. Peter · feast day June 29"],["Authority","Doña Catalina de Bolaños, encomiendera"]],
    meaning: "<i>Loboc</i> or <i>lubok</i> means a deep portion of a river where people went to hide, especially from pirate attacks.",
    steps: [
      "Jesuit priests Fr. Gabriel Sanchez and Fr. Juan de Torres arrived in Baclayon, Bohol on November 17, 1596.",
      "Barely six months later, Fr. Torres entered the Loboc River with Chief Juan Batto of Hinawanan, Loay, together with his wife and servants. They anchored at a deep, wide part of the river.",
      "Six local chiefs met them. They were sarcastic and did not want to become Christians, but Fr. Torres befriended them with food, drinks and gifts.",
      "The chiefs then helped him build a wooden church and convent near the riverbank.",
      "The church was dedicated to St. Peter, the Prince of the Apostles. St. Peter's day is June 29, so the church is counted as finished on June 29, 1597.",
      "Fr. Torres gathered almost 3,000 Lobocanons to live in and around the church and appointed an alguacil (constable) to keep order."
    ],
    decree: "No law or decree created the town of Loboc. It was established by Fr. Juan de Torres on June 29, 1597, under the authority of Doña Catalina de Bolaños, the encomiendera assigned to Bohol.",
    timeline: [
      ["1597","The Arrival","Jesuit missionary Fr. Juan de Torres entered the Loboc River valley and established the first inland Catholic mission."],
      ["1602","Foundation","Loboc was formally founded as a municipality and canonical parish under the patronage of San Pedro Apóstol. After a Moro raid on Baclayon in 1600, the Jesuits had moved their mission center to Loboc.",1],
      ["1604","Musical Heritage Genesis","The Jesuits founded the Seminario-Colegio, a boarding school for native boys. It set the choral and classical music roots that earned Loboc the title Music Capital of Bohol."],
      ["1734","Coral Stone Church","The present coral-stone baroque San Pedro Apóstol Church was completed after earlier structures burned down."],
      ["1768","The Recollect Administration","The Augustinian Recollects took over and later added the bell tower, arcade facade, stone buttresses and three-storey convent."],
      ["1843","Our Lady of Guadalupe","The image of Our Lady of Guadalupe arrived on May 24, 1843, during a cholera epidemic. The epidemic eased after a river procession, and May 24 became the town's thanksgiving fiesta."],
      ["1851","The Bell Tower","The free-standing bell tower across the street from the church was built."],
      ["1871","The Loboc Band","The Loboc Band was formed, keeping alive the Suroy sa Musikero caroling and the Calenda chant."],
      ["1876","The Great Flood","On November 26, 1876, a great flood reached the church altar but stopped at the base of the image of Our Lady of Guadalupe. The miracle is painted on the church ceiling."],
      ["1942–1945","World War II & Liberation","Loboc served as the provincial capital and headquarters. Japanese troops occupied the town in 1942 until Boholano guerrillas and Allied forces liberated it in 1945."],
      ["1993","The Loboc Children's Choir","The Loboc Children's Choir won the national NAMCYA championship (again in 1995 and 2001) and later took the gold medal and Festival Cup in Barcelona, Spain."],
      ["2013–2021","Earthquake & Restoration","The 7.2-magnitude earthquake brought down the facade and bell tower on October 15, 2013. The church reopened on May 16, 2021 after restoration led by the National Museum."],
      ["2021","Typhoon Odette","Super Typhoon Odette flooded Loboc on December 16, 2021. As in 1876, the floodwaters did not reach the image of Our Lady of Guadalupe."]
    ]
  }
};

/* Barangay profiles: population (2024 CBMS), land area and boundary (LGU shapefile, js/loboc-shapes.js). */
window.LOBOC_SEED.brgys = window.LOBOC_SEED.barangays.map((name, i) => {
  const sh = (window.LOBOC_SHAPES || {})[name], pop = window.LOBOC_SEED.population[name];
  return { id: "bg-" + (i + 1), name, pop: pop || "", popNote: pop ? "2024 CBMS, PSA" : "", area: sh ? sh.area : "", desc: "", photos: [], order: i + 1,
    boundary: sh ? { type: "Feature", properties: { name }, geometry: sh.geometry } : null };
});

/* Heritage timeline entries (editable in Admin > Heritage timeline). */
window.LOBOC_SEED.timeline = window.LOBOC_SEED.heritage.timeline.map((t, i) => ({ id: "tl-" + (i + 1), year: t[0], title: t[1], text: t[2], anchor: !!t[3], photos: [], order: i + 1 }));
