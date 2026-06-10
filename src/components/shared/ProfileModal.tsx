/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Briefcase, GraduationCap, Heart, CheckCircle2, Calendar, Phone, Bell } from 'lucide-react';
import type { Customer, CalendarEventType } from '@/types';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CalendarEventModal } from '@/components/calendar/CalendarEventModal';

interface ProfileModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ customer, isOpen, onClose }: ProfileModalProps) {
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [eventType, setEventType] = useState<CalendarEventType>('Meeting');

  const openCalendar = (type: CalendarEventType) => {
    setEventType(type);
    setCalendarModalOpen(true);
  };

  if (!customer) return null;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="bg-slate-50 border-slate-200 shadow-2xl p-0 overflow-hidden rounded-2xl flex flex-col">
        {/* Header - Sticky */}
        <DialogHeader className="p-8 bg-white border-b border-slate-100 shrink-0 sticky top-0 z-10 shadow-sm">
          <DialogTitle className="sr-only">{customer.name}'s Profile</DialogTitle>
          <div className="flex items-start gap-8">
            <Avatar className="w-32 h-32 border-4 border-slate-50 shadow-md rounded-2xl shrink-0">
              <AvatarImage src={customer.photo} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold rounded-2xl">
                {customer.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2 flex justify-between items-start">
              <div>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">{customer.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-base font-medium text-slate-500 mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {customer.city}, {customer.state}</span>
                  <span className="text-slate-300">•</span>
                  <span>{customer.age} years</span>
                  <span className="text-slate-300">•</span>
                  <span>{customer.gender}</span>
                  <span className="text-slate-300">•</span>
                  <span>{customer.height ? `${Math.floor((customer as any).height / 12)}'${(customer as any).height % 12}"` : ''}</span>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 font-bold text-xs uppercase tracking-wider">
                    {customer.relationshipGoal || 'Marriage'}
                  </Badge>
                  <Badge variant="outline" className="text-slate-600 bg-white shadow-sm font-bold uppercase text-[10px] px-3 py-1">
                    {customer.religion} {customer.caste ? `· ${customer.caste}` : ''}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Snapshot</div>
                <div className="text-2xl font-extrabold text-primary">{customer.aiScore || customer.matchPotential || 85}%</div>
                <div className="text-xs text-slate-500 font-medium">Profile Score</div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-blue-500" /> Career & Education
                </h3>
                <Separator className="bg-slate-100 mb-4" />
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Profession</div>
                    <div className="text-base font-medium text-slate-900">{customer.profession || customer.designation} {customer.currentCompany ? `at ${customer.currentCompany}` : ''}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Income</div>
                    <div className="text-base font-medium text-slate-900">{customer.income || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Highest Education</div>
                    <div className="text-base font-medium text-slate-900">{customer.education}</div>
                  </div>
                  {(customer as any).college && (
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">College/University</div>
                      <div className="text-base font-medium text-slate-900">{(customer as any).college}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-rose-500" /> Lifestyle & Family
                </h3>
                <Separator className="bg-slate-100 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Diet</div>
                    <div className="text-base font-medium text-slate-900">{customer.diet || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Drinking</div>
                    <div className="text-base font-medium text-slate-900">{customer.drinking || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Smoking</div>
                    <div className="text-base font-medium text-slate-900">{customer.smoking || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Family Type</div>
                    <div className="text-base font-medium text-slate-900">{customer.familyType || 'Unknown'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Languages</div>
                    <div className="text-base font-medium text-slate-900">{(customer.languages || []).join(', ') || 'English'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 mb-4">
                  <GraduationCap className="w-5 h-5 text-purple-500" /> Core Preferences
                </h3>
                <Separator className="bg-slate-100 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Want Kids?</div>
                    <div className="text-base font-medium text-slate-900">{customer.wantKids || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Open to Relocate?</div>
                    <div className="text-base font-medium text-slate-900">{customer.openToRelocate || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Open to Pets?</div>
                    <div className="text-base font-medium text-slate-900">{customer.openToPets || 'Unknown'}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Personality</div>
                    <div className="text-base font-medium text-slate-900">{(customer as any).personalityType || 'Unknown'}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          {/* Bottom section */}
          <div className="mt-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Relationship Snapshot
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Goal</div>
                  <div className="text-sm font-bold text-slate-900">{customer.relationshipGoal || 'Unknown'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Family</div>
                  <div className="text-sm font-bold text-slate-900">{customer.familyOrientation || 'Unknown'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Career</div>
                  <div className="text-sm font-bold text-slate-900">{customer.careerFocus || 'Unknown'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Lifestyle</div>
                  <div className="text-sm font-bold text-slate-900">{customer.lifestyleType || 'Unknown'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Flexibility</div>
                  <div className="text-sm font-bold text-slate-900">{customer.flexibility || 'Unknown'}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Readiness</div>
                  <div className="text-sm font-bold text-slate-900">{customer.marriageReadiness || 'Unknown'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Sticky */}
        <DialogFooter className="p-6 bg-white border-t border-slate-100 shrink-0 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:justify-between items-center flex-row">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-medium text-slate-600">Active Profile</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm px-4 gap-2" onClick={() => openCalendar('Meeting')}>
              <Calendar className="w-4 h-4" /> Meeting
            </Button>
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm px-4 gap-2" onClick={() => openCalendar('Follow Up')}>
              <Phone className="w-4 h-4" /> Follow-up
            </Button>
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm px-4 gap-2" onClick={() => openCalendar('Reminder')}>
              <Bell className="w-4 h-4" /> Reminder
            </Button>
          </div>
          <div className="flex gap-3 mt-4 sm:mt-0">
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 shadow-sm h-11 px-8" onClick={onClose}>
              Close
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-sm h-11 px-8">
              Edit Details
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {customer && (
      <CalendarEventModal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        initialCustomer={customer.id}
      />
    )}
    </>
  );
}
