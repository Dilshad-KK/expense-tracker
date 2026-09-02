const fs = require('fs');

const fixFile = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix goToPage to use instant jump which bypasses all RTL smooth scrolling bugs
  content = content.replace(
    /const goToPage = \(pageNumber: number\) => {[\s\S]*?};/,
    `const goToPage = (pageNumber: number) => {
    const el = document.getElementById(\`mushaf-page-\${pageNumber}\`);
    if (el) {
      // Smooth scrolling in RTL flex snap containers is notoriously broken across browsers.
      // Instant jump bypasses these bugs and acts like a true page flip.
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  };`
  );

  fs.writeFileSync(filePath, content);
};

fixFile('/Users/dilshadkk/Developer/Personal/Web/NextJS/tuition-platform/src/app/quran/[id]/QuranReaderClient.tsx');
fixFile('/Users/dilshadkk/Developer/Personal/Web/NextJS/expense-tracker/src/app/quran/[id]/QuranReaderClient.tsx');

