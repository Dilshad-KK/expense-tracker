export type Subscription = {
  id: number;
  name: string;
  amount: number | string;
  currency: string;
  billing_cycle: string;
  renewal_date: string | null;
  status: string;
  notes: string | null;
  user: string | null;
  created_at: string;
};
