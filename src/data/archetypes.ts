// Culturally consistent Indian community archetypes
export interface Archetype {
  id: string;
  religion: string;
  community: string;
  surnamesM: string[];
  surnamesF: string[];
  cities: { city: string; state: string }[];
  languages: string[];
  diet: string;
  familyType: string;
  familyStatus: string;
}

export const archetypes: Archetype[] = [
  {
    id: 'gujarati_jain',
    religion: 'Jain',
    community: 'Jain Gujarati',
    surnamesM: ['Shah', 'Mehta', 'Sanghvi', 'Doshi', 'Parekh'],
    surnamesF: ['Shah', 'Mehta', 'Sanghvi', 'Doshi', 'Parekh'],
    cities: [
      { city: 'Ahmedabad', state: 'Gujarat' },
      { city: 'Surat', state: 'Gujarat' },
      { city: 'Mumbai', state: 'Maharashtra' },
    ],
    languages: ['Gujarati', 'Hindi', 'English'],
    diet: 'Jain Vegetarian',
    familyType: 'Joint Family',
    familyStatus: 'Upper Middle Class',
  },
  {
    id: 'gujarati_patel',
    religion: 'Hindu',
    community: 'Patidar',
    surnamesM: ['Patel', 'Desai', 'Amin'],
    surnamesF: ['Patel', 'Desai', 'Amin'],
    cities: [
      { city: 'Ahmedabad', state: 'Gujarat' },
      { city: 'Vadodara', state: 'Gujarat' },
      { city: 'Surat', state: 'Gujarat' },
    ],
    languages: ['Gujarati', 'Hindi', 'English'],
    diet: 'Vegetarian',
    familyType: 'Joint Family',
    familyStatus: 'Upper Middle Class',
  },
  {
    id: 'punjabi_sikh',
    religion: 'Sikh',
    community: 'Sikh Punjabi',
    surnamesM: ['Singh', 'Brar', 'Gill', 'Sandhu', 'Dhillon'],
    surnamesF: ['Kaur', 'Brar', 'Gill', 'Sandhu', 'Dhillon'],
    cities: [
      { city: 'Chandigarh', state: 'Punjab' },
      { city: 'Ludhiana', state: 'Punjab' },
      { city: 'Delhi', state: 'NCR' },
    ],
    languages: ['Punjabi', 'Hindi', 'English'],
    diet: 'Non-Vegetarian',
    familyType: 'Nuclear Family',
    familyStatus: 'Affluent',
  },
  {
    id: 'hindi_belt',
    religion: 'Hindu',
    community: 'Brahmin',
    surnamesM: ['Sharma', 'Mishra', 'Pandey', 'Tiwari', 'Dubey'],
    surnamesF: ['Sharma', 'Mishra', 'Pandey', 'Tiwari', 'Dubey'],
    cities: [
      { city: 'Delhi', state: 'NCR' },
      { city: 'Gurgaon', state: 'Haryana' },
      { city: 'Noida', state: 'Uttar Pradesh' },
      { city: 'Jaipur', state: 'Rajasthan' },
    ],
    languages: ['Hindi', 'English'],
    diet: 'Vegetarian',
    familyType: 'Nuclear Family',
    familyStatus: 'Middle Class',
  },
  {
    id: 'marwari',
    religion: 'Hindu',
    community: 'Marwari',
    surnamesM: ['Agarwal', 'Gupta', 'Mittal', 'Bajaj', 'Goenka'],
    surnamesF: ['Agarwal', 'Gupta', 'Mittal', 'Bajaj', 'Goenka'],
    cities: [
      { city: 'Delhi', state: 'NCR' },
      { city: 'Kolkata', state: 'West Bengal' },
      { city: 'Indore', state: 'Madhya Pradesh' },
      { city: 'Jaipur', state: 'Rajasthan' },
    ],
    languages: ['Hindi', 'Marwari', 'English'],
    diet: 'Vegetarian',
    familyType: 'Joint Family',
    familyStatus: 'Affluent',
  },
  {
    id: 'rajput',
    religion: 'Hindu',
    community: 'Rajput',
    surnamesM: ['Rathore', 'Chauhan', 'Shekhawat', 'Sisodia', 'Singh'],
    surnamesF: ['Rathore', 'Chauhan', 'Shekhawat', 'Sisodia', 'Singh'],
    cities: [
      { city: 'Jaipur', state: 'Rajasthan' },
      { city: 'Delhi', state: 'NCR' },
      { city: 'Indore', state: 'Madhya Pradesh' },
    ],
    languages: ['Hindi', 'Rajasthani', 'English'],
    diet: 'Non-Vegetarian',
    familyType: 'Joint Family',
    familyStatus: 'Upper Middle Class',
  },
  {
    id: 'tamil_brahmin',
    religion: 'Hindu',
    community: 'Tamil Brahmin',
    surnamesM: ['Iyer', 'Iyengar', 'Subramanian', 'Venkatesh'],
    surnamesF: ['Iyer', 'Iyengar', 'Subramanian', 'Venkatesh'],
    cities: [
      { city: 'Chennai', state: 'Tamil Nadu' },
      { city: 'Bangalore', state: 'Karnataka' },
    ],
    languages: ['Tamil', 'English', 'Hindi'],
    diet: 'Vegetarian',
    familyType: 'Nuclear Family',
    familyStatus: 'Upper Middle Class',
  },
  {
    id: 'telugu',
    religion: 'Hindu',
    community: 'Telugu',
    surnamesM: ['Reddy', 'Rao', 'Naidu', 'Prasad'],
    surnamesF: ['Reddy', 'Rao', 'Naidu', 'Prasad'],
    cities: [
      { city: 'Hyderabad', state: 'Telangana' },
      { city: 'Bangalore', state: 'Karnataka' },
    ],
    languages: ['Telugu', 'Hindi', 'English'],
    diet: 'Non-Vegetarian',
    familyType: 'Joint Family',
    familyStatus: 'Upper Middle Class',
  },
  {
    id: 'kerala',
    religion: 'Hindu',
    community: 'Nair',
    surnamesM: ['Nair', 'Menon', 'Pillai', 'Kurup'],
    surnamesF: ['Nair', 'Menon', 'Pillai', 'Kurup'],
    cities: [
      { city: 'Kochi', state: 'Kerala' },
      { city: 'Bangalore', state: 'Karnataka' },
    ],
    languages: ['Malayalam', 'English', 'Hindi'],
    diet: 'Non-Vegetarian',
    familyType: 'Nuclear Family',
    familyStatus: 'Middle Class',
  },
  {
    id: 'muslim',
    religion: 'Muslim',
    community: 'Sunni',
    surnamesM: ['Khan', 'Ansari', 'Siddiqui', 'Sheikh'],
    surnamesF: ['Khan', 'Ansari', 'Siddiqui', 'Sheikh'],
    cities: [
      { city: 'Delhi', state: 'NCR' },
      { city: 'Hyderabad', state: 'Telangana' },
      { city: 'Lucknow', state: 'Uttar Pradesh' },
    ],
    languages: ['Urdu', 'Hindi', 'English'],
    diet: 'Non-Vegetarian (Halal)',
    familyType: 'Joint Family',
    familyStatus: 'Middle Class',
  },
  {
    id: 'christian',
    religion: 'Christian',
    community: 'Catholic',
    surnamesM: ["D'Souza", 'Fernandes', 'Thomas', 'George'],
    surnamesF: ["D'Souza", 'Fernandes', 'Thomas', 'George'],
    cities: [
      { city: 'Mumbai', state: 'Maharashtra' },
      { city: 'Kochi', state: 'Kerala' },
      { city: 'Bangalore', state: 'Karnataka' },
    ],
    languages: ['English', 'Konkani', 'Malayalam'],
    diet: 'Non-Vegetarian',
    familyType: 'Nuclear Family',
    familyStatus: 'Upper Middle Class',
  },
  {
    id: 'maharashtrian',
    religion: 'Hindu',
    community: 'Maratha',
    surnamesM: ['Patil', 'Deshmukh', 'Kulkarni', 'Joshi'],
    surnamesF: ['Patil', 'Deshmukh', 'Kulkarni', 'Joshi'],
    cities: [
      { city: 'Mumbai', state: 'Maharashtra' },
      { city: 'Pune', state: 'Maharashtra' },
    ],
    languages: ['Marathi', 'Hindi', 'English'],
    diet: 'Non-Vegetarian',
    familyType: 'Nuclear Family',
    familyStatus: 'Middle Class',
  },
];

