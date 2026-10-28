/**
 * B2B DATA GLOBAL LLC — Events Database & Search Engine
 */

window.B2B_EVENTS_DATA = [
  { id: "e1", name: "Lift Expo Poland 2026", attendees: 4200, exhibitors: 180, start: "2026-10-14", end: "2026-10-16", venue: "Ptak Warsaw Expo", city: "Warsaw", country: "Poland", industry: "Manufacturing", kind: "Trade Show", price: 320, featured: true },
  { id: "e2", name: "Barcelona Textile Expo 2026", attendees: 5300, exhibitors: 210, start: "2026-10-07", end: "2026-10-09", venue: "Fira Barcelona", city: "Barcelona", country: "Spain", industry: "Textile", kind: "Trade Show", price: 380, featured: true },
  { id: "e3", name: "HR Southwest Conference 2026", attendees: 3100, exhibitors: 140, start: "2026-10-19", end: "2026-10-21", venue: "Fort Worth Convention Center", city: "Fort Worth", country: "USA", industry: "Business", kind: "Conference", price: 290, featured: true },
  { id: "e4", name: "BrauBeviale 2026", attendees: 7800, exhibitors: 360, start: "2026-11-10", end: "2026-11-12", venue: "Messezentrum Nuremberg", city: "Nuremberg", country: "Germany", industry: "Food & Beverages", kind: "Trade Show", price: 440, featured: true },
  { id: "e5", name: "Money20/20 USA 2026", attendees: 11500, exhibitors: 450, start: "2026-10-25", end: "2026-10-28", venue: "The Venetian", city: "Las Vegas", country: "USA", industry: "Financial", kind: "Trade Show", price: 650, featured: true },
  { id: "e6", name: "TechSummit Asia 2027", attendees: 4820, exhibitors: 117, start: "2027-03-09", end: "2027-03-11", venue: "Marina Bay Sands Expo", city: "Singapore", country: "Singapore", industry: "Technology", kind: "Conference", price: 390, featured: true },
  { id: "e7", name: "MedExpo Sydney 2027", attendees: 2340, exhibitors: 88, start: "2027-05-18", end: "2027-05-20", venue: "ICC Sydney", city: "Sydney", country: "Australia", industry: "Healthcare", kind: "Conference", price: 210, featured: true },
  { id: "e8", name: "BuildCon Dubai 2027", attendees: 5610, exhibitors: 210, start: "2027-11-02", end: "2027-11-05", venue: "Dubai World Trade Centre", city: "Dubai", country: "UAE", industry: "Construction", kind: "Trade Show", price: 420, featured: true },
  { id: "e9", name: "International Industrial Fair", attendees: 8400, exhibitors: 310, start: "2026-10-05", end: "2026-10-08", venue: "Brno Exhibition Centre", city: "Brno", country: "Czech Republic", industry: "Manufacturing", kind: "Tradeshow", price: 350, featured: false },
  { id: "e10", name: "Paris Banking Conference", attendees: 1850, exhibitors: 65, start: "2026-10-05", end: "2026-10-05", venue: "Palais Brongniart", city: "Paris", country: "France", industry: "Financial", kind: "Conference", price: 220, featured: false },
  { id: "e11", name: "World Health Summit", attendees: 4100, exhibitors: 120, start: "2026-10-10", end: "2026-10-12", venue: "Berlin Congress Center", city: "Berlin", country: "Germany", industry: "Healthcare", kind: "Conference", price: 340, featured: true },
  { id: "e12", name: "European Week of Regions and Cities", attendees: 6200, exhibitors: 190, start: "2026-10-11", end: "2026-10-13", venue: "Square Brussels", city: "Brussels", country: "Belgium", industry: "Business", kind: "Conference", price: 280, featured: false },
  { id: "e13", name: "Annual Cyber Security Summit", attendees: 3400, exhibitors: 110, start: "2026-10-13", end: "2026-10-14", venue: "Station Berlin", city: "Berlin", country: "Germany", industry: "Technology", kind: "Conference", price: 310, featured: false },
  { id: "e14", name: "IoT Tech Expo Europe", attendees: 7200, exhibitors: 240, start: "2026-10-18", end: "2026-10-19", venue: "RAI Amsterdam", city: "Amsterdam", country: "Netherlands", industry: "Technology", kind: "Tradeshow", price: 420, featured: true },
  { id: "e15", name: "Web Summit Lisbon", attendees: 71000, exhibitors: 2600, start: "2026-11-08", end: "2026-11-11", venue: "Altice Arena", city: "Lisbon", country: "Portugal", industry: "Technology", kind: "Conference", price: 890, featured: true },
  { id: "e16", name: "Offshore Energy Exhibition", attendees: 9500, exhibitors: 410, start: "2026-11-23", end: "2026-11-24", venue: "RAI Amsterdam", city: "Amsterdam", country: "Netherlands", industry: "Construction", kind: "Tradeshow", price: 450, featured: true },
  { id: "e17", name: "Big Data Conference Europe", attendees: 2900, exhibitors: 95, start: "2026-11-24", end: "2026-11-26", venue: "Vilnius Radisson", city: "Vilnius", country: "Lithuania", industry: "Technology", kind: "Conference", price: 290, featured: true }
];

window.B2B_SEARCH = {
  search(query, industry) {
    const q = (query || '').trim().toLowerCase();
    return window.B2B_EVENTS_DATA.filter(ev => {
      const matchQ = !q ||
        ev.name.toLowerCase().includes(q) ||
        ev.city.toLowerCase().includes(q) ||
        ev.country.toLowerCase().includes(q) ||
        ev.industry.toLowerCase().includes(q);
      const matchInd = !industry || industry === 'All' || ev.industry === industry;
      return matchQ && matchInd;
    });
  }
};
