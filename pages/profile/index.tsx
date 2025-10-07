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
    <div
      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 group ${
        isSelected
          ? 'border-primary bg-primary/10 dark:bg-primary/20'
          : 'border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-300 hover:border-primary/50 dark:hover:border-primary/40'
      }`}
      onClick={() => setSelected(value as any)}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
        isSelected 
          ? 'border-primary bg-primary' 
          : 'border-base-400 dark:border-base-600 group-hover:border-primary/70'
      }`}>
        {isSelected && <HiCheck className="w-2 h-2 text-white" />}
      </div>
      <span className={`text-xs font-poppinsMed ${
        isSelected 
          ? 'text-primary dark:text-primary-light' 
          : 'text-base-content dark:text-base-content/80'
      }`}>
        {label}
      </span>
    </div>
  );

  const ThemeButton = ({ themeName, label, icon, isActive }: { themeName: string; label: string; icon: React.ReactNode; isActive: boolean }) => (
    <button
      onClick={() => dispatch(setThemeName(themeName))}
      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 ${
        isActive
          ? 'border-primary bg-primary/10 dark:bg-primary/20'
          : 'border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-300 hover:border-primary/50 dark:hover:border-primary/40'
      }`}
    >
      <div className={`transition-colors ${
        isActive ? 'text-primary' : 'text-base-content/60 dark:text-base-content/50'
      }`}>
        {icon}
      </div>
      <span className={`text-xs font-poppinsMed ${
        isActive 
          ? 'text-primary dark:text-primary-light' 
          : 'text-base-content dark:text-base-content/80'
      }`}>
        {label}
      </span>
    </button>
  );

  return (
    <div className='min-h-screen bg-base-100 dark:bg-base-200 pb-24'>
      <CommonHeader title='Profile Settings' />
      
      <div className='max-w-md mx-auto p-4 space-y-4'>
        {/* Time Zone Card */}
        <div className='bg-base-200 dark:bg-base-300 rounded-xl border border-base-300 dark:border-base-700 p-4'>
          <div className='flex items-start space-x-3'>
            <div className='w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0'>
              <HiGlobe className='w-4 h-4 text-primary' />
            </div>
            <div className='flex-1'>
              <h3 className='text-xs font-poppinsBold text-base-content dark:text-base-content/90 mb-1'>Time Zone</h3>
              <p className='text-xs text-base-content/70 dark:text-base-content/60 mb-2'>{tz}</p>
              <div className='text-xs text-base-content/60 dark:text-base-content/50 bg-base-100 dark:bg-base-400 rounded px-2 py-1 border border-base-300 dark:border-base-600'>
                Suggested user: <span className='font-poppinsBold text-base-content dark:text-base-content/90'>{suggestedUser}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Selection Card */}
        <div className='bg-base-200 dark:bg-base-300 rounded-xl border border-base-300 dark:border-base-700 p-4'>
          <div className='flex items-center mb-3'>
            <HiUser className='w-3 h-3 text-base-content/60 dark:text-base-content/50 mr-2' />
            <h3 className='text-xs font-poppinsBold text-base-content dark:text-base-content/90'>Choose User Identity</h3>
          </div>
          
          <div className='space-y-2'>
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
        <div className='bg-base-200 dark:bg-base-300 rounded-xl border border-base-300 dark:border-base-700 p-4'>
          <div className='flex items-center mb-3'>
            <HiMoon className='w-3 h-3 text-base-content/60 dark:text-base-content/50 mr-2' />
            <h3 className='text-xs font-poppinsBold text-base-content dark:text-base-content/90'>Theme</h3>
          </div>
          
          {/* Quick toggle between our defaults */}
          <div className='flex gap-2 mb-3'>
            <ThemeButton themeName='ikbu' label='Light' icon={<HiSun className="w-4 h-4" />} isActive={theme === 'ikbu'} />
            <ThemeButton themeName='ikbu-dark' label='Dark' icon={<HiMoon className="w-4 h-4" />} isActive={theme === 'ikbu-dark'} />
          </div>

          {/* Full theme gallery */}
          <ThemeGallery active={theme} onSelect={(t) => dispatch(setThemeName(t))} />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className='w-full bg-primary text-primary-content py-3 px-4 rounded-lg font-poppinsMed text-sm hover:bg-primary-focus active:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.98]'
        >
          Save Changes
        </button>

        {/* Success Message */}
        {saved && (
          <div className='flex items-center justify-center space-x-2 p-3 bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30 rounded-lg animate-fade-in'>
            <HiCheck className='w-4 h-4 text-success' />
            <span className='text-xs text-success font-poppinsMed'>{saved}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

// DaisyUI built-in themes plus our customs
const ALL_THEMES: string[] = [
  'ikbu', 'ikbu-dark',
  'light','dark','cupcake','bumblebee','emerald','corporate','synthwave','retro','cyberpunk','valentine','halloween','garden','forest','aqua','lofi','pastel','fantasy','wireframe','black','luxury','dracula','cmyk','autumn','business','acid','lemonade','night','coffee','winter','dim','nord','sunset'
];

function ThemeGallery({ active, onSelect }: { active: string; onSelect: (t: string) => void }) {
  return (
    <div className='grid grid-cols-3 gap-2 max-h-64 overflow-auto pr-1'>
      {ALL_THEMES.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className={`text-[11px] px-2 py-2 rounded-lg border transition-all truncate ${
            active === t ? 'border-primary bg-primary/10 text-primary' : 'border-base-300 dark:border-base-700 hover:border-primary/50 text-base-content/70'
          }`}
          aria-label={`Switch to ${t} theme`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
