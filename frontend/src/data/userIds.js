// User IDs and email mapping for frontend reference
export const USER_IDS = {
  "kavitasarapali50@gmail.com": "000000000000000000000000",
  "shruthirpm26@gmail.com": "000000000000000000000001", 
  "sanathnayak733@gmail.com": "000000000000000000000002",
  "saraswathisutaclasses@gmail.com": "000000000000000000000003",
  "spiritualyatras6@gmail.com": "000000000000000000000004",
  "seemaf1504@gmail.com": "000000000000000000000005",
  "krishspider@gmail.com": "000000000000000000000006"
};

export const USER_EMAILS = {
  "000000000000000000000000": "kavitasarapali50@gmail.com",
  "000000000000000000000001": "shruthirpm26@gmail.com",
  "000000000000000000000002": "sanathnayak733@gmail.com", 
  "000000000000000000000003": "saraswathisutaclasses@gmail.com",
  "000000000000000000000004": "spiritualyatras6@gmail.com",
  "000000000000000000000005": "seemaf1504@gmail.com",
  "000000000000000000000006": "krishspider@gmail.com"
};

export const USER_NAMES = {
  "000000000000000000000000": "Kavita Sarapali",
  "000000000000000000000001": "Shruthi RPM",
  "000000000000000000000002": "Sanath Nayak",
  "000000000000000000000003": "Saraswathi Suta", 
  "000000000000000000000004": "Spiritual Yatras",
  "000000000000000000000005": "Seema F",
  "000000000000000000000006": "Krish Spider"
};

// Helper function to get user info by ID
export const getUserInfo = (userId) => ({
  id: userId,
  email: USER_EMAILS[userId] || 'Unknown',
  name: USER_NAMES[userId] || 'Unknown User'
});

// Helper function to get user ID by email
export const getUserIdByEmail = (email) => USER_IDS[email] || null;
