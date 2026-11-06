/**
 * Hallucination-Aware Information Assistant (VeriFact AI)
 * Frontend Application Logic (Vanilla JavaScript)
 * 
 * Manages:
 * - Single Page Navigation
 * - DeepSeek API Integration & 2-Stage Analysis
 * - Claim Extraction & Reliability Assessment
 * - LocalStorage Persistence (History & Saved Answers)
 * - Canvas Analytics Chart
 * - User Feedback & Reanalysis
 * - PDF Export Reporting
 */

// ==========================================
// 1. APPLICATION STATE & STORAGE CONSTANTS
// ==========================================
const STORAGE_KEYS = {
  HISTORY: 'verifact_history_v1',
  SAVED: 'verifact_saved_v1'
};

const AppState = {
  currentView: 'dashboard',
  history: [],
  saved: [],
  currentReport: null,
  claimFilter: 'all',
  backendStatus: null
};

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const DOM = {
  // Navigation & Shell
  navItems: document.querySelectorAll('.nav-item'),
  viewSections: document.querySelectorAll('.view-section'),
  viewHeading: document.getElementById('viewHeading'),
  viewSubheading: document.getElementById('viewSubheading'),
  sidebar: document.getElementById('sidebar'),
  mobileToggleBtn: document.getElementById('mobileToggleBtn'),
  mobileCloseBtn: document.getElementById('mobileCloseBtn'),
  topAskBtn: document.getElementById('topAskBtn'),
  statusDot: document.getElementById('statusDot'),
  statusLabel: document.getElementById('statusLabel'),
  statusSub: document.getElementById('statusSub'),
  activeModelBadge: document.getElementById('activeModelBadge'),
  demoNoticeBanner: document.getElementById('demoNoticeBanner'),
  demoNoticeText: document.getElementById('demoNoticeText'),
  historyCountBadge: document.getElementById('historyCountBadge'),
  savedCountBadge: document.getElementById('savedCountBadge'),

  // Dashboard View
  statTotalQuestions: document.getElementById('statTotalQuestions'),
  statHighConfidence: document.getElementById('statHighConfidence'),
  statInferred: document.getElementById('statInferred'),
  statHallucinated: document.getElementById('statHallucinated'),
  avgReliabilityScore: document.getElementById('avgReliabilityScore'),
  dashboardRecentList: document.getElementById('dashboardRecentList'),
  reliabilityChart: document.getElementById('reliabilityChart'),
  dashQuickAskBtn: document.getElementById('dashQuickAskBtn'),
  viewAllHistoryBtn: document.getElementById('viewAllHistoryBtn'),

  // Ask AI View
  askFormContainer: document.getElementById('askFormContainer'),
  questionInput: document.getElementById('questionInput'),
  questionCharCount: document.getElementById('questionCharCount'),
  responseTypeRadios: document.querySelectorAll('input[name="responseType"]'),
  currentTypeBadge: document.getElementById('currentTypeBadge'),
  contextToggle: document.getElementById('contextToggle'),
  contextInputWrapper: document.getElementById('contextInputWrapper'),
  contextChevron: document.getElementById('contextChevron'),
  contextInput: document.getElementById('contextInput'),
  generateAnswerBtn: document.getElementById('generateAnswerBtn'),
  samplePills: document.querySelectorAll('.sample-pill'),

  // Multi-Stage Loading
  loadingStageCard: document.getElementById('loadingStageCard'),
  loadingSubText: document.getElementById('loadingSubText'),

  // Report View
  answerReportContainer: document.getElementById('answerReportContainer'),
  reportDomainBadge: document.getElementById('reportDomainBadge'),
  reportTimestamp: document.getElementById('reportTimestamp'),
  reportQuestionEcho: document.getElementById('reportQuestionEcho'),
  reportAnswerContent: document.getElementById('reportAnswerContent'),
  btnCopyAnswer: document.getElementById('btnCopyAnswer'),
  btnSaveAnswer: document.getElementById('btnSaveAnswer'),
  saveBtnText: document.getElementById('saveBtnText'),
  btnExportPDF: document.getElementById('btnExportPDF'),
  btnReanalyzeModal: document.getElementById('btnReanalyzeModal'),
  btnNewQuestion: document.getElementById('btnNewQuestion'),

  // Summary & Warnings
  summaryOverallScore: document.getElementById('summaryOverallScore'),
  summaryScoreBadge: document.getElementById('summaryScoreBadge'),
  summaryScoreBar: document.getElementById('summaryScoreBar'),
  summaryHighCount: document.getElementById('summaryHighCount'),
  summaryHighPct: document.getElementById('summaryHighPct'),
  summaryInferredCount: document.getElementById('summaryInferredCount'),
  summaryInferredPct: document.getElementById('summaryInferredPct'),
  summaryHallucinatedCount: document.getElementById('summaryHallucinatedCount'),
  summaryHallucinatedPct: document.getElementById('summaryHallucinatedPct'),
  summaryTotalClaims: document.getElementById('summaryTotalClaims'),
  reportWarningsCard: document.getElementById('reportWarningsCard'),
  reportWarningsList: document.getElementById('reportWarningsList'),
  verificationAdvisoryBadge: document.getElementById('verificationAdvisoryBadge'),

  // Claims Breakdown
  filterButtons: document.querySelectorAll('.filter-btn'),
  filterAllCount: document.getElementById('filterAllCount'),
  filterHighCount: document.getElementById('filterHighCount'),
  filterInferredCount: document.getElementById('filterInferredCount'),
  filterDangerCount: document.getElementById('filterDangerCount'),
  claimsCardsGrid: document.getElementById('claimsCardsGrid'),

  // History & Saved Views
  historySearchInput: document.getElementById('historySearchInput'),
  historyListContainer: document.getElementById('historyListContainer'),
  clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),
  savedSearchInput: document.getElementById('savedSearchInput'),
  savedListContainer: document.getElementById('savedListContainer'),

  // Reanalysis Modal
  reanalyzeModal: document.getElementById('reanalyzeModal'),
  closeReanalyzeModalBtn: document.getElementById('closeReanalyzeModalBtn'),
  cancelReanalyzeBtn: document.getElementById('cancelReanalyzeBtn'),
  confirmReanalyzeBtn: document.getElementById('confirmReanalyzeBtn'),
  reanalyzeContextInput: document.getElementById('reanalyzeContextInput'),

  // Print & Toasts
  printTimestamp: document.getElementById('printTimestamp'),
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// 3. INITIALIZATION & LIFECYCLE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  bindEventHandlers();
  checkBackendHealth();
  updateDashboardMetrics();
  updateBadgeCounts();
});

