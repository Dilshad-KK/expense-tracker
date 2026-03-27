export type WorkData = {
  id: number;
  month: string; // stored as a DATE (YYYY-MM-DD)
  days_worked: number;
  leave_taken: number;
  annual_leave_total: number;
  annual_leave_remaining: number;
  sick_leave_taken: number;
  unpaid_leave_taken: number;
  wfh_days: number;
  overtime_hours: number | string;
  notes: string | null;
  user: string | null;
  created_at: string;
};

