/**
 * API Service - Centralized authentication and API calls
 * Handles all authenticated requests with automatic credential inclusion
 */

const API_BASE_URL = 'http://localhost:5000';

class ApiService {
    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint (e.g., '/api/assessment/submit')
     * @param {object} options - Fetch options
     * @returns {Promise<object>} - Response data
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;

        // Always include credentials for session cookies
        const config = {
            ...options,
            credentials: 'include', // CRITICAL: Send cookies with request
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error(`API Error [${endpoint}]:`, error);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PATCH request
     */
    async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Check if user is authenticated
     * @returns {Promise<object|null>} - User data if authenticated, null otherwise
     */
    async checkAuth() {
        try {
            const data = await this.get('/auth/current-user');
            return data.authenticated ? data.user : null;
        } catch (error) {
            console.warn('Auth check failed:', error.message);
            return null;
        }
    }

    /**
     * Require authentication before proceeding
     * Redirects to login if not authenticated
     * @returns {Promise<object>} - User data
     */
    async requireAuth() {
        const user = await this.checkAuth();

        if (!user) {
            // Store current page to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', window.location.pathname);

            // Show error message
            const shouldLogin = confirm('You must be logged in to access this feature. Would you like to log in now?');

            if (shouldLogin) {
                window.location.href = `${API_BASE_URL}/auth/google`;
            } else {
                throw new Error('Authentication required');
            }
        }

        return user;
    }

    /**
     * Submit career assessment
     */
    async submitAssessment(assessmentData) {
        return this.post('/api/assessment/submit', assessmentData);
    }

    /**
     * Get latest assessment
     */
    async getLatestAssessment() {
        return this.get('/api/assessment/latest');
    }

    /**
     * Get roadmap tasks
     */
    async getRoadmap() {
        return this.get('/api/roadmap');
    }

    /**
     * Update roadmap task
     */
    async updateRoadmapTask(taskId, status) {
        return this.patch(`/api/roadmap/${taskId}`, { status });
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await this.get('/auth/logout');
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
            // Force redirect anyway
            window.location.href = '/';
        }
    }
}

// Export singleton instance
const apiService = new ApiService();

// Make available globally
if (typeof window !== 'undefined') {
    window.apiService = apiService;
}
