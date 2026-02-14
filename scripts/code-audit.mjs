import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

const TDI_ADMIN_DIR = './app/tdi-admin';

// Color constants we expect
const EXPECTED_COLORS = {
  hub: { primary: '#5BBEC4', light: '#E8F6F7', dark: '#1a6b69' },
  creators: { primary: '#9B7CB8', light: '#F3EDF8', dark: '#6B4E9B' },
  leadership: { primary: '#E8927C', light: '#FDF0ED', dark: '#C4624A' },
  team: { primary: '#E8B84B', light: '#FFF8E7', dark: '#B8860B' },
};

async function getAllFiles(dir, files = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await getAllFiles(fullPath, files);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function extractSection(filepath) {
  if (filepath.includes('/hub/')) return 'hub';
  if (filepath.includes('/creators/')) return 'creators';
  if (filepath.includes('/leadership/')) return 'leadership';
  if (filepath.includes('/team/')) return 'team';
  return 'shared';
}

async function analyzeFile(filepath) {
  const content = await readFile(filepath, 'utf-8');
  const section = extractSection(filepath);
  const expectedTheme = EXPECTED_COLORS[section];

  const analysis = {
    filepath,
    section,
    lineCount: content.split('\n').length,
    issues: [],
    features: [],
    components: [],
    dataQueries: [],
    colors: {
      usesTheme: false,
      hardcodedColors: [],
      correctThemeColors: [],
      incorrectColors: []
    }
  };

  // Check if it's a page file
  const isPage = filepath.endsWith('page.tsx');

  // Check for 'use client'
  if (content.includes("'use client'")) {
    analysis.features.push('Client Component');
  } else if (isPage) {
    analysis.features.push('Server Component');
  }

  // Check for theme usage
  if (content.includes('PORTAL_THEMES')) {
    analysis.colors.usesTheme = true;
    analysis.features.push('Uses Theme System');
  }

  // Check for Recharts
  if (content.includes('from \'recharts\'') || content.includes('from "recharts"')) {
    analysis.features.push('Has Charts (Recharts)');
  }

  // Check for data fetching
  const fetchMatches = content.match(/fetch\(['"](\/api\/[^'"]+)['"]/g);
  if (fetchMatches) {
    analysis.dataQueries = fetchMatches.map(m => m.match(/\/api\/[^'"]+/)[0]);
  }

  // Check for Supabase queries
  if (content.includes('supabase') && content.includes('.from(')) {
    analysis.features.push('Direct Supabase Queries');
  }

  // Check for loading states
  if (content.includes('isLoading') || content.includes('loading')) {
    analysis.features.push('Has Loading States');
  }

  // Check for empty states
  if (content.includes('No ') && content.includes('found') || content.includes('empty')) {
    analysis.features.push('Has Empty States');
  }

  // Check for modals
  if (content.includes('Modal') || content.includes('fixed inset-0')) {
    analysis.features.push('Has Modals');
  }

  // Check for tabs
  if (content.includes('activeTab') || content.includes('Tab')) {
    const tabMatches = content.match(/'(dashboard|creators|analytics|communications|payouts|accounts|enrollments|certificates|reports|tips|emails|courses|quick-wins|partnerships)'/gi);
    if (tabMatches) {
      analysis.features.push(`Tabs: ${[...new Set(tabMatches.map(t => t.replace(/'/g, '')))].join(', ')}`);
    }
  }

  // Check for tables
  if (content.includes('<table') || content.includes('<thead')) {
    analysis.features.push('Has Table');
  }

  // Check for forms
  if (content.includes('<form') || content.includes('onSubmit')) {
    analysis.features.push('Has Form');
  }

  // Check for emojis (should be none!)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
  const emojis = content.match(emojiRegex);
  if (emojis) {
    analysis.issues.push(`Contains emojis: ${[...new Set(emojis)].join(' ')}`);
  }

  // Check for hardcoded colors that should use theme
  const colorRegex = /#[0-9A-Fa-f]{6}/g;
  const colors = content.match(colorRegex) || [];
  const uniqueColors = [...new Set(colors)];

  for (const color of uniqueColors) {
    const upperColor = color.toUpperCase();
    // Check if it's a theme color
    if (expectedTheme) {
      if (upperColor === expectedTheme.primary.toUpperCase() ||
          upperColor === expectedTheme.light.toUpperCase() ||
          upperColor === expectedTheme.dark.toUpperCase()) {
        analysis.colors.correctThemeColors.push(color);
      } else {
        // Common acceptable colors
        const acceptable = ['#2B3A67', '#6B7280', '#FFFFFF', '#000000', '#F9FAFB', '#E5E7EB', '#D1D5DB', '#374151', '#111827', '#F3F4F6', '#FEE2E2', '#DC2626', '#22C55E', '#F97316', '#3B82F6'];
        if (!acceptable.some(a => a.toUpperCase() === upperColor)) {
          analysis.colors.hardcodedColors.push(color);
        }
      }
    }
  }

  // Check for wrong theme colors in wrong section
  if (section !== 'shared' && expectedTheme) {
    const wrongThemes = [];
    for (const [themeName, themeColors] of Object.entries(EXPECTED_COLORS)) {
      if (themeName !== section) {
        if (content.includes(themeColors.primary)) {
          wrongThemes.push(`${themeName} primary (${themeColors.primary})`);
        }
      }
    }
    if (wrongThemes.length > 0) {
      analysis.issues.push(`Uses wrong theme colors: ${wrongThemes.join(', ')}`);
    }
  }

  // Check for Lucide icons
  const lucideMatch = content.match(/from 'lucide-react'/);
  if (lucideMatch) {
    const iconImports = content.match(/import \{([^}]+)\} from 'lucide-react'/);
    if (iconImports) {
      const icons = iconImports[1].split(',').map(i => i.trim()).filter(i => i);
      analysis.components.push(`Lucide Icons: ${icons.length}`);
    }
  }

  // Check for proper TypeScript types
  if (content.includes(': any') || content.includes('as any')) {
    analysis.issues.push('Uses "any" type');
  }

  // Check for console.log (should be removed in production)
  if (content.includes('console.log')) {
    analysis.issues.push('Contains console.log statements');
  }

  // Check for TODO comments
  const todoMatches = content.match(/\/\/.*TODO/gi);
  if (todoMatches) {
    analysis.issues.push(`Has ${todoMatches.length} TODO comment(s)`);
  }

  return analysis;
}

async function generateReport() {
  console.log('='.repeat(80));
  console.log('TDI ADMIN PORTAL - COMPREHENSIVE CODE AUDIT');
  console.log('='.repeat(80));
  console.log(`Generated: ${new Date().toISOString()}\n`);

  const files = await getAllFiles(TDI_ADMIN_DIR);
  console.log(`Found ${files.length} files to analyze\n`);

  const analyses = [];
  for (const file of files) {
    const analysis = await analyzeFile(file);
    analyses.push(analysis);
  }

  // Group by section
  const sections = {
    hub: analyses.filter(a => a.section === 'hub'),
    creators: analyses.filter(a => a.section === 'creators'),
    leadership: analyses.filter(a => a.section === 'leadership'),
    team: analyses.filter(a => a.section === 'team'),
    shared: analyses.filter(a => a.section === 'shared'),
  };

  // Print section summaries
  for (const [sectionName, sectionFiles] of Object.entries(sections)) {
    if (sectionFiles.length === 0) continue;

    console.log('\n' + '='.repeat(80));
    console.log(`SECTION: ${sectionName.toUpperCase()}`);
    console.log('Expected Theme:', JSON.stringify(EXPECTED_COLORS[sectionName] || 'N/A'));
    console.log('='.repeat(80));

    for (const analysis of sectionFiles) {
      console.log(`\n${'─'.repeat(60)}`);
      console.log(`FILE: ${analysis.filepath}`);
      console.log(`Lines: ${analysis.lineCount}`);

      if (analysis.features.length > 0) {
        console.log(`\nFeatures:`);
        analysis.features.forEach(f => console.log(`  + ${f}`));
      }

      if (analysis.dataQueries.length > 0) {
        console.log(`\nAPI Endpoints:`);
        analysis.dataQueries.forEach(q => console.log(`  - ${q}`));
      }

      if (analysis.colors.usesTheme) {
        console.log(`\nTheme: Using PORTAL_THEMES system`);
      }

      if (analysis.colors.correctThemeColors.length > 0) {
        console.log(`Correct Theme Colors: ${analysis.colors.correctThemeColors.join(', ')}`);
      }

      if (analysis.colors.hardcodedColors.length > 0) {
        console.log(`Other Colors: ${analysis.colors.hardcodedColors.join(', ')}`);
      }

      if (analysis.issues.length > 0) {
        console.log(`\nISSUES:`);
        analysis.issues.forEach(i => console.log(`  ! ${i}`));
      }
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0);
  const filesWithEmojis = analyses.filter(a => a.issues.some(i => i.includes('emoji')));
  const filesWithTheme = analyses.filter(a => a.colors.usesTheme);
  const filesWithCharts = analyses.filter(a => a.features.some(f => f.includes('Chart')));
  const filesWithTables = analyses.filter(a => a.features.some(f => f.includes('Table')));
  const filesWithModals = analyses.filter(a => a.features.some(f => f.includes('Modal')));

  console.log(`\nTotal Files Analyzed: ${analyses.length}`);
  console.log(`Total Issues Found: ${totalIssues}`);
  console.log(`\nBreakdown by Section:`);
  for (const [name, files] of Object.entries(sections)) {
    if (files.length > 0) {
      console.log(`  ${name}: ${files.length} files, ${files.reduce((s, f) => s + f.issues.length, 0)} issues`);
    }
  }

  console.log(`\nFeature Coverage:`);
  console.log(`  Files using Theme System: ${filesWithTheme.length}/${analyses.length}`);
  console.log(`  Files with Charts: ${filesWithCharts.length}`);
  console.log(`  Files with Tables: ${filesWithTables.length}`);
  console.log(`  Files with Modals: ${filesWithModals.length}`);

  if (filesWithEmojis.length > 0) {
    console.log(`\nWARNING: ${filesWithEmojis.length} files still contain emojis!`);
    filesWithEmojis.forEach(f => console.log(`  - ${f.filepath}`));
  } else {
    console.log(`\nNo emojis found in any files.`);
  }

  // List all issues
  if (totalIssues > 0) {
    console.log(`\nAll Issues by File:`);
    for (const analysis of analyses) {
      if (analysis.issues.length > 0) {
        console.log(`\n  ${analysis.filepath}:`);
        analysis.issues.forEach(i => console.log(`    - ${i}`));
      }
    }
  }
}

generateReport().catch(console.error);
