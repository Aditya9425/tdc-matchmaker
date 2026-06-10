/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import {
  Heart, Sparkles, MapPin, Briefcase, GraduationCap,
  Users, Coffee, Info, CheckCircle2, Send, FileText
} from 'lucide-react';
import { useCustomerStore } from '@/store/customerStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { AIMatchReportPanel } from '../dashboard/AIMatchReportPanel';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function CustomerProfileModal() {
  const { selectedCustomer, customers, isLoadingDetails, addToShortlist, setSelectedCustomer } = useCustomerStore();
  const { isProfileModalOpen, setProfileModalOpen } = useUIStore();
  
  const [showMatchConfirm, setShowMatchConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [snapshot, setSnapshot] = useState<any>(null);
  const [completeness, setCompleteness] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [reportPanelOpen, setReportPanelOpen] = useState(false);
  const [reportCandidate, setReportCandidate] = useState<any>(null);

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileModalOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setProfileModalOpen]);

  // Load suggestions when opened
  useEffect(() => {
    if (selectedCustomer) {
      setLoadingSuggestions(true);
      setLoadingAI(true);
      
      import('@/services/ai/reviewMatchesService').then(({ reviewMatches }) => {
        reviewMatches(selectedCustomer, customers).then((res: any) => {
          const mappedSuggestions = (res.recommendations || []).map((rec: any) => ({
            candidate: customers.find((c: any) => c.id === rec.candidateId),
            score: rec.compatibilityScore,
            report: {
              summary: rec.reasoning,
              keyStrengths: rec.strengths,
              concerns: rec.concerns,
              recommendedAction: rec.recommendedAction
            }
          })).filter((s: any) => s.candidate);
          setSuggestions(mappedSuggestions);
          setLoadingSuggestions(false);
        }).catch(() => setLoadingSuggestions(false));
      });

      import('@/services/ai/profileAnalysis').then(({ profileAnalysis }) => {
        Promise.all([
          profileAnalysis.generateSnapshot(selectedCustomer),
          profileAnalysis.analyzeCompleteness(selectedCustomer)
        ]).then(([snap, comp]) => {
          setSnapshot(snap);
          setCompleteness(comp);
          setLoadingAI(false);
        }).catch(() => setLoadingAI(false));
      });
    } else {
      setSuggestions([]);
      setSnapshot(null);
      setCompleteness(null);
    }
  }, [selectedCustomer]);

  if (!selectedCustomer) return null;

  const score = selectedCustomer.matchPotential || selectedCustomer.aiScore || 0;

  const handleSendMatch = async () => {
    setIsSending(true);
    // Mock action
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSending(false);
    setShowMatchConfirm(false);
    toast.success('Match sent successfully!');
  };

  const handleShortlist = () => {
    addToShortlist(selectedCustomer.id);
    toast.success('Added to shortlist');
  };

  const handleViewSuggestions = () => {
    const el = document.getElementById('suggested-matches');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openReport = (candidate: any) => {
    setReportCandidate(candidate);
    setReportPanelOpen(true);
  };

  return (
    <>
      <Dialog open={isProfileModalOpen && !!selectedCustomer} onOpenChange={setProfileModalOpen}>
        <DialogContent size="lg" className="bg-slate-50 border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl h-[90vh] flex flex-col">
          {/* Header Action Bar */}
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0 z-10 m-0 space-y-0">
            <div className="flex items-center gap-6">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Customer Profile
              </h2>
              {completeness && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Completeness</span>
                  <Progress value={completeness.completionPercentage} className="w-16 h-1.5 bg-slate-200" indicatorClassName="bg-primary" />
                  <span className="text-xs font-bold text-slate-900">{completeness.completionPercentage}%</span>
                </div>
              )}
            </div>
            <DialogTitle className="sr-only">Customer Profile</DialogTitle>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-hidden relative">
            <ScrollArea className="h-full">
              {isLoadingDetails ? (
                <div className="p-6 md:p-8 space-y-8">
                  <div className="flex items-start gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <Skeleton className="w-24 h-24 rounded-full shrink-0" />
                    <div className="space-y-3 flex-1">
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/5" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
                  </div>
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
                  
                  {/* 1. Profile Header & KPI */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Identity */}
                    <Card className="lg:col-span-2 shadow-sm border-slate-200 bg-white overflow-hidden">
                      <CardContent className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                          <Avatar className="w-28 h-28 border-4 border-white shadow-md ring-1 ring-slate-100">
                            <AvatarImage src={selectedCustomer.photo} />
                            <AvatarFallback className="bg-slate-100 text-slate-400 text-2xl font-bold">
                              {selectedCustomer.firstName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-center md:text-left space-y-3">
                            <div>
                              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h1>
                                {selectedCustomer.verified && <CheckCircle2 className="w-5 h-5 text-primary" />}
                              </div>
                              <p className="text-sm font-medium text-slate-600">
                                {selectedCustomer.designation || 'Professional'} at {selectedCustomer.currentCompany || 'Company'}
                              </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                {selectedCustomer.age} yrs
                              </Badge>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                {selectedCustomer.gender}
                              </Badge>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                <MapPin className="w-3 h-3 mr-1" />
                                {selectedCustomer.city}
                              </Badge>
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                                {selectedCustomer.maritalStatus}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                              <Badge variant="outline" className={cn(
                                'text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5',
                                selectedCustomer.status === 'New Lead' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                selectedCustomer.status === 'Engaged' ? 'border-pink-200 text-pink-700 bg-pink-50' :
                                selectedCustomer.status === 'Meeting Scheduled' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' :
                                selectedCustomer.status === 'Profile Review' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                                'border-indigo-200 text-indigo-700 bg-indigo-50'
                              )}>
                                {selectedCustomer.status}
                              </Badge>
                              {(selectedCustomer as any).premium && (
                                <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 text-[10px] font-bold uppercase tracking-wider py-0.5 px-2.5">
                                  Premium Profile
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Match Potential KPI */}
                    <Card className="shadow-sm border-slate-200 bg-primary/5 flex flex-col justify-center">
                      <CardContent className="p-6 md:p-8 text-center space-y-4">
                        <div className="space-y-1">
                          <div className={cn('text-4xl font-extrabold tracking-tight', 
                            score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-slate-700'
                          )}>
                            {score}%
                          </div>
                          <p className="text-sm font-bold text-slate-900">
                            {score >= 90 ? 'Excellent Compatibility' : score >= 70 ? 'Good Compatibility' : 'Average Compatibility'}
                          </p>
                        </div>
                        <Progress 
                          value={score} 
                          className="h-2.5 bg-white shadow-sm" 
                          indicatorClassName={score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-slate-400'} 
                        />
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                          High Potential Match
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 2. AI Insights */}
                  <Card className="shadow-sm border-primary/20 bg-primary/[0.02] overflow-hidden">
                    <CardHeader className="pb-3 border-b border-primary/10 bg-primary/5">
                      <CardTitle className="flex items-center gap-2 text-base text-primary">
                        <Sparkles className="w-5 h-5" />
                        AI Compatibility Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recommendation</h4>
                            <p className="text-sm text-slate-800 leading-relaxed font-medium">
                              {selectedCustomer.aiSummary || "Strong alignment in lifestyle, family values, and long-term goals. Recommended for immediate introduction."}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Key Drivers</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedCustomer.aiCompatibilityReasons?.length ? selectedCustomer.aiCompatibilityReasons.map((r, i) => (
                                <Badge key={i} variant="secondary" className="bg-white border-slate-200 text-slate-700 shadow-sm">
                                  {r}
                                </Badge>
                              )) : (
                                <>
                                  <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700 shadow-sm">Family Oriented</Badge>
                                  <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700 shadow-sm">Career Aligned</Badge>
                                  <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700 shadow-sm">Similar Lifestyle</Badge>
                                </>
                              )}
                            </div>
                          </div>
                          {completeness?.missingFields?.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-primary/10">
                              <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Missing Information</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {completeness.missingFields.map((f: string) => (
                                  <Badge key={f} variant="outline" className="text-[9px] border-amber-200 text-amber-700 bg-amber-50 uppercase">{f}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Relationship Snapshot</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {loadingAI ? (
                              [1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-10 rounded-lg" />)
                            ) : snapshot ? (
                              <>
                                <SnapshotBox label="Relationship Goal" value={snapshot.relationshipGoal} />
                                <SnapshotBox label="Family Orientation" value={snapshot.familyOrientation} />
                                <SnapshotBox label="Lifestyle Alignment" value={snapshot.lifestyleAlignment} />
                                <SnapshotBox label="Career Focus" value={snapshot.careerFocus} />
                                <SnapshotBox label="Flexibility" value={snapshot.flexibility} />
                                <SnapshotBox label="Marriage Readiness" value={snapshot.marriageReadiness} />
                              </>
                            ) : (
                              <>
                                <SnapshotBox label="Relationship Goal" value="Long-term" />
                                <SnapshotBox label="Family Orientation" value="Balanced" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 3. Detailed Information Grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <SectionCard title="Personal Information" icon={<Info />}>
                      <Field label="Gender" value={selectedCustomer.gender} />
                      <Field label="Date of Birth" value={selectedCustomer.dateOfBirth} />
                      <Field label="Age" value={`${selectedCustomer.age} years`} />
                      <Field label="Height" value={selectedCustomer.height} />
                      <Field label="Body Type" value={selectedCustomer.bodyType} />
                      <Field label="Complexion" value={selectedCustomer.complexion} />
                      <Field label="Manglik" value={selectedCustomer.manglik} />
                      <Field label="Marital Status" value={selectedCustomer.maritalStatus} />
                    </SectionCard>

                    {/* Contact Information */}
                    <SectionCard title="Contact Information" icon={<MapPin />}>
                      <Field label="Email" value={selectedCustomer.email} full />
                      <Field label="Phone" value={selectedCustomer.phoneNumber} />
                      <Field label="Country" value={selectedCustomer.country} />
                      <Field label="State" value={selectedCustomer.state} />
                      <Field label="City" value={selectedCustomer.city} />
                      <Field label="Address" value={selectedCustomer.currentAddress} full />
                    </SectionCard>

                    {/* Education */}
                    <SectionCard title="Education" icon={<GraduationCap />}>
                      <Field label="UG College" value={selectedCustomer.undergraduateCollege} full />
                      <Field label="UG Degree" value={selectedCustomer.undergraduateDegree} />
                      <Field label="University" value={selectedCustomer.university} />
                      <Field label="PG College" value={selectedCustomer.postgraduateCollege} full />
                      <Field label="PG Degree" value={selectedCustomer.postgraduateDegree} />
                      <Field label="Passing Year" value={selectedCustomer.yearOfPassing} />
                    </SectionCard>

                    {/* Professional */}
                    <SectionCard title="Professional Background" icon={<Briefcase />}>
                      <Field label="Company" value={selectedCustomer.currentCompany} full />
                      <Field label="Designation" value={selectedCustomer.designation} />
                      <Field label="Income" value={selectedCustomer.annualIncome} />
                      <Field label="Experience" value={selectedCustomer.workExperience} />
                      <Field label="Location" value={selectedCustomer.workLocation} />
                      <Field label="Employment" value={selectedCustomer.employmentType} />
                    </SectionCard>

                    {/* Family Background */}
                    <SectionCard title="Family Background" icon={<Users />}>
                      <Field label="Religion" value={selectedCustomer.religion} />
                      <Field label="Caste" value={selectedCustomer.caste} />
                      <Field label="Gotra" value={selectedCustomer.gotra} />
                      <Field label="Family Type" value={selectedCustomer.familyType} />
                      <Field label="Family Status" value={selectedCustomer.familyStatus} />
                      <Field label="Siblings" value={selectedCustomer.siblings} />
                      <Field label="Father's Occ." value={selectedCustomer.fatherOccupation} full />
                      <Field label="Mother's Occ." value={selectedCustomer.motherOccupation} full />
                    </SectionCard>

                    {/* Preferences */}
                    <SectionCard title="Match Preferences" icon={<Heart />}>
                      <div className="col-span-2 flex flex-wrap gap-2 mb-2">
                        <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50">
                          Want Kids <span className="ml-1.5 font-bold text-primary">[{selectedCustomer.wantKids?.toUpperCase() || 'YES'}]</span>
                        </Badge>
                        <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50">
                          Relocate <span className="ml-1.5 font-bold text-primary">[{selectedCustomer.openToRelocate?.toUpperCase() || 'MAYBE'}]</span>
                        </Badge>
                        <Badge variant="outline" className="border-slate-200 text-slate-700 bg-slate-50">
                          Pets <span className="ml-1.5 font-bold text-primary">[{selectedCustomer.openToPets?.toUpperCase() || 'NO'}]</span>
                        </Badge>
                      </div>
                      <Field label="Age Range" value={`${selectedCustomer.preferredAgeMin || 25} - ${selectedCustomer.preferredAgeMax || 30} yrs`} />
                      <Field label="Height Range" value={`${selectedCustomer.preferredHeightMin || "5'0\""} - ${selectedCustomer.preferredHeightMax || "6'0\""}`} />
                      <Field label="Pref. Cities" value={selectedCustomer.preferredCities?.join(', ') || 'Any'} full />
                      <Field label="Pref. Countries" value={selectedCustomer.preferredCountries?.join(', ') || 'India'} full />
                    </SectionCard>

                    {/* Lifestyle */}
                    <SectionCard title="Lifestyle" icon={<Coffee />} className="md:col-span-2">
                      <Field label="Diet" value={selectedCustomer.diet} />
                      <Field label="Drinking" value={selectedCustomer.drinking} />
                      <Field label="Smoking" value={selectedCustomer.smoking} />
                      <Field label="Languages" value={selectedCustomer.languagesKnown?.join(', ')} />
                      <div className="col-span-2 mt-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hobbies & Interests</div>
                        <div className="flex flex-wrap gap-2">
                          {(selectedCustomer.hobbies || ['Reading', 'Traveling', 'Photography']).map(h => (
                            <Badge key={h} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">{h}</Badge>
                          ))}
                          {(selectedCustomer.interests || ['Tech', 'Art']).map(h => (
                            <Badge key={h} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">{h}</Badge>
                          ))}
                        </div>
                      </div>
                    </SectionCard>

                    {/* About */}
                    <SectionCard title="About & Expectations" icon={<Info />} className="md:col-span-2">
                      <div className="col-span-2 space-y-4">
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">About Me</h4>
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {selectedCustomer.aboutMe || "I am a driven professional who values family and career growth equally."}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Partner Expectations</h4>
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                            {selectedCustomer.expectationsFromPartner || "Looking for someone with similar family values, independent, and supportive."}
                          </p>
                        </div>
                      </div>
                    </SectionCard>
                  </div>

                  {/* Suggested Matches Section */}
                  <div id="suggested-matches" className="pt-6 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <h3 className="text-xl font-bold text-slate-900">Suggested Matches</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase">AI Powered</Badge>
                    </div>
                    {loadingSuggestions ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-[400px] rounded-2xl" />
                        <Skeleton className="h-[400px] rounded-2xl hidden md:block" />
                        <Skeleton className="h-[400px] rounded-2xl hidden lg:block" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(suggestions || []).slice(0, 6).map((matchData: any) => {
                          const sugg = matchData.candidate;
                          const aiReport = matchData.report;
                          return (
                          <Card key={sugg.id} className="shadow-sm border-slate-200 bg-white flex flex-col h-full hover:shadow-md transition-shadow">
                            <CardHeader className="p-5 pb-4 border-b border-slate-100 bg-slate-50/50">
                              <div className="flex gap-4">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-1 ring-slate-100 shrink-0">
                                  <AvatarImage src={sugg.photo} />
                                  <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">
                                    {sugg.firstName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-bold text-slate-900 truncate leading-tight mb-1">{sugg.firstName} {sugg.lastName}</h4>
                                  <div className="flex flex-wrap gap-1 mb-1.5">
                                    <span className="text-xs text-slate-500">{sugg.age} yrs • {sugg.city}</span>
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">{sugg.designation || sugg.profession || 'Professional'}</span>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-0 flex flex-col flex-1">
                              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-primary/[0.02]">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Confidence</div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${matchData.score}%` }} />
                                  </div>
                                  <span className="text-sm font-bold text-primary">{matchData.score}%</span>
                                </div>
                              </div>
                              <div className="p-5 space-y-4 flex-1">
                                <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-primary/20 pl-3">
                                  "{aiReport?.summary || 'Strong demographic and lifestyle compatibility.'}"
                                </p>
                                
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                      <CheckCircle2 className="w-3 h-3" /> Strengths
                                    </div>
                                    <ul className="space-y-1.5">
                                      {(aiReport?.keyStrengths?.slice(0, 2) || ['Demographic alignment', 'Location match']).map((s: string, i: number) => (
                                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                                          <span className="text-emerald-400 mt-0.5">•</span>
                                          <span className="leading-snug">{s}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex flex-col gap-2">
                                <Button size="sm" onClick={() => openReport(sugg)} variant="outline" className="w-full text-xs h-8 bg-white border-primary/20 text-primary hover:bg-primary/5">
                                  <FileText className="w-3.5 h-3.5 mr-2" /> Generate Match Report
                                </Button>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="secondary" className="flex-1 text-xs h-8 bg-slate-200 text-slate-700 hover:bg-slate-300">
                                    Profile
                                  </Button>
                                  <Button size="sm" onClick={() => setShowMatchConfirm(true)} className="flex-1 text-xs h-8 bg-primary hover:bg-primary/90 text-white shadow-sm">
                                    Send
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )})}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 bg-white shrink-0 z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleShortlist} className="bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 shadow-sm">
                <Heart className="w-4 h-4 mr-2 text-slate-500" />
                Add To Shortlist
              </Button>
              <Button variant="outline" onClick={handleViewSuggestions} className="border-slate-200 text-slate-700 shadow-sm bg-white hover:bg-slate-50">
                <Sparkles className="w-4 h-4 mr-2 text-slate-500" />
                View Suggestions
              </Button>
            </div>
            <Button onClick={() => setShowMatchConfirm(true)} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-8">
              <Send className="w-4 h-4 mr-2" />
              Send Match
            </Button>
          </div>
          
        </DialogContent>
      </Dialog>

      {/* Send Match Confirmation Overlay using AlertDialog */}
      <AlertDialog open={showMatchConfirm} onOpenChange={setShowMatchConfirm}>
        <AlertDialogContent size="sm" className="bg-white border-slate-200 rounded-2xl shadow-xl">
          <AlertDialogHeader className="text-center sm:text-center space-y-4 pt-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Send className="w-8 h-8 text-primary ml-1" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">
              Send Match to {selectedCustomer?.firstName}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 max-w-[280px] mx-auto leading-relaxed">
              This will notify them and initiate the matchmaking process. They will receive an email and app notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
            <AlertDialogCancel className="w-full sm:w-1/2 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm" disabled={isSending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSendMatch} className="w-full sm:w-1/2 bg-primary hover:bg-primary/90 text-white shadow-sm" disabled={isSending}>
              {isSending ? 'Sending...' : 'Confirm Send'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Match Report Panel */}
      <AIMatchReportPanel
        isOpen={reportPanelOpen}
        onClose={() => {
          setReportPanelOpen(false);
          setReportCandidate(null);
        }}
        primaryCustomer={selectedCustomer}
        candidateCustomer={reportCandidate}
      />
    </>
  );
}

// Helper Components
function SectionCard({ title, icon, children, className }: { title: string, icon: React.ReactNode, children: React.ReactNode, className?: string }) {
  return (
    <Card className={cn("shadow-sm border-slate-200 bg-white", className)}>
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 p-4 px-5">
        <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <span className="text-slate-400 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, value, full = false }: { label: string, value: string | undefined, full?: boolean }) {
  if (!value) return null;
  return (
    <div className={cn(full && "col-span-2")}>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm text-slate-900 font-medium break-words leading-tight">{value}</div>
    </div>
  );
}

function SnapshotBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm font-semibold text-primary">{value}</div>
    </div>
  );
}
