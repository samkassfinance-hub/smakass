// College Admission System - Core Module
window.collegeSystem = {
    dbPath: './data/database.json',
    cachedData: null,

    /**
     * Load database from JSON file
     * @returns {Promise<Object>} Database object
     */
    async loadDatabase() {
        if (this.cachedData) {
            return this.cachedData;
        }

        try {
            const response = await fetch(this.dbPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.cachedData = await response.json();
            return this.cachedData;
        } catch (error) {
            console.error('Error loading database:', error);
            throw new Error('Failed to load college database. Please refresh the page.');
        }
    },

    /**
     * Get all degrees
     * @returns {Promise<Array>} Array of degrees
     */
    async getDegrees() {
        const data = await this.loadDatabase();
        return data.degrees || [];
    },

    /**
     * Get subjects for a specific degree
     * @param {string} degree - Degree name
     * @returns {Promise<Array>} Array of subjects
     */
    async getSubjects(degree) {
        const data = await this.loadDatabase();
        return data.subjects[degree] || [];
    },

    /**
     * Get cutoff formula for a degree
     * @param {string} degree - Degree name
     * @returns {Promise<string>} Formula string
     */
    async getCutoffFormula(degree) {
        const data = await this.loadDatabase();
        return data.cutoff_formula[degree] || '';
    },

    /**
     * Get all entrance exams
     * @returns {Promise<Array>} Array of entrance exams
     */
    async getEntranceExams() {
        const data = await this.loadDatabase();
        return data.entrance_exams || [];
    },

    /**
     * Get colleges by admission type
     * @param {string} type - 'cutoff', 'exam', or 'management'
     * @returns {Promise<Array>} Array of colleges
     */
    async getCollegesByType(type) {
        const data = await this.loadDatabase();
        return data.colleges[type] || [];
    },

    /**
     * Filter colleges by cutoff score
     * @param {Array} colleges - Array of colleges
     * @param {number} cutoffScore - Student's cutoff score
     * @returns {Array} Filtered colleges
     */
    filterByScore(colleges, cutoffScore) {
        return colleges.filter(college => {
            if (!college.cutoff_range) return false;
            
            const range = college.cutoff_range.split('-').map(s => parseFloat(s.trim()));
            if (range.length !== 2) return false;
            
            const [min, max] = range;
            return cutoffScore >= min && cutoffScore <= max;
        });
    },

    /**
     * Filter colleges by exam score/rank
     * @param {Array} colleges - Array of colleges
     * @param {number} score - Student's exam score
     * @param {number} rank - Student's exam rank
     * @returns {Array} Filtered colleges
     */
    filterByExamScore(colleges, score, rank) {
        return colleges.filter(college => {
            if (!college.score_range) return false;
            
            // Simple filtering - can be enhanced based on data structure
            return true;
        });
    },

    /**
     * Filter colleges by budget
     * @param {Array} colleges - Array of colleges
     * @param {number} budget - Student's budget
     * @returns {Array} Filtered colleges
     */
    filterByBudget(colleges, budget) {
        return colleges.filter(college => {
            if (!college.fee_range) return false;
            
            const range = college.fee_range.split('-').map(s => {
                return parseInt(s.replace(/[₹,]/g, '').trim());
            });
            
            if (range.length !== 2) return false;
            
            const [min, max] = range;
            return budget >= min && budget <= max;
        });
    },

    /**
     * Search colleges by name
     * @param {Array} colleges - Array of colleges
     * @param {string} searchTerm - Search term
     * @returns {Array} Filtered colleges
     */
    searchByName(colleges, searchTerm) {
        const term = searchTerm.toLowerCase();
        return colleges.filter(college => 
            college.college_name.toLowerCase().includes(term)
        );
    },

    /**
     * Filter colleges by location
     * @param {Array} colleges - Array of colleges
     * @param {string} location - Location name
     * @returns {Array} Filtered colleges
     */
    filterByLocation(colleges, location) {
        return colleges.filter(college => college.location === location);
    },

    /**
     * Get unique locations from colleges
     * @param {Array} colleges - Array of colleges
     * @returns {Array} Unique locations
     */
    getUniqueLocations(colleges) {
        return [...new Set(colleges.map(c => c.location).filter(Boolean))];
    },

    /**
     * Sort colleges by name
     * @param {Array} colleges - Array of colleges
     * @param {string} order - 'asc' or 'desc'
     * @returns {Array} Sorted colleges
     */
    sortByName(colleges, order = 'asc') {
        const sorted = [...colleges].sort((a, b) => {
            return a.college_name.localeCompare(b.college_name);
        });
        return order === 'desc' ? sorted.reverse() : sorted;
    },

    /**
     * Get college by name
     * @param {Array} colleges - Array of colleges
     * @param {string} name - College name
     * @returns {Object|null} College object or null
     */
    getCollegeByName(colleges, name) {
        return colleges.find(c => c.college_name === name) || null;
    },

    /**
     * Validate database structure
     * @returns {Promise<boolean>} True if valid
     */
    async validateDatabase() {
        try {
            const data = await this.loadDatabase();
            
            const requiredFields = ['degrees', 'subjects', 'cutoff_formula', 'entrance_exams', 'colleges'];
            const hasAllFields = requiredFields.every(field => field in data);
            
            if (!hasAllFields) {
                console.warn('Database missing some fields');
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Database validation failed:', error);
            return false;
        }
    }
};

// Initialize on page load
// Auto-adjust path based on current location
if (window.location.pathname.includes('/pages/')) {
    window.collegeSystem.dbPath = '../data/database.json';
}

document.addEventListener('DOMContentLoaded', function() {
    window.collegeSystem.validateDatabase().catch(err => console.log('DB validation:', err));
});
