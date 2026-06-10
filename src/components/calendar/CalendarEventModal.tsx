import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalendarStore } from '@/store/calendarStore';
import { useCustomerStore } from '@/store/customerStore';
import type { CalendarEvent, CalendarEventType } from '@/types';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialCustomer?: string; // customer id
  existingEvent?: CalendarEvent;
}

const EVENT_TYPES: CalendarEventType[] = [
  'Meeting', 'Follow Up', 'Match Review', 'Profile Review', 'Verification', 'Reminder', 'AI Suggested Task'
];

const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['Pending', 'Completed', 'Rescheduled', 'Cancelled'];

export function CalendarEventModal({
  isOpen,
  onClose,
  initialDate,
  initialCustomer,
  existingEvent,
}: CalendarEventModalProps) {
  const { addEvent, updateEvent } = useCalendarStore();
  const { customers } = useCustomerStore();

  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState<string>('none');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<CalendarEventType>('Meeting');
  const [priority, setPriority] = useState<'High'|'Medium'|'Low'>('Medium');
  const [status, setStatus] = useState<'Pending'|'Completed'|'Rescheduled'|'Cancelled'>('Pending');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (existingEvent) {
        setTitle(existingEvent.title);
        setCustomerId(existingEvent.customerId || 'none');
        setDate(existingEvent.date);
        setStartTime(existingEvent.startTime);
        setEndTime(existingEvent.endTime);
        setType(existingEvent.type);
        setPriority(existingEvent.priority);
        setStatus(existingEvent.status);
        setNotes(existingEvent.notes);
      } else {
        setTitle('');
        setCustomerId(initialCustomer || 'none');
        setDate(initialDate ? initialDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setStartTime('09:00');
        setEndTime('10:00');
        setType('Meeting');
        setPriority('Medium');
        setStatus('Pending');
        setNotes('');
      }
    }
  }, [isOpen, existingEvent, initialDate, initialCustomer]);

  const handleSave = async () => {
    if (!title || !date || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      const selectedCustomer = customers.find(c => c.id === customerId);
      
      const payload: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> = {
        title,
        customerId: customerId === 'none' ? undefined : customerId,
        customerName: selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : undefined,
        date,
        startTime,
        endTime,
        type,
        priority,
        status,
        notes
      };

      if (existingEvent) {
        await updateEvent(existingEvent.id, payload);
      } else {
        await addEvent(payload);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{existingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Type</label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Customer (Optional)</label>
              <Select value={customerId} onValueChange={(val) => setCustomerId(val || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Start Time</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">End Time</label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Priority</label>
              <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">Status</label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Notes</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting || !title || !date || !startTime || !endTime}>
            {isSubmitting ? 'Saving...' : 'Save Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