// First names by gender
export const maleFirstNames = [
  'Aarav', 'Arjun', 'Vikram', 'Rohan', 'Karan', 'Aditya', 'Siddharth', 'Pranav',
  'Dev', 'Harsh', 'Vivek', 'Ankit', 'Gaurav', 'Varun', 'Dhruv', 'Ishaan',
  'Kunal', 'Mohit', 'Parth', 'Rishi', 'Sahil', 'Tushar', 'Yash', 'Akash',
  'Rahul', 'Amit', 'Nikhil', 'Manish', 'Rajesh', 'Sachin', 'Deepak', 'Suraj',
  'Gurpreet', 'Harpreet', 'Manpreet', 'Aryan', 'Vihaan', 'Kabir', 'Reyansh', 'Ayaan',
  'Krishna', 'Shivam', 'Anirudh', 'Tejas', 'Abhinav', 'Kartik', 'Neeraj', 'Saurabh',
  'Mayank', 'Chirag',
];

export const femaleFirstNames = [
  'Priya', 'Aditi', 'Neha', 'Sneha', 'Ananya', 'Kavya', 'Meera', 'Pooja',
  'Riya', 'Simran', 'Tanvi', 'Nisha', 'Deepika', 'Ishita', 'Kiara', 'Lavanya',
  'Megha', 'Nikita', 'Pallavi', 'Sakshi', 'Tanya', 'Diya', 'Gauri', 'Isha',
  'Nandini', 'Radhika', 'Sonal', 'Trisha', 'Vidya', 'Aanchal', 'Bhavna', 'Charmi',
  'Gurleen', 'Jasleen', 'Harleen', 'Aisha', 'Sara', 'Zara', 'Mira', 'Rhea',
  'Shreya', 'Swati', 'Mansi', 'Komal', 'Jyoti', 'Divya', 'Kritika', 'Madhuri',
  'Priyal', 'Vrinda',
];

