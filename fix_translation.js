const fs = require('fs');

const fixFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. main tag
  content = content.replace(
    /<main className={`flex-1 flex flex-col w-full relative \${mushafViewMode === 'swipable' \? 'overflow-hidden' : 'overflow-y-auto px-4 py-4 pb-32'}`}>/g,
    "<main className={`flex-1 flex flex-col w-full relative ${isMushafMode && mushafViewMode === 'swipable' ? 'overflow-hidden' : 'overflow-y-auto px-4 py-4 pb-32'}`}>"
  );
  
  // Also try replacing the original main tag if my previous replace failed
  content = content.replace(
    /<main className={`flex-1 \${isMushafMode && mushafViewMode === 'swipable' \? 'overflow-hidden px-0 py-0 flex flex-col' : 'overflow-y-auto px-4 py-4 pb-32'}`}>/g,
    "<main className={`flex-1 flex flex-col w-full relative ${isMushafMode && mushafViewMode === 'swipable' ? 'overflow-hidden' : 'overflow-y-auto px-4 py-4 pb-32'}`}>"
  );

  // 2. Translation container div
  content = content.replace(
    /className={mushafViewMode === 'swipable' \? "flex flex-1 min-h-0 overflow-x-auto snap-x snap-mandatory w-full" : "max-w-4xl mx-auto w-full px-2"}\n\s*dir="ltr"\n\s*style={mushafViewMode === 'swipable' \? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}/g,
    'className="max-w-4xl mx-auto w-full px-2"\n              dir="ltr"'
  );

  // 3. Translation page div
  // Using regex to carefully target the second map which is inside the translation branch
  const parts = content.split(') : (\n            <div');
  if (parts.length === 2) {
    let translationBlock = parts[1];
    
    translationBlock = translationBlock.replace(
      /className={mushafViewMode === 'swipable' \? "no-scrollbar min-w-full w-full h-full overflow-y-auto shrink-0 snap-center px-4 pt-4 pb-\[calc\(8rem\+env\(safe-area-inset-bottom\)\)\]" : "mb-8"}/g,
      'className="mb-8"'
    );
    
    translationBlock = translationBlock.replace(
      /const animationProps = mushafViewMode === 'swipable' \? {[\s\S]*?} : {};/,
      'const animationProps = {};'
    );
    
    translationBlock = translationBlock.replace(
      /{mushafViewMode === 'swipable' && \(\n\s*<div className="h-\[calc\(10rem\+env\(safe-area-inset-bottom\)\)\]" \/>\n\s*\)}/,
      '<div className="h-4" />'
    );
    
    content = parts[0] + ') : (\n            <div' + translationBlock;
  }

  // 4. Bottom Page Navigator
  content = content.replace(
    /{mushafViewMode === 'swipable' && pages\.length > 0 && \(/g,
    "{isMushafMode && mushafViewMode === 'swipable' && pages.length > 0 && ("
  );

  fs.writeFileSync(filePath, content);
};

fixFile('/Users/dilshadkk/Developer/Personal/Web/NextJS/tuition-platform/src/app/quran/[id]/QuranReaderClient.tsx');
fixFile('/Users/dilshadkk/Developer/Personal/Web/NextJS/expense-tracker/src/app/quran/[id]/QuranReaderClient.tsx');

