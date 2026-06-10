import type { Customer } from '@/types';
import { generateAvatar } from '@/utils';
import {
  archetypes,
  maleFirstNames,
  femaleFirstNames,
  maleProfessions,
  femaleProfessions,
  collegesByDegree,
  hobbiesPool,
  personalityTypes,
} from './archetypes';

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(12345);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function generateBio(name: string, profession: string, city: string, gender: string, personality: string): string {
  const bios = [
    `${name} is a ${personality.toLowerCase()} and family-oriented individual looking for a life partner who shares similar values and supports ${gender === 'Female' ? 'her' : 'his'} career. Clear about goals and open to relocating within India.`,
    `A driven ${profession} based in ${city}, ${name} values intellectual compatibility and emotional connection. Looking for a partner with a progressive mindset who appreciates both tradition and modernity.`,
    `${name} is a warm, ${personality.toLowerCase()}, and grounded individual who believes in building meaningful relationships. Passionate about ${gender === 'Female' ? 'her' : 'his'} career while maintaining strong family bonds.`,
    `Based in ${city}, ${name} is a successful ${profession} who enjoys a balanced lifestyle. Looking for a like-minded partner who values communication, trust, and shared growth.`,
  ];
  return pick(bios);
}

const topPrioritiesPool = [
  "Partner should be family-oriented", "Supportive of career growth", "Values honesty and communication",
  "Wants to settle in same city", "Open to relocating", "Financial stability",
  "Similar educational background", "Shared cultural values", "Emotional maturity",
  "Sense of humor", "Health-conscious lifestyle", "Progressive mindset",
  "Respectful towards elders", "Adventurous spirit", "Work-life balance focused",
];

const dealBreakersPool = [
  "Partner shouldn't smoke", "No alcohol dependency", "Must respect personal boundaries", 
  "Doesn't want to relocate outside India", "Different core family values",
  "Uncomfortable with very frequent travel", "Must be financially independent",
  "No interfaith marriage", "Must want children", "Doesn't want pets",
  "Must be vegetarian", "No long-distance relationship",
];