// Profession pools
export const maleProfessions = [
  { title: 'Software Engineer', companies: ['Google', 'Microsoft', 'Infosys', 'TCS', 'Wipro', 'Flipkart', 'Razorpay'], incomes: ['₹12-18 LPA', '₹18-25 LPA', '₹25-35 LPA', '₹35-50 LPA'], degrees: ['B.Tech Computer Science', 'M.Tech Computer Science'] },
  { title: 'Doctor', companies: ['Apollo Hospitals', 'Max Healthcare', 'Fortis Hospital', 'AIIMS', 'Medanta'], incomes: ['₹18-25 LPA', '₹25-35 LPA', '₹35-50 LPA'], degrees: ['MBBS', 'MD Medicine'] },
  { title: 'Chartered Accountant', companies: ['Deloitte', 'EY', 'PwC', 'KPMG', 'Own Practice'], incomes: ['₹12-18 LPA', '₹18-25 LPA', '₹25-35 LPA'], degrees: ['B.Com + CA', 'CA ICAI'] },
  { title: 'Business Owner', companies: ['Family Business', 'Own Venture', 'Self-Employed'], incomes: ['₹25-35 LPA', '₹35-50 LPA', '₹50-75 LPA', '₹1 Cr+'], degrees: ['MBA', 'B.Com'] },
  { title: 'Lawyer', companies: ['AZB & Partners', 'Khaitan & Co', 'Own Practice', 'High Court'], incomes: ['₹12-18 LPA', '₹18-25 LPA', '₹25-35 LPA'], degrees: ['LLB', 'LLM'] },
  { title: 'Product Manager', companies: ['Google', 'Amazon', 'Flipkart', 'PhonePe', 'Swiggy', 'CRED'], incomes: ['₹25-35 LPA', '₹35-50 LPA', '₹50-75 LPA'], degrees: ['B.Tech + MBA', 'MBA IIM'] },
  { title: 'Architect', companies: ['Hafeez Contractor', 'CP Kukreja', 'Own Practice', 'L&T'], incomes: ['₹12-18 LPA', '₹18-25 LPA'], degrees: ['B.Arch', 'M.Arch'] },
  { title: 'Management Consultant', companies: ['McKinsey', 'BCG', 'Bain', 'Accenture'], incomes: ['₹25-35 LPA', '₹35-50 LPA', '₹50-75 LPA'], degrees: ['MBA IIM', 'MBA ISB'] },
  { title: 'Data Scientist', companies: ['Amazon', 'Microsoft', 'Flipkart', 'Mu Sigma', 'Fractal'], incomes: ['₹18-25 LPA', '₹25-35 LPA', '₹35-50 LPA'], degrees: ['M.Tech', 'MS Statistics'] },
  { title: 'Government Officer', companies: ['IAS', 'IPS', 'IRS', 'State Civil Services'], incomes: ['₹12-18 LPA', '₹18-25 LPA'], degrees: ['B.Tech', 'MA', 'MBA'] },
];

