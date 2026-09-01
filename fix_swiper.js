const fs = require('fs');

const fixFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix goToPage
  content = content.replace(
    /const goToPage = \(pageNumber: number\) => {[\s\S]*?};/,
    `const goToPage = (pageNumber: number) => {
    const el = document.getElementById(\`mushaf-page-\${pageNumber}\`);
    if (el) {
      const container = el.parentElement;
      if (container) {
        // RTL scroll offsets are negative or positive depending on browser.
        // Easiest is to set scrollLeft to the element's offsetLeft relative to container
        // Note: Safari in RTL may need negative values, but offsetLeft usually gives the raw coordinate.
        container.scrollTo({ left: el.offsetLeft - container.offsetLeft, behavior: 'smooth' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };`
  );

  // Fix swipable pages class to be 50% on desktop and snap-start
  content = content.replace(
    /className={mushafViewMode === 'swipable' \? "no-scrollbar min-w-full w-full h-full overflow-y-auto shrink-0 snap-center px-4 pt-4 pb-\[calc\(8rem\+env\(safe-area-inset-bottom\)\)\]" : "mb-8"}/g,
    'className={mushafViewMode === \'swipable\' ? "no-scrollbar min-w-full md:min-w-[50%] w-full md:w-1/2 h-full overflow-y-auto shrink-0 snap-start px-4 pt-4 pb-[calc(8rem+env(safe-area-inset-bottom))]" : "mb-8"}'
  );
  
  // Also fix the select onChange just in case it doesn't update currentPage
  content = content.replace(
    /onChange={\(e\) => goToPage\(Number\(e\.target\.value\)\)}/g,
    `onChange={(e) => {
                  setCurrentPage(Number(e.target.value));
                  goToPage(Number(e.target.value));
                }}`
  );
  
  // Also remove max-w-3xl from the swiper wrapper!
  // It shouldn't be max-w-3xl, it should be w-full, but if it's max-w-3xl it restricts the desktop view.
  // Wait, I will just change it back to max-w-7xl so it uses the full screen!
  // Line 322: <div className={`max-w-3xl w-full mx-auto ${isMushafMode && mushafViewMode === 'swipable' ? 'flex-1 flex flex-col min-h-0' : ''}`}>
  content = content.replace(
    /<div className={`max-w-3xl w-full mx-auto \${isMushafMode && mushafViewMode === 'swipable' \? 'flex-1 flex flex-col min-h-0' : ''}`}/g,
    '<div className={`max-w-7xl w-full mx-auto ${isMushafMode && mushafViewMode === \'swipable\' ? \'flex-1 flex flex-col min-h-0\' : \'\'}`}'
  );

  fs.writeFileSync(filePath, content);
};

fixFile('/Users/dilshadkk/Developer/Personal/Web/NextJS/tuition-platform/src/app/quran/[id]/QuranReaderClient.tsx');
fixFile('/Users/dilshadkk/Developer/Personal/Web/NextJS/expense-tracker/src/app/quran/[id]/QuranReaderClient.tsx');

