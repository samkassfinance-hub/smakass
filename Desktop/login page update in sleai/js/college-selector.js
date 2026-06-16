// College Selector - Tamil Nadu Admission System
let collegeData = null;
let allColleges = [];
let filteredColleges = [];
let currentDegree = '';
let currentCutoff = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadCollegeData();
    setupEventListeners();
});

// Load college data from JSON
async function loadCollegeData() {
    try {
        const response = await fetch('./data/tamil-nadu-colleges.json');
        if (!response.ok) throw new Error('Failed to load college data');
        collegeData = await response.json();
        populateDegreeDropdown();
    } catch (error) {
        console.error('Error loading college data:', error);
        alert('Error loading college data. Please refresh the page.');
    }
}

// Populate degree dropdown
function populateDegreeDropdown() {
    const degreeSelect = document.getElementById('degree');
    collegeData.degrees.forEach(degree => {
        const option = document.createElement('option');
        option.value = degree.id;
        option.textContent = degree.name;
        option.dataset.exam = degree.exam;
        option.dataset.maxScore = degree.exam_max_score;
        degreeSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    const form = document.getElementById('searchForm');
    const degreeSelect = document.getElementById('degree');
    const cutoffInput = document.getElementById('cutoff');

    form.addEventListener('submit', handleSearch);
    degreeSelect.addEventListener('change', updateCutoffInfo);
    cutoffInput.addEventListener('input', updateCutoffInfo);
}

// Update cutoff info based on selected degree
function updateCutoffInfo() {
    const degreeSelect = document.getElementById('degree');
    const cutoffInput = document.getElementById('cutoff');
    const cutoffInfo = document.getElementById('cutoffInfo');

    if (!degreeSelect.value) {
        cutoffInfo.classList.remove('show');
        return;
    }

    const selectedOption = degreeSelect.options[degreeSelect.selectedIndex];
    const exam = selectedOption.dataset.exam;
    const maxScore = selectedOption.dataset.maxScore;
    const cutoff = parseInt(cutoffInput.value) || 0;

    if (cutoff > 0) {
        const percentage = ((cutoff / maxScore) * 100).toFixed(1);
        cutoffInfo.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <strong>${exam}</strong> - Your Score: ${cutoff}/${maxScore} (${percentage}%)
        `;
        cutoffInfo.classList.add('show');
    } else {
        cutoffInfo.classList.remove('show');
    }
}

// Handle search form submission
async function handleSearch(e) {
    e.preventDefault();

    const degree = document.getElementById('degree').value;
    const cutoff = parseInt(document.getElementById('cutoff').value);
    const collegeType = document.getElementById('collegeType').value;

    if (!degree || !cutoff) {
        alert('Please select a degree and enter your cutoff score');
        return;
    }

    currentDegree = degree;
    currentCutoff = cutoff;

    // Get colleges for selected degree
    allColleges = collegeData.colleges[degree] || [];

    // Filter by cutoff
    filteredColleges = allColleges.filter(college => 
        cutoff >= college.cutoff_min && cutoff <= college.cutoff_max
    );

    // Filter by college type if selected
    if (collegeType) {
        filteredColleges = filteredColleges.filter(college => college.type === collegeType);
    }

    // Sort by tier and placement rate
    filteredColleges.sort((a, b) => {
        const tierOrder = { 'Top': 0, 'High': 1, 'Good': 2, 'Medium': 3 };
        if (tierOrder[a.tier] !== tierOrder[b.tier]) {
            return tierOrder[a.tier] - tierOrder[b.tier];
        }
        return b.placement_rate - a.placement_rate;
    });

    displayResults();
}

// Display search results
function displayResults() {
    const resultsSection = document.getElementById('resultsSection');
    const collegesGrid = document.getElementById('collegesGrid');
    const noResults = document.getElementById('noResults');
    const collegeCount = document.getElementById('collegeCount');
    const selectedDegree = document.getElementById('selectedDegree');
    const selectedCutoff = document.getElementById('selectedCutoff');

    // Update header info
    const degreeName = collegeData.degrees.find(d => d.id === currentDegree)?.name || '';
    selectedDegree.textContent = degreeName;
    selectedCutoff.textContent = currentCutoff;
    collegeCount.textContent = filteredColleges.length;

    // Populate city filter
    populateCityFilter();

    // Show/hide results
    if (filteredColleges.length === 0) {
        collegesGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        displayColleges(filteredColleges);
    }

    resultsSection.classList.add('show');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display colleges in grid
function displayColleges(colleges) {
    const collegesGrid = document.getElementById('collegesGrid');
    collegesGrid.innerHTML = '';

    colleges.forEach((college, index) => {
        const card = createCollegeCard(college);
        collegesGrid.appendChild(card);
        // Stagger animation
        card.style.animationDelay = `${index * 0.1}s`;
    });
}

// Create college card element
function createCollegeCard(college) {
    const card = document.createElement('div');
    card.className = 'college-card';

    const tierClass = `tier-${college.tier.toLowerCase()}`;
    const specializationHTML = college.specialization
        .slice(0, 3)
        .map(spec => `<span class="spec-tag">${spec}</span>`)
        .join('');

    card.innerHTML = `
        <div class="college-header">
            <div class="college-name">${college.name}</div>
            <div class="college-city">
                <i class="fas fa-map-marker-alt"></i> ${college.city}
            </div>
        </div>
        <div class="college-body">
            <span class="tier-badge ${tierClass}">${college.tier} Tier</span>
            
            <div class="college-info">
                <div class="info-label">Type</div>
                <div class="info-value">
                    <i class="fas fa-${college.type === 'Government' ? 'landmark' : 'building'}"></i>
                    ${college.type}
                </div>
            </div>

            <div class="college-info">
                <div class="info-label">Admission</div>
                <div class="info-value">${college.admission}</div>
            </div>

            <div class="college-info">
                <div class="info-label">Cutoff Range</div>
                <div class="info-value">${college.cutoff_min} - ${college.cutoff_max}</div>
            </div>

            <div class="placement-rate">
                <i class="fas fa-chart-pie"></i> ${college.placement_rate}% Placement Rate
            </div>

            <div class="college-info">
                <div class="info-label">Specializations</div>
                <div class="specialization">${specializationHTML}</div>
            </div>

            <div class="college-info">
                <div class="info-label">Established</div>
                <div class="info-value">${college.established}</div>
            </div>

            <div class="college-footer">
                <button class="btn-small btn-details" onclick="viewDetails(${college.id}, '${currentDegree}')">
                    <i class="fas fa-info-circle"></i> Details
                </button>
                <a href="${college.website}" target="_blank" class="btn-small btn-website" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 5px;">
                    <i class="fas fa-globe"></i> Website
                </a>
            </div>
        </div>
    `;

    return card;
}

// Populate city filter
function populateCityFilter() {
    const cityFilter = document.getElementById('cityFilter');
    const filterSection = document.getElementById('filterSection');
    
    // Get unique cities
    const cities = [...new Set(filteredColleges.map(c => c.city))].sort();
    
    // Clear existing options except first
    while (cityFilter.options.length > 1) {
        cityFilter.remove(1);
    }

    // Add city options
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });

    filterSection.classList.add('show');
}

// Apply filters
function applyFilters() {
    const tierFilter = document.getElementById('tierFilter').value;
    const cityFilter = document.getElementById('cityFilter').value;

    let filtered = [...filteredColleges];

    if (tierFilter) {
        filtered = filtered.filter(c => c.tier === tierFilter);
    }

    if (cityFilter) {
        filtered = filtered.filter(c => c.city === cityFilter);
    }

    const collegesGrid = document.getElementById('collegesGrid');
    const noResults = document.getElementById('noResults');

    if (filtered.length === 0) {
        collegesGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        displayColleges(filtered);
    }
}

// View college details
function viewDetails(collegeId, degree) {
    const college = collegeData.colleges[degree].find(c => c.id === collegeId);
    if (!college) return;

    // Store college data in session storage
    sessionStorage.setItem('selectedCollege', JSON.stringify(college));
    sessionStorage.setItem('selectedDegree', degree);

    // Open details page
    window.location.href = `college-details.html?id=${collegeId}&degree=${degree}`;
}

// Export for use in other pages
window.collegeSelector = {
    getCollegeData: () => collegeData,
    getCollegeById: (id, degree) => collegeData.colleges[degree]?.find(c => c.id === id),
    getAllColleges: () => allColleges,
    getFilteredColleges: () => filteredColleges
};
