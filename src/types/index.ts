// Firebase Auth user mapped to app type
export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
}

export type CustomerStatus = 'New Lead' | 'Profile Review' | 'Active Matching' | 'Meeting Scheduled' | 'Engaged' | 'On Hold' | 'Closed';

export type Gender = 'Male' | 'Female';

export type Religion = 'Hindu' | 'Muslim' | 'Christian' | 'Sikh' | 'Jain' | 'Buddhist' | 'Parsi';

export type MaritalStatus = 'Never Married' | 'Divorced' | 'Widowed';

export interface Customer {
  id: string;
  
  // Basic Information
  firstName: string;
  lastName: string;
  name: string; // Kept for backward compatibility
  gender: Gender;
  dateOfBirth: string; // mapped from dob
  age: number;
  maritalStatus: MaritalStatus;
  height: string;
  bodyType: string;
  complexion: string;
  manglik: string;
  photo: string; // Keeps the avatar
  
  // Location Information
  country: string;
  state: string;
  city: string;
  currentAddress: string;
  
  // Contact Information
  email: string;
  phoneNumber: string; // mapped from phone
  
  // Education Information
  undergraduateCollege: string;
  undergraduateDegree: string;
  postgraduateCollege: string;
  postgraduateDegree: string;
  university: string;
  yearOfPassing: string;
  
  // Professional Information
  currentCompany: string; // mapped from company
  designation: string; // mapped from profession
  workExperience: string;
  employmentType: string;
  annualIncome: string; // mapped from income
  workLocation: string;
  careerGoals: string;
  
  // Family Information
  religion: Religion;
  caste: string;
  gotra: string;
  motherTongue: string;
  familyType: string;
  familyStatus: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: string;
  
  // Matchmaking Preferences
  lookingFor: string;
  wantKids: string;
  openToRelocate: string;
  openToPets: string;
  preferredAgeMin: number;
  preferredAgeMax: number;
  preferredHeightMin: string;
  preferredHeightMax: string;
  preferredCountries: string[];
  preferredCities: string[];
  
  // Lifestyle Information
  languagesKnown: string[];
  diet: string;
  drinking: string;
  smoking: string;
  hobbies: string[];
  interests: string[];
  favoriteMusic: string[];
  weekendActivities: string[];
  
  // Additional Information
  aboutMe: string; // mapped from bio
  expectationsFromPartner: string;
  
  // AI Information
  matchPotential: number; // mapped from aiScore
  aiSummary: string;
  aiCompatibilityReasons: string[];
  
  // System metadata (existing)
  status: CustomerStatus;
  joinedDate: string;
  lastActive: string;
  verified: boolean;

  // AI Relationship Snapshot
  relationshipGoal: string;
  familyOrientation: string;
  careerFocus: string;
  lifestyleType: string;
  flexibility: string;
  marriageReadiness: string;
  dealBreakers: string[];
  topPriorities: string[];

  // Extended Lifestyle
  dietaryPreference: string;
  smokingHabit: string;
  drinkingHabit: string;
  children: string;
  pets: string;
  weight: string;
  languages: string[];

  // Backward-compat aliases (populated by seed, used across UI)
  profession: string;
  company: string;
  income: string;
  aiScore: number;
  dob: string;
  phone: string;
  bio: string;
  education: string;
  relocation: string;
}

export interface AIFilters {
  gender?: 'Male' | 'Female';
  minAge?: number;
  maxAge?: number;
  city?: string;
  state?: string;
  status?: CustomerStatus;
  verified?: boolean;
  minCompatibility?: number;
  profession?: string;
  religion?: string;
}

export interface Match {
  id: string;
  customerId: string;
  matchedCustomerId: string;
  compatibilityScore: number;
  matchConfidence: number;
  reasons: string[];
  concerns: string[];
  conversationStarters: string[];
  status: 'suggested' | 'sent' | 'accepted' | 'declined' | 'meeting' | 'shortlisted';
  createdAt: string;
  aiAnalysis?: {
    strengths: string[];
    concerns: string[];
    relationshipSummary: string;
    recommendation: string;
    conversationStarters: string[];
  };
}

export interface TimelineEvent {
  id: string;
  customerId: string;
  type: 'profile_verified' | 'call_completed' | 'match_sent' | 'meeting_scheduled' | 'note_added' | 'follow_up' | 'preferences_updated' | 'match_suggested' | 'match_status_updated';
  title: string;
  description: string;
  date: string;
  metadata?: Record<string, any>;
}

export interface Note {
  id: string;
  customerId: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'ai_suggestion' | 'system';
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  pinned: boolean;
  status: 'active' | 'archived';
}

export interface AnalyticsData {
  customersManaged: number;
  matchesSent: number;
  meetingsScheduled: number;
  successfulMatches: number;
  successRate: number;
  weeklyChange: {
    customers: number;
    matches: number;
    meetings: number;
    successRate: number;
  };
  pipelineFunnel: { stage: string; count: number }[];
  matchesOverTime: { month: string; matches: number; successful: number }[];
  topLocations: { city: string; count: number; successRate: number }[];
  ageDistribution: { range: string; male: number; female: number }[];
  topPreferences: { preference: string; count: number }[];
}

export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  customerName: string;
  type: 'call' | 'meeting' | 'review' | 'follow_up';
}

export interface AIPriority {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  message: string;
  action: string;
  actionLabel: string;
  updatedAt: string;
  matchAvatars?: string[];
}

export type CalendarEventType = 'Meeting' | 'Follow Up' | 'Match Review' | 'Profile Review' | 'Verification' | 'Reminder' | 'AI Suggested Task' | 'AI Recommendation' | 'Action Required' | 'Review Task' | 'Follow-Up';

export interface CalendarEvent {
  id: string;
  title: string;
  customerId?: string; // Optional if event is not tied to a customer
  customerName?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm format, e.g., '14:30'
  endTime: string;
  type: CalendarEventType;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Rescheduled' | 'Cancelled';
  notes: string;
  generatedByAI?: boolean;
  source?: string;
  createdAt: string;
  updatedAt: string;
}
