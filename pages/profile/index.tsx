import React, { useEffect, useMemo, useState } from 'react';
import CommonHeader from '@/components/commonHeader';

const Profile = () => {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const suggestedUser = useMemo(() => (tz?.includes('Asia/Dubai') ? 'Dilshad' : 'Shifa Dilshad'), [tz]);
  const [selected, setSelected] = useState<'auto' | 'dilshad' | 'shifa'>('auto');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    try {
      const current = localStorage.getItem('userIdentity');
      if (!current) {
        setSelected('auto');
        return;
      }
      if (current === 'Dilshad') setSelected('dilshad');
      else if (current === 'Shifa Dilshad') setSelected('shifa');
      else setSelected('auto');
    } catch {}
  }, []);

  const handleSave = () => {
    try {
      let value = suggestedUser;
      if (selected === 'dilshad') value = 'Dilshad';
      if (selected === 'shifa') value = 'Shifa Dilshad';
      if (selected === 'auto') value = suggestedUser;
      localStorage.setItem('userIdentity', value);
      localStorage.setItem('userIdentityMode', selected);
      setSaved('Settings saved successfully!');
      setTimeout(() => setSaved(''), 3000);
    } catch {}
  };

  const RadioButton = ({ value, label, isSelected }: { value: string; label: string; isSelected: boolean }) => (
    <div
      className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={() => setSelected(value as any)}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 ${
        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
      }`}>
        {isSelected && <div className='w-1.5 h-1.5 rounded-full bg-white' />}
      </div>
      <span className='text-sm text-gray-800'>{label}</span>
    </div>
  );

  return (
    <div className='min-h-screen bg-gray-50 pb-28'>
      <CommonHeader title='Profile Settings' />
      
      <div className='max-w-md mx-auto p-6'>
        {/* Time Zone Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'>
          <div className='flex items-start space-x-3'>
            <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center'>
              <svg className='w-4 h-4 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
            </div>
            <div className='flex-1'>
              <h3 className='text-sm font-semibold text-gray-900 mb-1'>Time Zone</h3>
              <p className='text-sm text-gray-700 mb-2'>{tz}</p>
              <div className='text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
                Suggested user: <span className='font-semibold text-gray-900'>{suggestedUser}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Selection Card */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'>
          <h3 className='text-sm font-semibold text-gray-900 mb-4'>Choose User Identity</h3>
          
          <div className='space-y-3'>
            <RadioButton
              value='auto'
              label={`Auto (Based on timezone) — ${suggestedUser}`}
              isSelected={selected === 'auto'}
            />
            <RadioButton
              value='dilshad'
              label='Dilshad'
              isSelected={selected === 'dilshad'}
            />
            <RadioButton
              value='shifa'
              label='Shifa Dilshad'
              isSelected={selected === 'shifa'}
            />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className='w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 shadow-sm hover:shadow-md'
        >
          Save Changes
        </button>

        {/* Success Message */}
        {saved && (
          <div className='flex items-center justify-center space-x-2 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl'>
            <svg className='w-4 h-4 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
            <span className='text-sm text-green-700 font-medium'>{saved}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