/**
 * Load History and Saved items from browser LocalStorage
 */
function loadStoredData() {
  try {
    const rawHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    AppState.history = rawHistory ? JSON.parse(rawHistory) : [];

    const rawSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
    AppState.saved = rawSaved ? JSON.parse(rawSaved) : [];
  } catch (err) {
    console.error('Error loading LocalStorage data:', err);
    AppState.history = [];
    AppState.saved = [];
  }
}

/**
 * Save History to LocalStorage
 */
function saveHistory() {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(AppState.history));
    updateBadgeCounts();
  } catch (err) {
    console.error('Failed to save history to LocalStorage:', err);
  }
}

/**
 * Save Bookmarked Answers to LocalStorage
 */
function saveBookmarks() {
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(AppState.saved));
    updateBadgeCounts();
  } catch (err) {
    console.error('Failed to save bookmarks to LocalStorage:', err);
  }
}

/**
 * Update Sidebar Badge Counters
 */
function updateBadgeCounts() {
  if (DOM.historyCountBadge) {
    DOM.historyCountBadge.textContent = AppState.history.length;
  }
  if (DOM.savedCountBadge) {
    DOM.savedCountBadge.textContent = AppState.saved.length;
  }
}

// ==========================================
// 4. BACKEND HEALTH CHECK
// ==========================================
async function checkBackendHealth() {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Health check responded with non-200');
    const data = await response.json();
    AppState.backendStatus = data;

    if (data.deepseekConfigured) {
      DOM.statusDot.className = 'status-indicator-dot online';
      DOM.statusLabel.textContent = 'DeepSeek AI Active';
      DOM.statusSub.textContent = data.model || 'deepseek-chat';
      DOM.activeModelBadge.textContent = 'DeepSeek Live';
      if (DOM.demoNoticeBanner) {
        DOM.demoNoticeBanner.style.display = 'none';
      }
    } else {
      DOM.statusDot.className = 'status-indicator-dot demo';
      DOM.statusLabel.textContent = 'Demonstration Mode';
      DOM.statusSub.textContent = 'DeepSeek Heuristic';
      DOM.activeModelBadge.textContent = 'Demo Mode';
      if (DOM.demoNoticeBanner) {
        DOM.demoNoticeBanner.style.display = 'flex';
        DOM.demoNoticeText.innerHTML = `Running in <strong>Demonstration Evaluation Mode</strong>. All 5 sample viva questions work out-of-the-box! To enable live DeepSeek API queries, add your <code>DEEPSEEK_API_KEY</code> in <code>.env</code> and restart the server.`;
      }
    }
  } catch (err) {
    console.warn('Backend health check error:', err);
    DOM.statusDot.className = 'status-indicator-dot demo';
    DOM.statusLabel.textContent = 'Server Offline';
    DOM.statusSub.textContent = 'Check Node.js';
    showToast('Backend server connection issue. Please verify backend is running.', 'error');
  }
}

