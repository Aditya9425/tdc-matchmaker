import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { useCustomerStore } from '@/store/customerStore';
import { useCalendarStore } from '@/store/calendarStore';
import CustomerProfileModal from '@/components/customers/CustomerProfileModal';
import { ReviewMatchesPanel } from '@/components/dashboard/ReviewMatchesPanel';
import { GenerateBriefPanel } from '@/components/dashboard/GenerateBriefPanel';
import { AIAnalyticsPanel } from '@/components/dashboard/AIAnalyticsPanel';
import { calculateCustomerPriority } from '@/services/priorityEngine';
import { format } from 'date-fns';
import { CopilotPanel } from '@/components/copilot/CopilotPanel';

export function GlobalModals() {
  const {
    isProfileModalOpen, setProfileModalOpen,
    isReviewMatchesOpen, setReviewMatchesOpen,
    isGenerateBriefOpen, setGenerateBriefOpen,
    isAnalyticsPanelOpen, setAnalyticsPanelOpen
  } = useUIStore();

  const { customers, selectedCustomer } = useCustomerStore();
  const { events: calendarEvents } = useCalendarStore();

  const metricsPayload = {
    customersRequiringAttention: customers.filter(c => calculateCustomerPriority(c, [], calendarEvents.filter(e => e.customerId === c.id)).score >= 3).length,
    highConfidencePending: 8,
    overdueFollowUps: calendarEvents.filter(e => e.status === 'Pending' && new Date(e.date + 'T' + e.startTime).getTime() < new Date().getTime()).length,
    profilesAwaitingVerification: customers.filter(c => !c.verified).length,
    meetingsScheduledToday: calendarEvents.filter(e => e.date === format(new Date(), 'yyyy-MM-dd') && e.type === 'Meeting').length,
    newProfilesThisWeek: customers.filter(c => new Date(c.joinedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  };

  return (
    <>
      {isProfileModalOpen && <CustomerProfileModal />}
      
      <ReviewMatchesPanel 
        isOpen={isReviewMatchesOpen}
        onClose={() => setReviewMatchesOpen(false)}
        customer={selectedCustomer}
        allCustomers={customers}
      />
      
      <GenerateBriefPanel
        isOpen={isGenerateBriefOpen}
        onClose={() => setGenerateBriefOpen(false)}
        customer={selectedCustomer}
      />
      
      <AIAnalyticsPanel
        isOpen={isAnalyticsPanelOpen}
        onClose={() => setAnalyticsPanelOpen(false)}
        metricsPayload={metricsPayload}
      />

      <CopilotPanel />
    </>
  );
}
