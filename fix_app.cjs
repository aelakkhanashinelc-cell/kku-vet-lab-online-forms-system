const fs = require("fs");
let content = fs.readFileSync("src/App.tsx", "utf-8");

const oldCode = `  // 1. If print/pdf mode is activated, ONLY render the printable document (no layout, no nav)
  if (selectedPrintRequest) {
    return (
      <PrintableDocument
        request={selectedPrintRequest}
        onClose={() => {
          setSelectedPrintRequest(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('action');
          url.searchParams.delete('id');
          url.searchParams.delete('trackingNo');
          url.searchParams.delete('track');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }}
      />
    );
  }

  // 2. If user is not logged in, render the Login Gate
  if (!authUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        initialMessage={
          pendingReviewTarget
            ? \`โปรดเข้าสู่ระบบเพื่อเข้าพิจารณาคำขอรหัส: \${pendingReviewTarget}\`
            : undefined
        }
      />
    );
  }`;

const newCode = `  // 1. If user is not logged in, render the Login Gate (MUST LOGIN FIRST)
  if (!authUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        initialMessage={
          pendingReviewTarget
            ? \`โปรดเข้าสู่ระบบเพื่อเข้าพิจารณาคำขอรหัส: \${pendingReviewTarget}\`
            : (selectedPrintRequest ? \`โปรดเข้าสู่ระบบเพื่อดาวน์โหลดแบบฟอร์ม PDF\` : undefined)
        }
      />
    );
  }

  // 2. If print/pdf mode is activated, ONLY render the printable document (no layout, no nav)
  if (selectedPrintRequest) {
    return (
      <PrintableDocument
        request={selectedPrintRequest}
        onClose={() => {
          setSelectedPrintRequest(null);
          const url = new URL(window.location.href);
          url.searchParams.delete('action');
          url.searchParams.delete('id');
          url.searchParams.delete('trackingNo');
          url.searchParams.delete('track');
          window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
        }}
      />
    );
  }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync("src/App.tsx", content);
console.log("App.tsx fixed");
