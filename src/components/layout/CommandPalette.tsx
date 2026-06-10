import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useUIStore } from '@/store/uiStore';
import { useCustomerStore } from '@/store/customerStore';
import { useMatchStore } from '@/store/matchStore';
import { useCalendarStore } from '@/store/calendarStore';
import { User, Calendar, FileText, Bot, Activity, PlusCircle } from 'lucide-react';
import type { Customer, CalendarEvent, Match } from '@/types';

export function CommandPalette() {
  const navigate = useNavigate();
  const {
    isSearchOpen, setSearchOpen,
    setProfileModalOpen,
    setAnalyticsPanelOpen,
    setGenerateBriefOpen,
    setReviewMatchesOpen
  } = useUIStore();

  const { customers, setSelectedCustomer } = useCustomerStore();
  const { matches } = useMatchStore();
  const { events: calendarEvents } = useCalendarStore();

  const runCommand = (command: () => void) => {
    setSearchOpen(false);
    command();
  };

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isSearchOpen, setSearchOpen]);

  return (
    <CommandDialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => navigate('/customers/new'))}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>Create Customer</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setAnalyticsPanelOpen(true))}>
            <Bot className="mr-2 h-4 w-4" />
            <span>Open Intelligence Center</span>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />

        <CommandGroup heading="Customers">
          {customers.map((c) => (
            <CommandItem
              key={`cust-${c.id}`}
              value={`${c.firstName} ${c.lastName} ${c.profession || ''} ${c.city || ''} ${c.id}`}
              onSelect={() => runCommand(() => {
                setSelectedCustomer(c);
                setProfileModalOpen(true);
              })}
            >
              <User className="mr-2 h-4 w-4 text-slate-500" />
              <span>{c.firstName} {c.lastName}</span>
              <span className="ml-2 text-xs text-slate-400">
                {c.profession} • {c.city}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Calendar Events">
          {calendarEvents.map((e) => (
            <CommandItem
              key={`evt-${e.id}`}
              value={`${e.title} ${e.type} ${e.customerName || ''} ${e.date}`}
              onSelect={() => runCommand(() => navigate('/calendar'))}
            >
              <Calendar className="mr-2 h-4 w-4 text-slate-500" />
              <span>{e.title}</span>
              <span className="ml-2 text-xs text-slate-400">{e.date}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Matches">
          {matches.map((m) => {
            const customer = customers.find(c => c.id === m.customerId);
            const candidate = customers.find(c => c.id === m.matchedCustomerId);
            const nameA = customer ? `${customer.firstName} ${customer.lastName}` : m.customerId;
            const nameB = candidate ? `${candidate.firstName} ${candidate.lastName}` : m.matchedCustomerId;
            return (
              <CommandItem
                key={`match-${m.id}`}
                value={`Match ${nameA} ${nameB} ${m.compatibilityScore} ${m.status}`}
                onSelect={() => runCommand(() => {
                  if (customer) {
                    setSelectedCustomer(customer);
                    setReviewMatchesOpen(true);
                  }
                })}
              >
                <Activity className="mr-2 h-4 w-4 text-slate-500" />
                <span>Match: {nameA} & {nameB}</span>
                <span className="ml-2 text-xs text-slate-400">Score: {m.compatibilityScore}% • {m.status}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

      </CommandList>
    </CommandDialog>
  );
}