// ==========================================
// 5. VIEW NAVIGATION
// ==========================================
function switchView(viewName) {
  AppState.currentView = viewName;

  // Update Nav links
  DOM.navItems.forEach(item => {
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update View Sections
  DOM.viewSections.forEach(section => {
    if (section.id === `view-${viewName}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // Update Title & Subtitle
  const titles = {
    'dashboard': {
      title: 'Dashboard',
      sub: 'Real-time reliability metrics and AI verification overview'
    },
    'ask': {
      title: 'Ask AI & Hallucination Audit',
      sub: 'Two-stage DeepSeek AI generation and factual claim verification'
    },
    'history': {
      title: 'Answer History',
      sub: 'Review, search, and reopen previous hallucination audits'
    },
    'saved': {
      title: 'Saved Answers',
      sub: 'Bookmarked high-confidence analyses and exported reports'
    },
    'how-it-works': {
      title: 'How It Works (College Viva)',
      sub: 'Technical architecture, verification pipeline, and viva preparation guide'
    }
  };

  if (titles[viewName]) {
    DOM.viewHeading.textContent = titles[viewName].title;
    DOM.viewSubheading.textContent = titles[viewName].sub;
  }

  // View specific refreshes
  if (viewName === 'dashboard') {
    updateDashboardMetrics();
  } else if (viewName === 'history') {
    renderHistoryList();
  } else if (viewName === 'saved') {
    renderSavedList();
  }

  // Close mobile sidebar on navigation
  if (DOM.sidebar.classList.contains('open')) {
    DOM.sidebar.classList.remove('open');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 6. DASHBOARD METRICS & CANVAS CHART
// ==========================================
function updateDashboardMetrics() {
  const history = AppState.history;
  const totalQuestions = history.length;

  let totalHigh = 0;
  let totalInferred = 0;
  let totalHallucinated = 0;
  let sumReliability = 0;

  history.forEach(item => {
    sumReliability += (item.overallReliability || 0);
    if (Array.isArray(item.claims)) {
      item.claims.forEach(c => {
        if (c.category === 'High Confidence') totalHigh++;
        else if (c.category === 'Inferred') totalInferred++;
        else if (c.category === 'Potentially Hallucinated') totalHallucinated++;
      });
    }
  });

  const avgReliability = totalQuestions > 0 ? Math.round(sumReliability / totalQuestions) : 0;

  // Update Stats Cards
  DOM.statTotalQuestions.textContent = totalQuestions;
  DOM.statHighConfidence.textContent = totalHigh;
  DOM.statInferred.textContent = totalInferred;
  DOM.statHallucinated.textContent = totalHallucinated;
  DOM.avgReliabilityScore.textContent = `${avgReliability}%`;

  // Draw Distribution Chart
  drawReliabilityChart(totalHigh, totalInferred, totalHallucinated);

  // Render Recent Questions in Dashboard
  renderDashboardRecentList();
}

/**
 * Render pure Vanilla JavaScript Donut / Pie Chart on HTML5 Canvas
 */
function drawReliabilityChart(highCount, inferredCount, hallucinatedCount) {
  const canvas = DOM.reliabilityChart;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Handle Retina/High-DPI sharp rendering
  ctx.clearRect(0, 0, width, height);

  const total = highCount + inferredCount + hallucinatedCount;
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = 80;
  const innerRadius = 52;

  if (total === 0) {
    // Empty State Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();

    ctx.font = '600 13px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('No claims yet', centerX, centerY);
    return;
  }

  const slices = [
    { label: 'High Confidence', count: highCount, color: '#10b981' },
    { label: 'Inferred', count: inferredCount, color: '#f59e0b' },
    { label: 'Potentially Hallucinated', count: hallucinatedCount, color: '#ef4444' }
  ];

  let startAngle = -Math.PI / 2; // start from top

  slices.forEach(slice => {
    if (slice.count === 0) return;
    const sliceAngle = (slice.count / total) * 2 * Math.PI;
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();

    startAngle = endAngle;
  });

  // Center Text: Total Claims
  ctx.font = '800 22px JetBrains Mono, monospace';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total.toString(), centerX, centerY - 6);

  ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('CLAIMS', centerX, centerY + 14);
}

/**
 * Render Recent Questions list on Dashboard
 */
function renderDashboardRecentList() {
  const container = DOM.dashboardRecentList;
  if (!container) return;

  const recent = AppState.history.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px 10px;">
        <div class="empty-icon" style="font-size: 1.8rem;">💡</div>
        <div class="empty-title" style="font-size: 0.95rem;">No questions asked yet</div>
        <div class="empty-sub" style="font-size: 0.8rem;">Select a sample viva question to test the hallucination detection pipeline.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map((item, index) => {
    const scoreColorClass = item.overallReliability >= 80 ? 'text-success' : (item.overallReliability >= 50 ? 'text-warning' : 'text-danger');
    const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div class="recent-item" data-history-id="${item.id}">
        <div class="recent-item-info">
          <span class="recent-q-text">${escapeHtml(item.question)}</span>
          <span class="recent-meta">${item.responseType || 'General'} &bull; ${formattedDate}</span>
        </div>
        <span class="recent-score-pill ${scoreColorClass}">${item.overallReliability}%</span>
      </div>
    `;
  }).join('');

  // Add click handlers
  container.querySelectorAll('.recent-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.historyId;
      openReportById(id);
    });
  });
}