export const femaleProfessions = [
  { title: 'Software Engineer', companies: ['Google', 'Microsoft', 'Amazon', 'Infosys', 'Accenture', 'Thoughtworks'], incomes: ['₹12-18 LPA', '₹18-25 LPA', '₹25-35 LPA'], degrees: ['B.Tech Computer Science', 'M.Tech Computer Science'] },
  { title: 'Doctor', companies: ['Apollo Hospitals', 'Fortis Hospital', 'Max Healthcare', 'AIIMS'], incomes: ['₹18-25 LPA', '₹25-35 LPA', '₹35-50 LPA'], degrees: ['MBBS', 'MD Dermatology', 'MD Pediatrics'] },
  { title: 'Chartered Accountant', companies: ['Deloitte', 'EY', 'PwC', 'Own Practice'], incomes: ['₹12-18 LPA', '₹18-25 LPA', '₹25-35 LPA'], degrees: ['B.Com + CA', 'CA ICAI'] },
  { title: 'HR Manager', companies: ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Amazon'], incomes: ['₹12-18 LPA', '₹18-25 LPA'], degrees: ['MBA HR', 'PGDM'] },
  { title: 'Teacher', companies: ['DPS', 'Ryan International', 'Amity University', 'Shri Ram School'], incomes: ['₹8-12 LPA', '₹12-18 LPA'], degrees: ['B.Ed', 'M.Ed', 'MA Education'] },
  { title: 'Lawyer', companies: ['AZB & Partners', 'Shardul Amarchand', 'Own Practice'], incomes: ['₹12-18 LPA', '₹18-25 LPA', '₹25-35 LPA'], degrees: ['LLB', 'LLM'] },
  { title: 'Product Manager', companies: ['Google', 'Amazon', 'Flipkart', 'Meesho', 'Nykaa'], incomes: ['₹25-35 LPA', '₹35-50 LPA'], degrees: ['B.Tech + MBA', 'MBA'] },
  { title: 'UX Designer', companies: ['Google', 'Flipkart', 'Swiggy', 'Razorpay', 'Freshworks'], incomes: ['₹12-18 LPA', '₹18-25 LPA', '₹25-35 LPA'], degrees: ['B.Des NID', 'M.Des IDC IIT'] },
  { title: 'Architect', companies: ['Hafeez Contractor', 'Own Practice', 'Shapoorji Pallonji'], incomes: ['₹12-18 LPA', '₹18-25 LPA'], degrees: ['B.Arch', 'M.Arch'] },
  { title: 'Entrepreneur', companies: ['Own Startup', 'Self-Employed', 'Co-Founder'], incomes: ['₹18-25 LPA', '₹25-35 LPA', '₹35-50 LPA'], degrees: ['MBA', 'B.Tech', 'B.Com'] },
];

export const collegesByDegree: Record<string, string[]> = {
  'B.Tech Computer Science': ['IIT Bombay', 'IIT Delhi', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore', 'DTU Delhi'],
  'M.Tech Computer Science': ['IIT Bombay', 'IIT Madras', 'IISc Bangalore', 'IIT Delhi'],
  'MBBS': ['AIIMS Delhi', 'CMC Vellore', 'MAMC Delhi', 'KEM Mumbai', 'Grant Medical College'],
  'MD Medicine': ['AIIMS Delhi', 'PGI Chandigarh', 'CMC Vellore'],
  'MD Dermatology': ['AIIMS Delhi', 'PGI Chandigarh', 'KEM Mumbai'],
  'MD Pediatrics': ['AIIMS Delhi', 'CMC Vellore', 'PGI Chandigarh'],
  'B.Com + CA': ['SRCC Delhi', 'Loyola Chennai', 'St. Xaviers Mumbai', 'Christ Bangalore'],
  'CA ICAI': ['ICAI', 'ICAI'],
  'MBA': ['IIM Ahmedabad', 'IIM Bangalore', 'ISB Hyderabad', 'XLRI Jamshedpur', 'FMS Delhi'],
  'MBA IIM': ['IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'IIM Lucknow'],
  'MBA ISB': ['ISB Hyderabad'],
  'MBA HR': ['XLRI Jamshedpur', 'TISS Mumbai', 'IIM Ranchi'],
  'B.Tech + MBA': ['IIT Bombay + IIM Ahmedabad', 'NIT + ISB', 'BITS + IIM Bangalore'],
  'PGDM': ['XLRI Jamshedpur', 'MDI Gurgaon', 'SP Jain Mumbai'],
  'LLB': ['NLU Bangalore', 'NLU Delhi', 'Faculty of Law DU', 'ILS Pune'],
  'LLM': ['NLU Bangalore', 'NLU Delhi', 'Harvard Law School'],
  'B.Arch': ['SPA Delhi', 'IIT Kharagpur', 'CEPT Ahmedabad'],
  'M.Arch': ['SPA Delhi', 'IIT Kharagpur'],
  'B.Com': ['SRCC Delhi', 'St. Xaviers Mumbai', 'Loyola Chennai'],
  'MS Statistics': ['ISI Kolkata', 'CMI Chennai', 'IIT Kanpur'],
  'B.Tech': ['IIT Delhi', 'NIT Warangal', 'BITS Pilani', 'DTU Delhi'],
  'MA': ['JNU Delhi', 'Delhi University', 'BHU Varanasi'],
  'MA Education': ['JNU Delhi', 'Delhi University', 'Tata Institute'],
  'B.Ed': ['Delhi University', 'Jamia Millia', 'Bangalore University'],
  'M.Ed': ['Delhi University', 'Jamia Millia'],
  'B.Des NID': ['NID Ahmedabad', 'NID Bangalore'],
  'M.Des IDC IIT': ['IIT Bombay IDC', 'IIT Guwahati'],
};

export const hobbiesPool = [
  'Reading', 'Traveling', 'Yoga', 'Cooking', 'Photography', 'Music', 'Dancing',
  'Painting', 'Hiking', 'Swimming', 'Running', 'Cricket', 'Badminton', 'Meditation',
  'Writing', 'Gardening', 'Cycling', 'Chess', 'Gym', 'Singing',
];

export const personalityTypes = [
  'Ambivert', 'Introvert', 'Extrovert', 'Analytical', 'Creative',
  'Empathetic', 'Pragmatic', 'Adventurous',
];