export function generateCustomers(count: number = 100): Customer[] {
  const customers: Customer[] = [];

  for (let i = 0; i < count; i++) {
    const isFemale = i < count / 2;
    const gender = isFemale ? 'Female' : 'Male';
    const archetype = pick(archetypes);
    
    const firstName = isFemale ? pick(femaleFirstNames) : pick(maleFirstNames);
    const lastName = isFemale ? pick(archetype.surnamesF) : pick(archetype.surnamesM);
    const name = `${firstName} ${lastName}`;
    
    const location = pick(archetype.cities);
    const age = 24 + Math.floor(rand() * 12);
    const dob = `${1990 + Math.floor(rand() * 8)}-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}-${String(1 + Math.floor(rand() * 28)).padStart(2, '0')}`;
    
    const professionData = isFemale ? pick(femaleProfessions) : pick(maleProfessions);
    const company = pick(professionData.companies);
    const income = pick(professionData.incomes);
    const degree = pick(professionData.degrees);
    const college = pick(collegesByDegree[degree] || ['Local University']);
    
    const heights = isFemale 
      ? [`5'${2 + Math.floor(rand() * 4)}"`, `5'${3 + Math.floor(rand() * 4)}"`]
      : [`5'${7 + Math.floor(rand() * 5)}"`, `5'${8 + Math.floor(rand() * 4)}"`];
    const weight = isFemale ? `${48 + Math.floor(rand() * 15)} kg` : `${65 + Math.floor(rand() * 20)} kg`;

    const statusOptions: Customer['status'][] = ['New Lead', 'Profile Review', 'Active Matching', 'Meeting Scheduled', 'Engaged'];
    const status = pick(statusOptions);
    const aiScore = 70 + Math.floor(rand() * 28);
    
    const joinDate = new Date();
    joinDate.setDate(joinDate.getDate() - Math.floor(rand() * 180) - 30);
    const lastActiveDate = new Date();
    lastActiveDate.setHours(lastActiveDate.getHours() - Math.floor(rand() * 72));

    const personality = pick(personalityTypes);
    const bio = generateBio(name, professionData.title, location.city, gender, personality);

    const maritalStatus = rand() > 0.9 ? 'Divorced' : 'Never Married';
    
    customers.push({
      id: `TDC-${String(10001 + i)}`,
      
      // Basic Info
      firstName,
      lastName,
      name,
      gender,
      dateOfBirth: dob,
      dob: dob, // compat
      age,
      maritalStatus,
      height: pick(heights),
      weight,
      bodyType: pick(['Slim', 'Athletic', 'Average']),
      complexion: pick(['Fair', 'Wheatish', 'Dusky']),
      manglik: pick(['No', 'Yes', 'Anshik']),
      photo: generateAvatar(name, gender),
      
      // Location
      country: 'India',
      state: location.state,
      city: location.city,
      currentAddress: `${location.city}, ${location.state}`,
      
      // Contact
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phoneNumber: `+91 ${9000000000 + Math.floor(rand() * 999999999)}`,
      phone: `+91 ${9000000000 + Math.floor(rand() * 999999999)}`, // compat
      
      // Education
      undergraduateCollege: college,
      undergraduateDegree: degree,
      postgraduateCollege: degree.includes('M.') || degree.includes('MBA') || degree.includes('MD') || degree.includes('MS') ? college : 'None',
      postgraduateDegree: degree.includes('M.') || degree.includes('MBA') || degree.includes('MD') || degree.includes('MS') ? degree : 'None',
      university: college,
      yearOfPassing: String(2024 - Math.floor(rand() * 10)),
      education: degree, // compat
      
      // Professional
      currentCompany: company,
      company: company, // compat
      designation: professionData.title,
      profession: professionData.title, // compat
      workExperience: `${Math.floor(rand() * 10) + 2} Years`,
      employmentType: 'Full-time',
      annualIncome: income,
      income: income, // compat
      workLocation: location.city,
      careerGoals: 'To excel in my field and build a strong professional network.',
      
      // Family
      religion: archetype.religion as Customer['religion'],
      caste: archetype.community,
      gotra: pick(['Kashyap', 'Bharadwaj', 'Garg', 'Bansal', 'Sandilya', 'Not Applicable']),
      motherTongue: archetype.languages[0],
      familyType: archetype.familyType,
      familyStatus: archetype.familyStatus,
      fatherOccupation: pick(['Business', 'Retired Govt. Officer', 'Private Sector Executive', 'Doctor']),
      motherOccupation: pick(['Homemaker', 'Teacher', 'Businesswoman']),
      siblings: pick(['1 Brother', '1 Sister', '2 Sisters', '1 Brother, 1 Sister', 'None']),
      
      // Matchmaking Preferences
      lookingFor: 'Marriage',
      wantKids: pick(['Yes', 'Maybe', 'No']),
      openToRelocate: rand() > 0.5 ? 'Yes' : 'No',
      relocation: rand() > 0.5 ? 'Open to Relocate' : 'Prefers Same City', // compat
      openToPets: rand() > 0.6 ? 'Yes' : 'No',
      preferredAgeMin: gender === 'Male' ? age - 5 : age - 2,
      preferredAgeMax: gender === 'Male' ? age + 2 : age + 5,
      preferredHeightMin: "5'0\"",
      preferredHeightMax: "6'2\"",
      preferredCountries: ['India'],
      preferredCities: [location.city, pick(['Mumbai', 'Delhi', 'Bangalore', 'Pune'])],
      
      // Lifestyle
      languagesKnown: archetype.languages,
      languages: archetype.languages, // compat
      diet: archetype.diet,
      dietaryPreference: archetype.diet,
      drinking: rand() > 0.7 ? 'Socially' : 'No',
      drinkingHabit: rand() > 0.7 ? 'Social Drinker' : 'Non-Drinker',
      smoking: rand() > 0.9 ? 'Occasionally' : 'No',
      smokingHabit: rand() > 0.9 ? 'Occasional' : 'Non-Smoker',
      hobbies: pickN(hobbiesPool, 3 + Math.floor(rand() * 3)),
      interests: pickN(['Technology', 'Art', 'Sports', 'Music', 'Movies', 'Politics', 'Finance'], 3),
      favoriteMusic: pickN(['Bollywood', 'Classical', 'Pop', 'Rock', 'Jazz', 'Indie'], 2),
      weekendActivities: pickN(['Dining out', 'Reading', 'Trekking', 'Netflix', 'Socializing'], 2),
      
      // Additional Info
      aboutMe: bio,
      bio: bio, // compat
      expectationsFromPartner: 'Looking for someone understanding, progressive, and supportive.',
      
      // AI Information
      matchPotential: aiScore,
      aiScore: aiScore, // compat
      aiSummary: `${name} is a ${professionData.title} from ${location.city}. Highly compatible with partners valuing ${archetype.familyType} setup.`,
      aiCompatibilityReasons: ['Strong professional background', `Aligned with ${archetype.community} values`],
      
      // System metadata
      status,
      joinedDate: joinDate.toISOString().split('T')[0],
      lastActive: lastActiveDate.toISOString(),
      verified: rand() > 0.2,

      // Extended snapshot fields
      relationshipGoal: pick(['Marriage in 1-2 years', 'Marriage in 6 months', 'Open to timeline', 'Marriage in 2-3 years']),
      familyOrientation: pick(['High', 'Very High', 'Medium', 'Balanced']),
      careerFocus: pick(['High', 'Very High', 'Medium', 'Balanced']),
      lifestyleType: pick(['Active', 'Balanced', 'Relaxed', 'Adventurous']),
      flexibility: pick(['High', 'Medium', 'Low', 'Very Flexible']),
      marriageReadiness: pick(['Ready now', 'Ready in 6 months', 'Ready in 1 year', 'Exploring']),
      dealBreakers: pickN(dealBreakersPool, 3 + Math.floor(rand() * 2)),
      topPriorities: pickN(topPrioritiesPool, 3 + Math.floor(rand() * 3)),
      children: 'None',
      pets: rand() > 0.7 ? 'Yes (Dog)' : 'None',
    });
  }

  return customers;
}

export const customers: Customer[] = generateCustomers();
