import { useEffect, useState } from 'react';
import moment from 'moment';
import CommonHeader from '@/components/commonHeader';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { useAppDispatch } from '@/lib/store';
import { fetchNotifications, markAllRead as markAllReadThunk, markRead as markReadThunk, clearAll as clearAllThunk, clearRead as clearReadThunk, clearOne as clearOneThunk } from '@/store/notificationsSlice';

export default function NotificationsPage() {
  const [status, setStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const dispatch = useAppDispatch();
  const itemsUnread = useSelector((s: RootState) => s.notifications.itemsByFilter.unread);
  const itemsRead = useSelector((s: RootState) => s.notifications.itemsByFilter.read);
  const loading = useSelector((s: RootState) => s.notifications.loading);

  useEffect(() => { dispatch(fetchNotifications(activeTab)); }, [dispatch]);

  const resetPWA = async () => {
    setStatus('Resetting PWA: unregistering service workers and clearing caches...');
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          try {
            const sub = await r.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
          } catch {}
        }
        await Promise.all(regs.map(r => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      setStatus('Reset complete. Reloading...');
      setTimeout(() => window.location.reload(), 500);
    } catch (e: any) {
      setStatus(`Reset failed: ${e?.message || 'unknown error'}`);
    }
  };

  const refresh = async () => { setStatus(''); dispatch(fetchNotifications(activeTab)); };

  useEffect(() => { dispatch(fetchNotifications(activeTab)); }, [dispatch, activeTab]);

  const markAllRead = async () => { setStatus(''); dispatch(markAllReadThunk()); };
  const markRead = async (id: any) => { setStatus(''); dispatch(markReadThunk(Number(id))); };

  const filtered = (activeTab === 'unread' ? itemsUnread : itemsRead);

  return (
    <div className='min-h-screen bg-base-100'>
      <CommonHeader title='Notifications' />
      
      <div className='max-w-2xl mx-auto p-4'>
        {/* Header Actions - Mobile Responsive */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6'>
          {/* Left Side - Primary Actions */}
          <div className='flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto'>
            <button
              onClick={markAllRead}
              title='Mark all notifications as read'
              className='flex items-center space-x-1 px-3 py-2 text-xs text-primary border border-base-300 dark:border-base-400 rounded-lg bg-base-100 dark:bg-base-200 hover:bg-primary/10 transition-colors flex-1 sm:flex-none justify-center'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
              </svg>
              <span className='hidden xs:inline'>Mark all read</span>
              <span className='xs:hidden'>Mark</span>
            </button>
            
            <button
              onClick={refresh}
              title='Refresh list'
              className='flex items-center space-x-1 px-3 py-2 text-xs text-base-content/70 border border-base-300 dark:border-base-400 rounded-lg bg-base-100 dark:bg-base-200 hover:bg-base-200 dark:hover:bg-base-300 transition-colors flex-1 sm:flex-none justify-center'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
              <span className=''>Refresh</span>
            </button>
          </div>
          
          {/* Right Side - Clear Actions */}
          <div className='flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto'>
            <button
              onClick={() => dispatch(clearReadThunk())}
              title='Delete read notifications'
              className='px-3 py-2 text-xs text-base-content/70 border border-base-300 dark:border-base-400 rounded-lg bg-base-100 dark:bg-base-200 hover:bg-base-200 dark:hover:bg-base-300 transition-colors flex-1 sm:flex-none justify-center text-center'
            >
              <span className='hidden xs:inline'>Clear read</span>
              <span className='xs:hidden'>Clr Read</span>
            </button>
            <button
              onClick={() => dispatch(clearAllThunk())}
              title='Delete all notifications'
              className='px-3 py-2 text-xs text-error border border-error/30 rounded-lg bg-base-100 dark:bg-base-200 hover:bg-error/10 transition-colors flex-1 sm:flex-none justify-center text-center'
            >
              <span className='hidden xs:inline'>Clear all</span>
              <span className='xs:hidden'>Clr All</span>
            </button>
          </div>
        </div>

        {/* Alternative Compact Header Layout */}
        {/* 
        <div className='flex flex-wrap gap-2 mb-6 justify-center'>
          <button
            onClick={markAllRead}
            className='flex items-center space-x-1 px-3 py-2 text-xs text-blue-600 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
            <span>Mark read</span>
          </button>
          
          <button
            onClick={refresh}
            className='flex items-center space-x-1 px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
            </svg>
            <span>Refresh</span>
          </button>

          <button
            onClick={() => dispatch(clearReadThunk())}
            className='px-3 py-2 text-xs text-gray-600 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors'
          >
            Clear read
          </button>
          
          <button
            onClick={() => dispatch(clearAllThunk())}
            className='px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg bg-white hover:bg-red-50 transition-colors'
          >
            Clear all
          </button>
        </div>
        */}

        {/* Tabs */}
        <div className='flex bg-base-100 dark:bg-base-200 rounded-xl border border-base-300 dark:border-base-400 p-1 mb-6'>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'unread'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            Unread
            {itemsUnread.length > 0 && (
              <span className='ml-2 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded-full'>
                {itemsUnread.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'read'
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-base-content/70 hover:text-base-content'
            }`}
          >
            Read
          </button>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className='flex justify-center items-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        ) : (
          <div className='space-y-3'>
            {filtered.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 mx-auto mb-4 bg-base-200 rounded-full flex items-center justify-center'>
                  <svg className='w-8 h-8 text-base-content/50' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' />
                  </svg>
                </div>
                <p className='text-base-content/60 text-sm'>No {activeTab} notifications</p>
              </div>
            ) : (
              filtered.map((n, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    !n.read
                      ? 'bg-base-100 dark:bg-base-200 border-primary/30 shadow-sm'
                      : 'bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 mr-3'>
                      <div className='flex items-start space-x-3'>
                        {!n.read && (
                          <div className='w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0'></div>
                        )}
                        <div className='flex-1'>
                          <h3 className={`text-sm font-semibold mb-1 ${
                            !n.read ? 'text-base-content' : 'text-base-content/80'
                          }`}>
                            {n.title}
                          </h3>
                          <p className='text-sm text-base-content/70 mb-2'>{n.body}</p>
                          {n.created_at && (
                            <div className='text-xs text-base-content/60 flex items-center'>
                              <svg className='w-3 h-3 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
                              </svg>
                              {moment(n.created_at).fromNow()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className='flex items-center space-x-1 flex-shrink-0'>
                      {n.link && (
                        <a
                          href={n.link}
                          className='p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors'
                          title='Open'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14' />
                          </svg>
                        </a>
                      )}
                      
                      {!n.read && (
                        <button
                          onClick={() => markRead(n.id)}
                          className='p-2 text-success hover:bg-success/10 rounded-lg transition-colors'
                          title='Mark as read'
                        >
                          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => dispatch(clearOneThunk(Number(n.id)))}
                        className='p-2 text-error hover:bg-error/10 rounded-lg transition-colors'
                        title='Delete'
                      >
                        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div className='mt-4 p-3 bg-primary/10 border border-primary/30 rounded-lg'>
            <div className='text-xs text-primary flex items-center'>
              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              {status}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
