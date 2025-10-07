import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type Expense = {
  id: number;
  amount: number;
  note: string;
  type: string;
  balance: string;
  created_at: string;
};

export type GroupedExpenses = Record<string, Expense[]>;

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Expenses'],
  // Make cached data short‑lived and refresh-friendly
  refetchOnFocus: true,
  refetchOnReconnect: true,
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getGroupedExpenses: builder.query<{ grouped: GroupedExpenses }, { apiPath: string; filter?: string }>(
      {
        query: ({ apiPath, filter }) => {
          const f = filter ?? 'all';
          return `${apiPath}?filter=${encodeURIComponent(f)}`;
        },
        // Always refetch when component mounts/args change to pick latest server state
        providesTags: (res, err, arg) => [{ type: 'Expenses', id: arg.apiPath }],
      }
    ),
  }),
});

export const { useGetGroupedExpensesQuery } = api;