// ==========================================
// 7. ASK AI & MULTI-STAGE VERIFICATION
// ==========================================
async function handleGenerateAnswer() {
  const question = DOM.questionInput.value.trim();
  const context = DOM.contextInput.value.trim();

  // Validate Question
  if (!question) {
    showToast('Please enter a question to analyze.', 'error');
    DOM.questionInput.focus();
    return;
  }

  // Get selected response type
  let selectedType = 'General Knowledge';
  DOM.responseTypeRadios.forEach(radio => {
    if (radio.checked) selectedType = radio.value;
  });

  // Switch UI to loading state
  DOM.askFormContainer.classList.add('hidden');
  DOM.answerReportContainer.classList.add('hidden');
  DOM.loadingStageCard.classList.remove('hidden');

  // Multi-Stage Stepper Animation Controller
  const stages = [
    { id: 'stage-1', text: 'Analyzing question semantics & domain parameters...' },
    { id: 'stage-2', text: 'DeepSeek generating comprehensive draft response...' },
    { id: 'stage-3', text: 'Deconstructing answer into atomic factual claims...' },
    { id: 'stage-4', text: 'Auditing claims against provided context and consensus...' },
    { id: 'stage-5', text: 'Heuristic confidence scoring & hallucination detection...' },
    { id: 'stage-6', text: 'Compiling structured factuality report...' }
  ];

  let currentStageIndex = 0;

  function updateStageUI(index) {
    stages.forEach((st, i) => {
      const stepEl = document.getElementById(st.id);
      if (!stepEl) return;
      if (i < index) {
        stepEl.className = 'stage-step completed';
      } else if (i === index) {
        stepEl.className = 'stage-step active';
      } else {
        stepEl.className = 'stage-step';
      }
    });
    if (stages[index]) {
      DOM.loadingSubText.textContent = stages[index].text;
    }
  }

  updateStageUI(0);

  // Progressive timer to advance stages visually
  const stageInterval = setInterval(() => {
    if (currentStageIndex < stages.length - 1) {
      currentStageIndex++;
      updateStageUI(currentStageIndex);
    }
  }, 900);

  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question,
        context: context,
        responseType: selectedType
      })
    });

    clearInterval(stageInterval);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
    }

    const report = await response.json();

    // Attach unique ID and timestamp if not already provided
    report.id = 'report_' + Date.now();
    report.timestamp = report.timestamp || new Date().toISOString();
    report.responseType = selectedType;
    report.contextUsed = context;

    // Complete all stages in UI
    stages.forEach((st) => {
      const el = document.getElementById(st.id);
      if (el) el.className = 'stage-step completed';
    });

    // Small delay to let the user see stage completion
    setTimeout(() => {
      DOM.loadingStageCard.classList.add('hidden');
      DOM.answerReportContainer.classList.remove('hidden');

      // Save to History
      AppState.history.unshift(report);
      saveHistory();

      // Display Report
      displayReport(report);
      updateDashboardMetrics();
      showToast('Answer generated and hallucination audit complete!', 'success');
    }, 450);

  } catch (error) {
    clearInterval(stageInterval);
    DOM.loadingStageCard.classList.add('hidden');
    DOM.askFormContainer.classList.remove('hidden');
    console.error('Error generating answer:', error);
    showToast(`Error: ${error.message}`, 'error');
  }
}

