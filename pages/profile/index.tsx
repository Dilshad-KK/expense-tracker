import React, { useEffect, useMemo, useState } from 'react';
import CommonHeader from '@/components/commonHeader';
import { setTheme } from '@/utils/theme';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { setThemeName } from '@/store/uiSlice';
import { HiUser, HiMoon, HiSun, HiCheck, HiClock } from 'react-icons/hi2';
import { HiGlobe } from 'react-icons/hi';

const Profile = () => {
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const suggestedUser = useMemo(() => (tz?.includes('Asia/Dubai') ? 'Dilshad' : 'Shifa Dilshad'), [tz]);
  const [selected, setSelected] = useState<'auto' | 'dilshad' | 'shifa'>('auto');
  const [saved, setSaved] = useState('');
  const dispatch = useDispatch();
  const theme = useSelector((s: RootState) => s.ui.theme);

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
    <button
      className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 active:scale-[0.98] ${
        isSelected
          ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-sm'
          : 'border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-300 active:border-primary/50'
      }`}
      onClick={() => setSelected(value as any)}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
        isSelected 
          ? 'border-primary bg-primary' 
          : 'border-base-400 dark:border-base-600'
      }`}>
        {isSelected && <HiCheck className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm font-poppinsMed text-left ${
        isSelected 
          ? 'text-primary dark:text-primary-light' 
          : 'text-base-content dark:text-base-content/80'
      }`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className='min-h-screen bg-base-100 dark:bg-base-200 pb-32'>
      <CommonHeader title='Profile Settings' />
      
      <div className='max-w-md mx-auto px-5 space-y-6'>
        {/* Time Zone Card */}
        <div className='bg-base-200 dark:bg-base-300 rounded-2xl border border-base-300 dark:border-base-700 p-5 shadow-sm'>
          <div className='flex items-start space-x-4'>
            <div className='w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0'>
              <HiGlobe className='w-5 h-5 text-primary' />
            </div>
            <div className='flex-1'>
              <h3 className='text-sm font-poppinsBold text-base-content dark:text-base-content/90 mb-2'>Time Zone</h3>
              <p className='text-sm text-base-content/70 dark:text-base-content/60 mb-3'>{tz}</p>
              <div className='text-xs text-base-content/60 dark:text-base-content/50 bg-base-100 dark:bg-base-400 rounded-lg px-3 py-2 border border-base-300 dark:border-base-600'>
                Suggested user: <span className='font-poppinsBold text-base-content dark:text-base-content/90'>{suggestedUser}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Selection Card */}
        <div className='bg-base-200 dark:bg-base-300 rounded-2xl border border-base-300 dark:border-base-700 p-5 shadow-sm'>
          <div className='flex items-center mb-4'>
            <div className='w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mr-3'>
              <HiUser className='w-4 h-4 text-primary' />
            </div>
            <h3 className='text-sm font-poppinsBold text-base-content dark:text-base-content/90'>Choose User Identity</h3>
          </div>
          
          <div className='space-y-3'>
            <RadioButton
              value='auto'
              label={`Auto — ${suggestedUser}`}
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

        {/* Theme Selection Card */}
        <div className='bg-base-200 dark:bg-base-300 rounded-2xl border border-base-300 dark:border-base-700 p-5 shadow-sm'>
          <div className='flex items-center mb-4'>
            <div className='w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mr-3'>
              <HiMoon className='w-4 h-4 text-primary' />
            </div>
            <h3 className='text-sm font-poppinsBold text-base-content dark:text-base-content/90'>Theme Selection</h3>
          </div>
          
          <div className='mb-2'>
            <p className='text-xs text-base-content/60 dark:text-base-content/50 mb-4'>
              Choose from all available themes. Your selection will apply immediately.
            </p>
            <ThemeGallery active={theme} onSelect={(t) => dispatch(setThemeName(t))} />
          </div>
        </div>

        {/* Save Button */}
        <div className='sticky bottom-6 bg-base-100 dark:bg-base-200 pt-4 pb-8 -mx-5 px-5'>
          <button
            onClick={handleSave}
            className='w-full bg-primary text-primary-content py-4 px-4 rounded-xl font-poppinsMed text-base hover:bg-primary-focus active:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]'
          >
            Save Changes
          </button>

          {/* Success Message */}
          {saved && (
            <div className='flex items-center justify-center space-x-2 p-4 mt-4 bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30 rounded-xl animate-fade-in'>
              <HiCheck className='w-5 h-5 text-success' />
              <span className='text-sm text-success font-poppinsMed'>{saved}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

// DaisyUI built-in themes plus our customs - organized by type
const ALL_THEMES = [
  { name: 'ikbu', category: 'Custom' },
  { name: 'ikbu-dark', category: 'Custom' },
  { name: 'light', category: 'Light' },
  { name: 'dark', category: 'Dark' },
  { name: 'cupcake', category: 'Light' },
  { name: 'bumblebee', category: 'Light' },
  { name: 'emerald', category: 'Light' },
  { name: 'corporate', category: 'Light' },
  { name: 'synthwave', category: 'Dark' },
  { name: 'retro', category: 'Light' },
  { name: 'cyberpunk', category: 'Colorful' },
  { name: 'valentine', category: 'Light' },
  { name: 'halloween', category: 'Dark' },
  { name: 'garden', category: 'Light' },
  { name: 'forest', category: 'Dark' },
  { name: 'aqua', category: 'Light' },
  { name: 'lofi', category: 'Light' },
  { name: 'pastel', category: 'Light' },
  { name: 'fantasy', category: 'Light' },
  { name: 'wireframe', category: 'Light' },
  { name: 'black', category: 'Dark' },
  { name: 'luxury', category: 'Dark' },
  { name: 'dracula', category: 'Dark' },
  { name: 'cmyk', category: 'Light' },
  { name: 'autumn', category: 'Light' },
  { name: 'business', category: 'Dark' },
  { name: 'acid', category: 'Colorful' },
  { name: 'lemonade', category: 'Light' },
  { name: 'night', category: 'Dark' },
  { name: 'coffee', category: 'Dark' },
  { name: 'winter', category: 'Light' },
  { name: 'dim', category: 'Dark' },
  { name: 'nord', category: 'Light' },
  { name: 'sunset', category: 'Dark' }
];

// Group themes by category
const groupedThemes = ALL_THEMES.reduce((acc, theme) => {
  if (!acc[theme.category]) {
    acc[theme.category] = [];
  }
  acc[theme.category].push(theme.name);
  return acc;
}, {} as Record<string, string[]>);

function ThemeGallery({ active, onSelect }: { active: string; onSelect: (t: string) => void }) {
  return (
    <div className='space-y-4 pr-1 py-1'>
      {Object.entries(groupedThemes).map(([category, themes]) => (
        <div key={category} className='space-y-2'>
          <h4 className='text-xs font-poppinsMed text-base-content/60 dark:text-base-content/50 uppercase tracking-wide'>
            {category} Themes
          </h4>
          <div className='grid grid-cols-3 gap-2'>
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => onSelect(theme)}
                className={`text-xs px-2 py-3 rounded-lg border transition-all active:scale-95 text-center ${
                  active === theme 
                    ? 'border-primary bg-primary/10 text-primary font-poppinsMed shadow-sm' 
                    : 'border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-400 text-base-content/70 active:border-primary/50'
                }`}
                aria-label={`Switch to ${theme} theme`}
              >
                {theme.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
