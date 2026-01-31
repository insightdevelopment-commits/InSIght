/**
 * Dashboard Integration Script
 * Handles authentication, assessment history, and new application flow
 */

// Global state
let currentUser = null;
let assessmentHistory = [];

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    await loadAssessmentHistory();
    setupEventListeners();
});

/**
 * Check if user is authenticated and load profile
 */
async function checkAuthentication() {
    try {
        const data = await apiService.checkAuth();

        if (!data) {
            // Not authenticated - redirect to login
            window.location.href = 'http://localhost:3000/auth/google';
            return;
        }

        currentUser = data;
        updateUserInterface(data);
    } catch (error) {
        console.error('Auth check failed:', error);
        // Redirect to login on error
        window.location.href = 'http://localhost:3000/auth/google';
    }
}

/**
 * Update UI with user data
 */
function updateUserInterface(user) {
    // Update header avatar
    const headerAvatar = document.querySelector('header .pfp-trigger');
    if (headerAvatar && user.avatar) {
        headerAvatar.style.backgroundImage = `url(${user.avatar})`;
        headerAvatar.style.backgroundSize = 'cover';
        headerAvatar.style.backgroundPosition = 'center';
    }

    // Update settings panel avatar
    const settingsAvatar = document.querySelector('.settings-panel .pfp-trigger');
    if (settingsAvatar && user.avatar) {
        settingsAvatar.style.backgroundImage = `url(${user.avatar})`;
        settingsAvatar.style.backgroundSize = 'cover';
        settingsAvatar.style.backgroundPosition = 'center';
    }

    // Update name and email in settings
    const nameElement = document.querySelector('.settings-panel strong');
    const emailElement = document.querySelector('.settings-panel span[style*="font-size: 0.8rem"]');

    if (nameElement) nameElement.textContent = user.name;
    if (emailElement) emailElement.textContent = user.email;

    // Update welcome message
    const welcomeText = document.querySelector('.welcome-banner p');
    if (welcomeText) {
        welcomeText.textContent = `Welcome back, ${user.name.split(' ')[0]}. Your academic profile is being analyzed. The algorithm has detected new university matches since your last visit.`;
    }
}

/**
 * Load assessment history from API
 */
async function loadAssessmentHistory() {
    try {
        const data = await apiService.get('/api/assessment/all');
        assessmentHistory = data.assessments || [];
        renderHistory();
    } catch (error) {
        console.error('Failed to load history:', error);
        // Show empty state
        renderHistory();
    }
}

/**
 * Render assessment history in sidebar
 */
function renderHistory() {
    const historySection = document.querySelector('.history-section');
    if (!historySection) return;

    // Clear existing items (keep label)
    historySection.innerHTML = '<div class="history-label">Session History</div>';

    if (assessmentHistory.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.style.cssText = 'padding: 20px 0; color: var(--ink-secondary); font-size: 0.9rem; text-align: center;';
        emptyState.textContent = 'No assessments yet';
        historySection.appendChild(emptyState);
        return;
    }

    // Add history items
    assessmentHistory.forEach(assessment => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.onclick = () => openAssessmentModal(assessment.id);

        const date = new Date(assessment.createdAt);
        const formattedDate = formatDate(date);

        item.innerHTML = `
            <strong>${assessment.primaryCareer}</strong>
            <span class="history-date">${formattedDate}</span>
        `;

        historySection.appendChild(item);
    });
}

/**
 * Format date for display
 */
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // New Application button
    const newAppBtn = document.querySelector('.sidebar-btn.primary');
    if (newAppBtn) {
        newAppBtn.onclick = openNewApplicationModal;
    }

    // Logout button
    const logoutBtn = document.querySelector('.settings-panel button[style*="red"]');
    if (logoutBtn) {
        logoutBtn.onclick = handleLogout;
    }
}

/**
 * Open New Application modal
 */
function openNewApplicationModal() {
    const modal = createNewApplicationModal();
    document.body.appendChild(modal);
    modal.classList.add('show');
}

/**
 * Create New Application modal
 */
function createNewApplicationModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>New Career Assessment</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            
            <form id="newAssessmentForm">
                <div class="form-group">
                    <label class="form-label">Academic Interests</label>
                    <div class="checkbox-grid">
                        <div class="checkbox-item">
                            <input type="checkbox" id="cs" value="Computer Science">
                            <label for="cs">Computer Science</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="math" value="Mathematics">
                            <label for="math">Mathematics</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="business" value="Business">
                            <label for="business">Business</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="engineering" value="Engineering">
                            <label for="engineering">Engineering</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="arts" value="Arts">
                            <label for="arts">Arts</label>
                        </div>
                        <div class="checkbox-item">
                            <input type="checkbox" id="science" value="Science">
                            <label for="science">Science</label>
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="targetRegion">Target Region</label>
                    <select id="targetRegion" class="form-select">
                        <option value="">All Regions</option>
                        <option value="North America">North America</option>
                        <option value="Europe">Europe</option>
                        <option value="Asia">Asia</option>
                        <option value="Oceania">Oceania</option>
                        <option value="Latin America">Latin America</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="technicalSkills">Technical Skills</label>
                    <input type="text" id="technicalSkills" class="form-input" 
                           placeholder="e.g., Python, JavaScript, Data Analysis (comma-separated)">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="softSkills">Soft Skills</label>
                    <input type="text" id="softSkills" class="form-input" 
                           placeholder="e.g., Leadership, Communication, Problem Solving">
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="careerGoals">Career Goals</label>
                    <textarea id="careerGoals" class="form-textarea" 
                              placeholder="Describe your dream career, industry preferences, and aspirations..."></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="gpa">GPA (Optional)</label>
                    <input type="number" id="gpa" class="form-input" step="0.01" min="0" max="4" 
                           placeholder="e.g., 3.8">
                </div>
                
                <button type="submit" class="submit-btn">Analyze with Gemini AI</button>
            </form>
        </div>
    `;

    // Handle form submission
    const form = overlay.querySelector('#newAssessmentForm');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await handleAssessmentSubmission(overlay);
    };

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    };

    return overlay;
}

/**
 * Handle assessment form submission
 */
async function handleAssessmentSubmission(modal) {
    const form = modal.querySelector('#newAssessmentForm');
    const submitBtn = form.querySelector('.submit-btn');

    // Get form data
    const interests = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => cb.value);

    if (interests.length === 0) {
        alert('Please select at least one academic interest');
        return;
    }

    const technicalSkills = form.querySelector('#technicalSkills').value
        .split(',').map(s => s.trim()).filter(s => s);
    const softSkills = form.querySelector('#softSkills').value
        .split(',').map(s => s.trim()).filter(s => s);
    const careerGoals = form.querySelector('#careerGoals').value;
    const targetRegion = form.querySelector('#targetRegion').value;
    const gpa = form.querySelector('#gpa').value;

    // Add region to career goals if specified
    let enhancedGoals = careerGoals;
    if (targetRegion) {
        enhancedGoals += ` I am particularly interested in studying in ${targetRegion}.`;
    }

    const assessmentData = {
        academicInterests: interests,
        skills: {
            technical: technicalSkills,
            soft: softSkills
        },
        careerGoals: enhancedGoals,
        academicPerformance: gpa ? { gpa: parseFloat(gpa) } : null
    };

    // Show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Analyzing...';

    try {
        const data = await apiService.submitAssessment(assessmentData);

        // Close form modal
        modal.remove();

        // Show results modal
        openResultsModal(data.results);

        // Reload history
        await loadAssessmentHistory();

    } catch (error) {
        console.error('Assessment failed:', error);
        alert('Failed to process assessment: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Analyze with Gemini AI';
    }
}

/**
 * Open assessment details modal
 */
async function openAssessmentModal(assessmentId) {
    try {
        const assessment = await apiService.get(`/api/assessment/${assessmentId}`);
        openResultsModal(assessment);
    } catch (error) {
        console.error('Failed to load assessment:', error);
        alert('Failed to load assessment details');
    }
}

/**
 * Open results modal
 */
function openResultsModal(results) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay show';

    let html = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Career Analysis Results</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
    `;

    // Career Paths
    if (results.careerPaths && results.careerPaths.length > 0) {
        html += '<div class="result-section"><h3>Recommended Career Paths</h3>';
        results.careerPaths.forEach(career => {
            html += `
                <div class="career-card">
                    <h4>${career.title} <span class="match-badge">${career.matchScore}% Match</span></h4>
                    <p>${career.description}</p>
                </div>
            `;
        });
        html += '</div>';
    }

    // Universities
    if (results.universityRecommendations && results.universityRecommendations.length > 0) {
        html += '<div class="result-section"><h3>Matched Institutions (QS Rankings 2025)</h3>';
        results.universityRecommendations.forEach(uni => {
            const rankBadge = uni.rank ? `<span class="match-badge rank-badge">QS Rank #${uni.rank}</span>` : '';
            html += `
                <div class="university-card">
                    <h4>${uni.name} ${rankBadge} <span class="match-badge">${uni.matchScore}% Match</span></h4>
                    <p><strong>Location:</strong> ${uni.location || 'N/A'} ${uni.region ? `(${uni.region})` : ''}</p>
                    <p><strong>Program:</strong> ${uni.program}</p>
                    <p><strong>Admission Chance:</strong> ${uni.admissionChance}</p>
                    ${uni.score ? `<p><strong>QS Score:</strong> ${uni.score.toFixed(1)}</p>` : ''}
                </div>
            `;
        });
        html += '</div>';
    }

    // Market Analysis
    if (results.marketAnalysis) {
        html += `
            <div class="result-section">
                <h3>Market Analysis</h3>
                <div class="career-card">
                    <p><strong>Current Demand:</strong> ${results.marketAnalysis.currentDemand}</p>
                    <p><strong>Future Outlook:</strong> ${results.marketAnalysis.futureOutlook}</p>
                    <p><strong>Salary Range:</strong> ${results.marketAnalysis.salaryRange}</p>
                    <p><strong>Growth Rate:</strong> ${results.marketAnalysis.growthRate}</p>
                </div>
            </div>
        `;
    }

    html += '</div>';
    overlay.innerHTML = html;

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    };

    document.body.appendChild(overlay);
}

/**
 * Handle logout
 */
async function handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
        try {
            await apiService.logout();
        } catch (error) {
            // Force redirect anyway
            window.location.href = 'ai-mainpage.htm';
        }
    }
}