// ==========================================
// 8. DISPLAY ANSWER & CLAIM-BY-CLAIM REPORT
// ==========================================
function displayReport(report) {
  AppState.currentReport = report;
  AppState.claimFilter = 'all';

  // Report Header Info
  DOM.reportDomainBadge.textContent = report.responseType || 'General Knowledge';
  DOM.reportTimestamp.textContent = new Date(report.timestamp).toLocaleString();
  DOM.reportQuestionEcho.textContent = report.question;

  // Print Timestamp for PDF export
  if (DOM.printTimestamp) {
    DOM.printTimestamp.textContent = `Report Date: ${new Date(report.timestamp).toLocaleString()}`;
  }

  // Answer Text
  DOM.reportAnswerContent.textContent = report.answer;

  // Update Save Bookmark button state
  const isSaved = AppState.saved.some(s => s.id === report.id || (s.question === report.question && s.answer === report.answer));
  updateSaveButtonUI(isSaved);

  // Reliability Summary
  const overallScore = report.overallReliability || 0;
  DOM.summaryOverallScore.textContent = `${overallScore}%`;
  DOM.summaryScoreBar.style.width = `${overallScore}%`;

  let badgeColor = 'badge-success';
  let badgeText = 'Highly Grounded';

  if (overallScore < 50) {
    badgeColor = 'badge-danger';
    badgeText = 'Low Confidence / Hallucination Risk';
    DOM.summaryScoreBar.style.backgroundColor = 'var(--danger)';
  } else if (overallScore < 80) {
    badgeColor = 'badge-warning';
    badgeText = 'Moderate / Inferred Support';
    DOM.summaryScoreBar.style.backgroundColor = 'var(--warning)';
  } else {
    badgeColor = 'badge-success';
    badgeText = 'High Factual Support';
    DOM.summaryScoreBar.style.backgroundColor = 'var(--success)';
  }

  DOM.summaryScoreBadge.className = `score-badge-pill ${badgeColor}`;
  DOM.summaryScoreBadge.textContent = badgeText;

  // Claim counts & percentages
  const claims = report.claims || [];
  const totalClaims = claims.length;
  const highCount = claims.filter(c => c.category === 'High Confidence').length;
  const inferredCount = claims.filter(c => c.category === 'Inferred').length;
  const hallucinatedCount = claims.filter(c => c.category === 'Potentially Hallucinated').length;

  DOM.summaryTotalClaims.textContent = totalClaims;
  DOM.summaryHighCount.textContent = highCount;
  DOM.summaryHighPct.textContent = totalClaims > 0 ? `${Math.round((highCount / totalClaims) * 100)}%` : '0%';

  DOM.summaryInferredCount.textContent = inferredCount;
  DOM.summaryInferredPct.textContent = totalClaims > 0 ? `${Math.round((inferredCount / totalClaims) * 100)}%` : '0%';

  DOM.summaryHallucinatedCount.textContent = hallucinatedCount;
  DOM.summaryHallucinatedPct.textContent = totalClaims > 0 ? `${Math.round((hallucinatedCount / totalClaims) * 100)}%` : '0%';

  // Filter Buttons Counts
  DOM.filterAllCount.textContent = totalClaims;
  DOM.filterHighCount.textContent = highCount;
  DOM.filterInferredCount.textContent = inferredCount;
  DOM.filterDangerCount.textContent = hallucinatedCount;

  // Reset active filter button to All
  DOM.filterButtons.forEach(btn => {
    if (btn.dataset.claimFilter === 'all') btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Warnings & Advisory Section
  const warnings = report.warnings || [];
  if (warnings.length > 0 || report.verificationNeeded) {
    DOM.reportWarningsCard.classList.remove('hidden');
    DOM.reportWarningsList.innerHTML = warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('');

    if (report.verificationNeeded) {
      DOM.verificationAdvisoryBadge.textContent = 'External Verification Advised';
      DOM.verificationAdvisoryBadge.className = 'verification-badge';
    } else {
      DOM.verificationAdvisoryBadge.textContent = 'Standard Advisory';
      DOM.verificationAdvisoryBadge.className = 'verification-badge badge-subtle';
    }
  } else {
    DOM.reportWarningsCard.classList.add('hidden');
  }

  // Render Claims
  renderClaimsCards();

  // Scroll smoothly to report top
  DOM.answerReportContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Render individual claim cards based on active filter
 */
function renderClaimsCards() {
  const container = DOM.claimsCardsGrid;
  if (!container || !AppState.currentReport) return;

  const claims = AppState.currentReport.claims || [];
  const filter = AppState.claimFilter;

  const filtered = filter === 'all' 
    ? claims 
    : claims.filter(c => c.category === filter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 24px;">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No claims in this category</div>
        <div class="empty-sub">Switch filters above to view other evaluated claims.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((claim, index) => {
    let cardClass = 'claim-inferred';
    let badgeClass = 'badge-warning';
    let scoreClass = 'score-inferred';
    let barColor = 'var(--warning)';

    if (claim.category === 'High Confidence') {
      cardClass = 'claim-high';
      badgeClass = 'badge-success';
      scoreClass = 'score-high';
      barColor = 'var(--success)';
    } else if (claim.category === 'Potentially Hallucinated') {
      cardClass = 'claim-hallucinated';
      badgeClass = 'badge-danger';
      scoreClass = 'score-hallucinated';
      barColor = 'var(--danger)';
    }

    const userFeedback = claim.userFeedback || null;

    return `
      <div class="claim-card ${cardClass}" data-claim-index="${index}">
        <div class="claim-card-header">
          <div class="claim-badge-wrap">
            <span class="badge ${badgeClass}">${escapeHtml(claim.category)}</span>
            <span class="claim-score-pill ${scoreClass}">${claim.confidence}% Confidence</span>
          </div>
          <div class="claim-progress-wrap" title="${claim.confidence}% confidence score">
            <div class="claim-progress-fill" style="width: ${claim.confidence}%; background-color: ${barColor};"></div>
          </div>
        </div>

        <div class="claim-statement">
          "${escapeHtml(claim.text)}"
        </div>

        <div class="claim-meta-grid">
          <div class="meta-box">
            <h5>Classification Reason</h5>
            <p>${escapeHtml(claim.reason || 'Assessed against factual consensus.')}</p>
          </div>
          <div class="meta-box">
            <h5>Evidentiary Support / Context</h5>
            <p>${escapeHtml(claim.evidence || 'No direct reference citation provided.')}</p>
          </div>
        </div>

        <div class="claim-feedback-bar">
          <span class="feedback-label">User Factuality Feedback:</span>
          <div class="feedback-buttons">
            <button class="btn-feedback ${userFeedback === 'correct' ? 'active-correct' : ''}" data-action="correct" data-idx="${index}">
              ✓ Mark Correct
            </button>
            <button class="btn-feedback ${userFeedback === 'incorrect' ? 'active-incorrect' : ''}" data-action="incorrect" data-idx="${index}">
              ✕ Mark Incorrect
            </button>
            <button class="btn-feedback ${userFeedback === 'verify' ? 'active-verify' : ''}" data-action="verify" data-idx="${index}">
              ⚠️ Needs Verification
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach User Feedback button handlers
  container.querySelectorAll('.btn-feedback').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(btn.dataset.idx, 10);
      const action = btn.dataset.action;
      handleClaimFeedback(idx, action);
    });
  });
}

/**
 * Handle user feedback marking on a claim
 */
function handleClaimFeedback(claimIndex, action) {
  if (!AppState.currentReport || !AppState.currentReport.claims[claimIndex]) return;

  const claim = AppState.currentReport.claims[claimIndex];

  // Toggle feedback
  if (claim.userFeedback === action) {
    claim.userFeedback = null;
    showToast('Feedback cleared for claim.', 'info');
  } else {
    claim.userFeedback = action;
    const actionLabels = {
      'correct': 'Marked as Correct',
      'incorrect': 'Marked as Incorrect',
      'verify': 'Marked as Requiring Verification'
    };
    showToast(`Claim feedback recorded: ${actionLabels[action]}`, 'success');
  }

  // Update in History and Saved stores
  saveHistory();
  saveBookmarks();

  // Re-render claims to show active state
  renderClaimsCards();
}

// ==========================================
// 9. REANALYSIS WITH ADDITIONAL CONTEXT
// ==========================================
async function handleConfirmReanalyze() {
  const additionalContext = DOM.reanalyzeContextInput.value.trim();

  if (!additionalContext) {
    showToast('Please provide supporting context text to reanalyze.', 'error');
    DOM.reanalyzeContextInput.focus();
    return;
  }

  const report = AppState.currentReport;
  if (!report) return;

  // Close modal
  DOM.reanalyzeModal.classList.add('hidden');

  // Show loading
  DOM.answerReportContainer.classList.add('hidden');
  DOM.loadingStageCard.classList.remove('hidden');
  DOM.loadingSubText.textContent = 'Re-auditing answer against newly supplied reference context...';

  try {
    const response = await fetch('/api/reanalyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: report.question,
        answer: report.answer,
        additionalContext: additionalContext
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
    }

    const updatedReport = await response.json();
    updatedReport.id = report.id;
    updatedReport.responseType = report.responseType;
    updatedReport.contextUsed = additionalContext;

    // Update in history
    const histIdx = AppState.history.findIndex(h => h.id === report.id);
    if (histIdx !== -1) {
      AppState.history[histIdx] = updatedReport;
    } else {
      AppState.history.unshift(updatedReport);
    }
    saveHistory();

    // Update in saved if present
    const savedIdx = AppState.saved.findIndex(s => s.id === report.id);
    if (savedIdx !== -1) {
      AppState.saved[savedIdx] = updatedReport;
      saveBookmarks();
    }

    setTimeout(() => {
      DOM.loadingStageCard.classList.add('hidden');
      DOM.answerReportContainer.classList.remove('hidden');
      displayReport(updatedReport);
      updateDashboardMetrics();
      showToast('Answer successfully reanalyzed with new reference evidence!', 'success');
    }, 400);

  } catch (error) {
    DOM.loadingStageCard.classList.add('hidden');
    DOM.answerReportContainer.classList.remove('hidden');
    console.error('Reanalysis error:', error);
    showToast(`Reanalysis failed: ${error.message}`, 'error');
  }
}

// ==========================================
// 10. HISTORY & SAVED ANSWERS MODULE
// ==========================================
function renderHistoryList(searchQuery = '') {
  const container = DOM.historyListContainer;
  if (!container) return;

  let items = AppState.history;

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    items = items.filter(item => 
      (item.question && item.question.toLowerCase().includes(q)) ||
      (item.answer && item.answer.toLowerCase().includes(q))
    );
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🕒</div>
        <div class="empty-title">${searchQuery ? 'No matching audit records' : 'No answer history yet'}</div>
        <div class="empty-sub">${searchQuery ? 'Try a different search keyword.' : 'Questions you ask will be saved here in LocalStorage with full claim breakdowns.'}</div>
        ${!searchQuery ? `<button class="btn btn-primary" onclick="switchView('ask')">Ask Your First Question</button>` : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const dateStr = new Date(item.timestamp).toLocaleString();
    const scoreColorClass = item.overallReliability >= 80 ? 'text-success' : (item.overallReliability >= 50 ? 'text-warning' : 'text-danger');
    const isSaved = AppState.saved.some(s => s.id === item.id);

    const claims = item.claims || [];
    const hallucinatedCount = claims.filter(c => c.category === 'Potentially Hallucinated').length;

    return `
      <div class="history-card-item">
        <div class="history-card-header">
          <div class="history-question">${escapeHtml(item.question)}</div>
          <span class="badge ${item.overallReliability >= 80 ? 'badge-success' : (item.overallReliability >= 50 ? 'badge-warning' : 'badge-danger')}">
            ${item.overallReliability}% Reliable
          </span>
        </div>

        <div class="history-meta-row">
          <span>${item.responseType || 'General'}</span>
          <span>&bull;</span>
          <span>${dateStr}</span>
          ${item.reanalyzed ? '<span class="badge badge-subtle">Reanalyzed</span>' : ''}
        </div>

        <div class="history-preview">
          ${escapeHtml(item.answer)}
        </div>

        <div class="history-card-actions">
          <div class="history-badges-row">
            <span class="badge badge-subtle">${claims.length} claims</span>
            ${hallucinatedCount > 0 ? `<span class="badge badge-danger">${hallucinatedCount} hallucinated</span>` : '<span class="badge badge-success">0 hallucinated</span>'}
          </div>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-outline btn-open-history" data-id="${item.id}">
              Open Full Audit
            </button>
            <button class="btn btn-sm btn-ghost btn-bookmark-history" data-id="${item.id}" title="${isSaved ? 'Remove Bookmark' : 'Bookmark'}">
              ${isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <button class="btn btn-sm btn-ghost text-danger btn-delete-history" data-id="${item.id}" title="Delete record">
              🗑
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Event handlers
  container.querySelectorAll('.btn-open-history').forEach(btn => {
    btn.addEventListener('click', () => openReportById(btn.dataset.id));
  });

  container.querySelectorAll('.btn-bookmark-history').forEach(btn => {
    btn.addEventListener('click', () => toggleBookmarkById(btn.dataset.id));
  });

  container.querySelectorAll('.btn-delete-history').forEach(btn => {
    btn.addEventListener('click', () => deleteHistoryById(btn.dataset.id));
  });
}

function renderSavedList(searchQuery = '') {
  const container = DOM.savedListContainer;
  if (!container) return;

  let items = AppState.saved;

  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    items = items.filter(item => 
      (item.question && item.question.toLowerCase().includes(q)) ||
      (item.answer && item.answer.toLowerCase().includes(q))
    );
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔖</div>
        <div class="empty-title">${searchQuery ? 'No matching saved items' : 'No saved answers yet'}</div>
        <div class="empty-sub">When viewing an answer analysis, click 'Save Answer' to bookmark it here for quick access and reporting.</div>
        <button class="btn btn-primary" onclick="switchView('ask')">Generate an Answer</button>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => {
    const dateStr = new Date(item.timestamp).toLocaleString();
    const claims = item.claims || [];

    return `
      <div class="history-card-item">
        <div class="history-card-header">
          <div class="history-question">${escapeHtml(item.question)}</div>
          <span class="badge ${item.overallReliability >= 80 ? 'badge-success' : (item.overallReliability >= 50 ? 'badge-warning' : 'badge-danger')}">
            ${item.overallReliability}% Reliable
          </span>
        </div>

        <div class="history-meta-row">
          <span>${item.responseType || 'General'}</span>
          <span>&bull;</span>
          <span>Bookmarked</span>
          <span>&bull;</span>
          <span>${dateStr}</span>
        </div>

        <div class="history-preview">
          ${escapeHtml(item.answer)}
        </div>

        <div class="history-card-actions">
          <span class="badge badge-subtle">${claims.length} claims analyzed</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-sm btn-primary btn-open-saved" data-id="${item.id}">
              View Analysis
            </button>
            <button class="btn btn-sm btn-secondary btn-export-saved" data-id="${item.id}">
              PDF
            </button>
            <button class="btn btn-sm btn-ghost text-danger btn-remove-saved" data-id="${item.id}" title="Remove from saved">
              Remove
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Handlers
  container.querySelectorAll('.btn-open-saved').forEach(btn => {
    btn.addEventListener('click', () => openReportById(btn.dataset.id));
  });

  container.querySelectorAll('.btn-export-saved').forEach(btn => {
    btn.addEventListener('click', () => {
      openReportById(btn.dataset.id);
      setTimeout(() => window.print(), 350);
    });
  });

  container.querySelectorAll('.btn-remove-saved').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBookmarkById(btn.dataset.id);
      renderSavedList(DOM.savedSearchInput ? DOM.savedSearchInput.value : '');
    });
  });
}

function openReportById(id) {
  const item = AppState.history.find(h => h.id === id) || AppState.saved.find(s => s.id === id);
  if (!item) {
    showToast('Report could not be found.', 'error');
    return;
  }

  // Switch to Ask view and show report
  switchView('ask');
  DOM.askFormContainer.classList.add('hidden');
  DOM.loadingStageCard.classList.add('hidden');
  DOM.answerReportContainer.classList.remove('hidden');

  displayReport(item);
}

function toggleBookmarkById(id) {
  const item = AppState.history.find(h => h.id === id) || AppState.saved.find(s => s.id === id);
  if (!item) return;

  const existingIdx = AppState.saved.findIndex(s => s.id === id);

  if (existingIdx !== -1) {
    AppState.saved.splice(existingIdx, 1);
    showToast('Answer removed from bookmarks.', 'info');
    if (AppState.currentReport && AppState.currentReport.id === id) {
      updateSaveButtonUI(false);
    }
  } else {
    AppState.saved.unshift(item);
    showToast('Answer bookmarked in Saved Answers!', 'success');
    if (AppState.currentReport && AppState.currentReport.id === id) {
      updateSaveButtonUI(true);
    }
  }

  saveBookmarks();
  if (AppState.currentView === 'history') {
    renderHistoryList(DOM.historySearchInput ? DOM.historySearchInput.value : '');
  } else if (AppState.currentView === 'saved') {
    renderSavedList(DOM.savedSearchInput ? DOM.savedSearchInput.value : '');
  }
}

function updateSaveButtonUI(isSaved) {
  if (!DOM.saveBtnText) return;
  if (isSaved) {
    DOM.saveBtnText.textContent = 'Saved ★';
    DOM.btnSaveAnswer.classList.add('btn-primary');
    DOM.btnSaveAnswer.classList.remove('btn-secondary');
  } else {
    DOM.saveBtnText.textContent = 'Save Answer';
    DOM.btnSaveAnswer.classList.remove('btn-primary');
    DOM.btnSaveAnswer.classList.add('btn-secondary');
  }
}

function deleteHistoryById(id) {
  if (!confirm('Are you sure you want to delete this audit record?')) return;

  AppState.history = AppState.history.filter(h => h.id !== id);
  saveHistory();
  renderHistoryList(DOM.historySearchInput ? DOM.historySearchInput.value : '');
  updateDashboardMetrics();
  showToast('Record deleted.', 'info');
}

function clearAllHistory() {
  if (AppState.history.length === 0) return;
  if (!confirm('Are you sure you want to clear all answer history?')) return;

  AppState.history = [];
  saveHistory();
  renderHistoryList();
  updateDashboardMetrics();
  showToast('All history cleared.', 'info');
}

// ==========================================
// 11. EVENT HANDLERS BINDING
// ==========================================
function bindEventHandlers() {
  // Navigation
  DOM.navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      switchView(view);
    });
  });

  DOM.mobileToggleBtn.addEventListener('click', () => {
    DOM.sidebar.classList.toggle('open');
  });

  DOM.mobileCloseBtn.addEventListener('click', () => {
    DOM.sidebar.classList.remove('open');
  });

  DOM.topAskBtn.addEventListener('click', () => {
    switchView('ask');
    resetAskForm();
    DOM.questionInput.focus();
  });

  DOM.dashQuickAskBtn.addEventListener('click', () => {
    switchView('ask');
    resetAskForm();
    DOM.questionInput.focus();
  });

  DOM.viewAllHistoryBtn.addEventListener('click', () => {
    switchView('history');
  });

  // Question Character Counter
  DOM.questionInput.addEventListener('input', () => {
    const len = DOM.questionInput.value.length;
    DOM.questionCharCount.textContent = `${len} / 1000`;
  });

  // Response Type Radios
  DOM.responseTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      DOM.currentTypeBadge.textContent = radio.value;
      document.querySelectorAll('.type-radio-label').forEach(lbl => {
        const inp = lbl.querySelector('input');
        if (inp && inp.checked) lbl.classList.add('active');
        else lbl.classList.remove('active');
      });
    });
  });

  // Context Toggle
  DOM.contextToggle.addEventListener('click', () => {
    DOM.contextInputWrapper.classList.toggle('collapsed');
  });

  // Sample Question Pills
  DOM.samplePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const q = pill.dataset.question;
      const type = pill.dataset.type;

      DOM.questionInput.value = q;
      DOM.questionCharCount.textContent = `${q.length} / 1000`;

      // Select type
      DOM.responseTypeRadios.forEach(r => {
        if (r.value === type) {
          r.checked = true;
          DOM.currentTypeBadge.textContent = type;
        }
      });
      document.querySelectorAll('.type-radio-label').forEach(lbl => {
        const inp = lbl.querySelector('input');
        if (inp && inp.checked) lbl.classList.add('active');
        else lbl.classList.remove('active');
      });

      showToast(`Sample question loaded: "${q.slice(0, 40)}..."`, 'info');
      DOM.questionInput.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Generate Answer Button
  DOM.generateAnswerBtn.addEventListener('click', handleGenerateAnswer);

  // Copy Answer
  DOM.btnCopyAnswer.addEventListener('click', () => {
    if (AppState.currentReport && AppState.currentReport.answer) {
      navigator.clipboard.writeText(AppState.currentReport.answer).then(() => {
        showToast('Answer copied to clipboard!', 'success');
      }).catch(() => {
        showToast('Failed to copy text.', 'error');
      });
    }
  });

  // Save/Bookmark Answer
  DOM.btnSaveAnswer.addEventListener('click', () => {
    if (AppState.currentReport) {
      toggleBookmarkById(AppState.currentReport.id);
    }
  });

  // Export PDF Report
  DOM.btnExportPDF.addEventListener('click', () => {
    window.print();
  });

  // Reanalyze Modal Handlers
  DOM.btnReanalyzeModal.addEventListener('click', () => {
    DOM.reanalyzeContextInput.value = '';
    DOM.reanalyzeModal.classList.remove('hidden');
  });

  DOM.closeReanalyzeModalBtn.addEventListener('click', () => {
    DOM.reanalyzeModal.classList.add('hidden');
  });

  DOM.cancelReanalyzeBtn.addEventListener('click', () => {
    DOM.reanalyzeModal.classList.add('hidden');
  });

  DOM.confirmReanalyzeBtn.addEventListener('click', handleConfirmReanalyze);

  // Close Report Button
  DOM.btnNewQuestion.addEventListener('click', () => {
    resetAskForm();
  });

  // Claim Filter Buttons
  DOM.filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.claimFilter = btn.dataset.claimFilter;
      renderClaimsCards();
    });
  });

  // Search Inputs
  if (DOM.historySearchInput) {
    DOM.historySearchInput.addEventListener('input', (e) => {
      renderHistoryList(e.target.value);
    });
  }

  if (DOM.savedSearchInput) {
    DOM.savedSearchInput.addEventListener('input', (e) => {
      renderSavedList(e.target.value);
    });
  }

  // Clear History
  if (DOM.clearAllHistoryBtn) {
    DOM.clearAllHistoryBtn.addEventListener('click', clearAllHistory);
  }
}

function resetAskForm() {
  DOM.askFormContainer.classList.remove('hidden');
  DOM.loadingStageCard.classList.add('hidden');
  DOM.answerReportContainer.classList.add('hidden');
  DOM.questionInput.value = '';
  DOM.contextInput.value = '';
  DOM.questionCharCount.textContent = '0 / 1000';
}

// ==========================================
// 12. UTILITY FUNCTIONS
// ==========================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message, type = 'info') {
  const container = DOM.toastContainer;
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

// Expose switchView to global window for inline onclicks
window.switchView = switchView;
