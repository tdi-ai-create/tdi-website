import { readFile } from 'fs/promises';

const PAGES = [
  { path: 'app/tdi-admin/hub/page.tsx', name: 'Hub Landing', section: 'hub' },
  { path: 'app/tdi-admin/hub/operations/page.tsx', name: 'Hub Operations', section: 'hub' },
  { path: 'app/tdi-admin/hub/production/page.tsx', name: 'Hub Production', section: 'hub' },
  { path: 'app/tdi-admin/creators/page.tsx', name: 'Creator Studio', section: 'creators' },
  { path: 'app/tdi-admin/creators/[id]/page.tsx', name: 'Creator Detail', section: 'creators' },
  { path: 'app/tdi-admin/leadership/page.tsx', name: 'Leadership Dashboard', section: 'leadership' },
  { path: 'app/tdi-admin/leadership/[id]/page.tsx', name: 'Partnership Detail', section: 'leadership' },
  { path: 'app/tdi-admin/team/page.tsx', name: 'Team Management', section: 'team' },
];

async function analyzePage(pageInfo) {
  const content = await readFile(pageInfo.path, 'utf-8');

  const analysis = {
    ...pageInfo,
    tabs: [],
    statCards: [],
    charts: [],
    tables: [],
    forms: [],
    modals: [],
    apiEndpoints: [],
    components: [],
    actions: [],
  };

  // Extract tabs
  const tabMatches = content.match(/['"](?:dashboard|creators|analytics|communications|payouts|accounts|enrollments|certificates|reports|tips|emails|courses|quick-wins|partnerships|school-dashboards|school-reports|action-items|onboarding|billing|media|calendar|feedback)['"]/gi);
  if (tabMatches) {
    analysis.tabs = [...new Set(tabMatches.map(t => t.replace(/['"]/g, '')))];
  }

  // Check for stat cards
  if (content.includes('StatCard') || content.includes('stat-card') || content.includes('stats.')) {
    const statMatches = content.match(/(?:label|title)=["']([^"']+)["']/g);
    if (statMatches) {
      analysis.statCards = [...new Set(statMatches.map(s => s.match(/["']([^"']+)["']/)[1]))].slice(0, 10);
    }
  }

  // Check for charts
  if (content.includes('Chart') || content.includes('recharts')) {
    const chartTypes = [];
    if (content.includes('BarChart')) chartTypes.push('Bar Chart');
    if (content.includes('PieChart')) chartTypes.push('Pie Chart');
    if (content.includes('LineChart')) chartTypes.push('Line Chart');
    if (content.includes('AreaChart')) chartTypes.push('Area Chart');
    analysis.charts = chartTypes;
  }

  // Check for tables
  if (content.includes('<table') || content.includes('<thead')) {
    const headerMatches = content.match(/<th[^>]*>([^<]+)<\/th>/g);
    if (headerMatches) {
      analysis.tables = headerMatches.map(h => h.replace(/<\/?th[^>]*>/g, '')).filter(h => h.trim()).slice(0, 8);
    }
  }

  // Check for forms/inputs
  const inputLabels = content.match(/(?:label|placeholder)=["']([^"']+)["']/g);
  if (inputLabels) {
    analysis.forms = [...new Set(inputLabels.map(l => l.match(/["']([^"']+)["']/)[1]))].slice(0, 6);
  }

  // Check for modals
  if (content.includes('Modal') || content.includes('fixed inset-0')) {
    const modalTitles = content.match(/(?:showAddModal|showEditModal|showDeleteModal|showConfirm)/g);
    if (modalTitles) {
      analysis.modals = [...new Set(modalTitles)];
    }
  }

  // Extract API endpoints
  const fetchMatches = content.match(/fetch\(['"](\/api\/[^'"]+)['"]/g);
  if (fetchMatches) {
    analysis.apiEndpoints = fetchMatches.map(m => m.match(/\/api\/[^'"]+/)[0]);
  }

  // Check for action buttons
  const buttonTexts = content.match(/>(?:Add|Create|Save|Delete|Edit|Update|Submit|Cancel|Approve|Reject|Send|Download|Export)<\/button>/g);
  if (buttonTexts) {
    analysis.actions = [...new Set(buttonTexts.map(b => b.replace(/[<>\/button]/g, '')))];
  }

  return analysis;
}

async function main() {
  console.log('='.repeat(80));
  console.log('TDI ADMIN PORTAL - PAGE-BY-PAGE ANALYSIS');
  console.log('='.repeat(80));
  console.log();

  for (const pageInfo of PAGES) {
    try {
      const analysis = await analyzePage(pageInfo);

      console.log('─'.repeat(80));
      console.log(`PAGE: ${analysis.name}`);
      console.log(`Path: ${analysis.path}`);
      console.log(`Section: ${analysis.section.toUpperCase()}`);
      console.log();

      if (analysis.tabs.length > 0) {
        console.log('TABS:');
        analysis.tabs.forEach(t => console.log(`  - ${t}`));
        console.log();
      }

      if (analysis.statCards.length > 0) {
        console.log('STAT CARDS:');
        analysis.statCards.forEach(s => console.log(`  - ${s}`));
        console.log();
      }

      if (analysis.charts.length > 0) {
        console.log('CHARTS:');
        analysis.charts.forEach(c => console.log(`  - ${c}`));
        console.log();
      }

      if (analysis.tables.length > 0) {
        console.log('TABLE COLUMNS:');
        analysis.tables.forEach(t => console.log(`  - ${t}`));
        console.log();
      }

      if (analysis.apiEndpoints.length > 0) {
        console.log('API ENDPOINTS:');
        analysis.apiEndpoints.forEach(e => console.log(`  - ${e}`));
        console.log();
      }

      if (analysis.actions.length > 0) {
        console.log('ACTIONS:');
        analysis.actions.forEach(a => console.log(`  - ${a}`));
        console.log();
      }

    } catch (err) {
      console.log(`Error analyzing ${pageInfo.path}: ${err.message}`);
    }
  }

  // Print structure overview
  console.log('\n' + '='.repeat(80));
  console.log('PORTAL STRUCTURE OVERVIEW');
  console.log('='.repeat(80));
  console.log(`
TDI ADMIN PORTAL
├── Hub (Teal: #5BBEC4)
│   ├── Landing Page (/tdi-admin/hub)
│   ├── Operations (/tdi-admin/hub/operations)
│   │   ├── Accounts (default)
│   │   ├── Enrollments
│   │   ├── Certificates
│   │   ├── Reports
│   │   ├── Analytics
│   │   ├── Tips & Requests
│   │   └── Emails
│   └── Production (/tdi-admin/hub/production)
│       ├── Courses (default)
│       ├── Quick Wins
│       ├── Media Library
│       ├── Content Calendar
│       └── Feedback & Ratings
│
├── Creators (Lavender: #9B7CB8)
│   ├── Studio (/tdi-admin/creators)
│   │   ├── Dashboard (default)
│   │   ├── Creators
│   │   ├── Analytics
│   │   ├── Communications
│   │   └── Payouts
│   └── Detail Page (/tdi-admin/creators/[id])
│
├── Leadership (Coral: #E8927C)
│   ├── Dashboard (/tdi-admin/leadership)
│   │   ├── Partnerships (default)
│   │   ├── School Dashboards
│   │   ├── School Reports
│   │   ├── Action Items
│   │   ├── Onboarding Pipeline
│   │   └── Billing
│   └── Partnership Detail (/tdi-admin/leadership/[id])
│
└── Team (Gold: #E8B84B)
    └── Management (/tdi-admin/team)
`);
}

main().catch(console.error);
