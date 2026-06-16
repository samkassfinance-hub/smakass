// Tamil Nadu Cutoff Data by Group and Category
const groupCutoffData = {
    engineering: {
        name: 'Engineering (B.E / B.Tech)',
        icon: '⚙️',
        description: 'TNEA - Engineering Entrance',
        categories: {
            'OC': { min: 180, max: 200, description: 'General Category' },
            'BC': { min: 160, max: 195, description: 'Backward Class' },
            'BCM': { min: 155, max: 190, description: 'Backward Class Muslim' },
            'MBC': { min: 150, max: 185, description: 'Most Backward Class' },
            'SC': { min: 140, max: 175, description: 'Scheduled Caste' },
            'ST': { min: 130, max: 165, description: 'Scheduled Tribe' }
        },
        formula: 'Mathematics + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200
    },
    agriculture: {
        name: 'Agriculture (B.Sc Agriculture)',
        icon: '🌾',
        description: 'TNAU - Agriculture Entrance',
        categories: {
            'OC': { min: 170, max: 195, description: 'General Category' },
            'BC': { min: 150, max: 180, description: 'Backward Class' },
            'BCM': { min: 145, max: 175, description: 'Backward Class Muslim' },
            'MBC': { min: 140, max: 170, description: 'Most Backward Class' },
            'SC': { min: 130, max: 160, description: 'Scheduled Caste' },
            'ST': { min: 120, max: 150, description: 'Scheduled Tribe' }
        },
        formula: 'Biology + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200
    },
    veterinary: {
        name: 'Veterinary (B.V.Sc)',
        icon: '🐾',
        description: 'Veterinary Science Entrance',
        categories: {
            'OC': { min: 175, max: 196, description: 'General Category' },
            'BC': { min: 155, max: 185, description: 'Backward Class' },
            'BCM': { min: 150, max: 180, description: 'Backward Class Muslim' },
            'MBC': { min: 145, max: 175, description: 'Most Backward Class' },
            'SC': { min: 135, max: 165, description: 'Scheduled Caste' },
            'ST': { min: 125, max: 155, description: 'Scheduled Tribe' }
        },
        formula: 'Biology + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200
    },
    arts: {
        name: 'Arts & Science (B.A / B.Sc / B.Com)',
        icon: '📚',
        description: 'Arts & Science Stream',
        categories: {
            'OC': { min: 300, max: 400, description: 'General Category' },
            'BC': { min: 260, max: 360, description: 'Backward Class' },
            'BCM': { min: 250, max: 350, description: 'Backward Class Muslim' },
            'MBC': { min: 240, max: 340, description: 'Most Backward Class' },
            'SC': { min: 220, max: 320, description: 'Scheduled Caste' },
            'ST': { min: 200, max: 300, description: 'Scheduled Tribe' }
        },
        formula: 'Subject 1 + Subject 2 + Subject 3 + Subject 4',
        maxCutoff: 400
    },
    polytechnic: {
        name: 'Polytechnic (Diploma)',
        icon: '🔧',
        description: 'Polytechnic Diploma Programs',
        categories: {
            'OC': { min: 150, max: 190, description: 'General Category' },
            'BC': { min: 130, max: 170, description: 'Backward Class' },
            'BCM': { min: 125, max: 165, description: 'Backward Class Muslim' },
            'MBC': { min: 120, max: 160, description: 'Most Backward Class' },
            'SC': { min: 110, max: 150, description: 'Scheduled Caste' },
            'ST': { min: 100, max: 140, description: 'Scheduled Tribe' }
        },
        formula: 'Mathematics + (Science / 2)',
        maxCutoff: 200
    }
};

let allColleges = [];
let filteredColleges = [];
let selectedColleges = [];
let currentView = 'grid';
let currentPage = 1;
let selectedGroup = null;
let selectedCategory = null;
const itemsPerPage = 12;

async function loadColleges() {
    try {
        const response = await fetch('collages.json');
        const data = await response.json();
        allColleges = data.colleges;
        filteredColleges = [...allColleges];
        initializeGroupSelector();
        initializeFilters();
        applyFilters();
    } catch (error) {
        console.error('Error loading colleges:', error);
    }
}

function initializeGroupSelector() {
    const groupGrid = document.getElementById('groupGrid');
    groupGrid.innerHTML = '';

    Object.entries(groupCutoffData).forEach(([key, group]) => {
        const card = document.createElement('div');
        card.className = 'group-card';
        card.onclick = () => selectGroup(key);
        
        const categoryCount = Object.keys(group.categories).length;
        card.innerHTML = `
            <div class="group-icon">${group.icon}</div>
            <div class="group-name">${group.name}</div>
            <div class="group-desc">${group.description}</div>
            <div class="group-cutoff-info">
                ${categoryCount} Categories<br>
                Max Cutoff: ${group.maxCutoff}
            </div>
        `;
        groupGrid.appendChild(card);
    });
}

function selectGroup(groupKey) {
    selectedGroup = groupKey;
    selectedCategory = null;
    
    // Update UI
    document.querySelectorAll('.group-card').forEach(card => card.classList.remove('selected'));
    event.target.closest('.group-card').classList.add('selected');

    // Show group info
    const groupInfo = groupCutoffData[groupKey];
    const groupInfoBox = document.getElementById('groupInfo');
    const groupInfoContent = document.getElementById('groupInfoContent');
    
    groupInfoContent.innerHTML = `
        <strong>${groupInfo.name}</strong>
        Formula: ${groupInfo.formula}<br>
        Maximum Cutoff: ${groupInfo.maxCutoff}
    `;
    groupInfoBox.style.display = 'block';

    // Update category filter
    updateCategoryFilter(groupKey);
    
    // Apply filters
    applyFilters();
}

function updateCategoryFilter(groupKey) {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '';

    const categories = groupCutoffData[groupKey].categories;
    
    Object.entries(categories).forEach(([catKey, catData]) => {
        const label = document.createElement('label');
        label.className = 'filter-item';
        label.innerHTML = `
            <input type="radio" name="category" value="${catKey}" onchange="selectCategory('${catKey}'); applyFilters()">
            <span><strong>${catKey}</strong> - ${catData.description}</span>
        `;
        categoryFilter.appendChild(label);
    });
}

function selectCategory(category) {
    selectedCategory = category;
}

function applyFilters() {
    if (!selectedGroup) {
        document.getElementById('collegesContainer').innerHTML = '';
        document.getElementById('noResults').style.display = 'block';
        document.getElementById('resultCount').textContent = '0';
        return;
    }

    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const userCutoff = parseFloat(document.getElementById('userCutoff').value);
    const maxCutoff = parseInt(document.getElementById('cutoffRange').value);
    const groupKey = selectedGroup;
    const groupInfo = groupCutoffData[groupKey];

    // Update user cutoff display
    if (userCutoff) {
        document.getElementById('userCutoffValue').textContent = userCutoff.toFixed(2);
    } else {
        document.getElementById('userCutoffValue').textContent = '--';
    }

    // Map group to college category
    let collegeCategories = [];
    if (groupKey === 'engineering') collegeCategories = ['Engineering', 'Polytechnic'];
    else if (groupKey === 'agriculture') collegeCategories = ['Agriculture'];
    else if (groupKey === 'veterinary') collegeCategories = ['Veterinary'];
    else if (groupKey === 'arts') collegeCategories = ['Arts and Science'];
    else if (groupKey === 'polytechnic') collegeCategories = ['Polytechnic'];

    filteredColleges = allColleges.filter(college => {
        const matchesSearch = college.name.toLowerCase().includes(searchTerm);
        const matchesGroup = collegeCategories.includes(college.category);
        const matchesRangeFilter = college.cutoff_min <= maxCutoff;
        
        let matchesUserCutoff = true;
        if (userCutoff) {
            matchesUserCutoff = userCutoff >= college.cutoff_min && userCutoff <= college.cutoff_max;
        }

        return matchesSearch && matchesGroup && matchesRangeFilter && matchesUserCutoff;
    });

    applySorting();
    currentPage = 1;
    displayColleges();
    updateResultCount();
}

function applySorting() {
    const sortValue = document.getElementById('sortSelect').value;

    switch(sortValue) {
        case 'name-asc':
            filteredColleges.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredColleges.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'cutoff-asc':
            filteredColleges.sort((a, b) => a.cutoff_min - b.cutoff_min);
            break;
        case 'cutoff-desc':
            filteredColleges.sort((a, b) => b.cutoff_max - a.cutoff_max);
            break;
    }
}

function displayColleges() {
    const container = document.getElementById('collegesContainer');
    const noResults = document.getElementById('noResults');

    if (filteredColleges.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    noResults.style.display = 'none';
    container.className = currentView === 'grid' ? 'colleges-grid' : 'colleges-list';

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageColleges = filteredColleges.slice(start, end);

    container.innerHTML = pageColleges.map(college => createCollegeCard(college)).join('');
    displayPagination();
}

function createCollegeCard(college) {
    const isSelected = selectedColleges.some(c => c.id === college.id);
    const userCutoff = parseFloat(document.getElementById('userCutoff').value);
    const isEligible = userCutoff && userCutoff >= college.cutoff_min && userCutoff <= college.cutoff_max;
    
    let eligibilityBadge = '';
    if (userCutoff) {
        if (isEligible) {
            eligibilityBadge = '<span class="eligibility-badge">✓ Eligible</span>';
        } else {
            eligibilityBadge = '<span class="eligibility-badge not-eligible">✗ Not Eligible</span>';
        }
    }

    return `
        <div class="college-card ${isSelected ? 'selected' : ''}" data-id="${college.id}">
            <div class="college-header">
                <div class="college-name">${college.name}</div>
                <input type="checkbox" class="college-checkbox" 
                       ${isSelected ? 'checked' : ''} 
                       onchange="toggleSelection(${college.id}, this.checked)">
            </div>
            <span class="college-category">${college.category}</span>
            <div class="college-info">
                <i class="fas fa-chart-line"></i>
                <span>Cutoff: ${college.cutoff_min} - ${college.cutoff_max}</span>
                ${eligibilityBadge}
            </div>
            <div class="college-cutoff">
                Range: ${college.cutoff_range}
            </div>
            <div class="college-actions">
                <button class="btn-small btn-details" onclick="viewDetails(${college.id})">
                    <i class="fas fa-info-circle"></i> Details
                </button>
                <button class="btn-small btn-compare" onclick="toggleSelection(${college.id}, !${isSelected})">
                    <i class="fas fa-balance-scale"></i> Compare
                </button>
            </div>
        </div>
    `;
}

function toggleSelection(collegeId, isSelected) {
    const college = allColleges.find(c => c.id === collegeId);
    
    if (isSelected) {
        if (!selectedColleges.find(c => c.id === collegeId)) {
            selectedColleges.push(college);
        }
    } else {
        selectedColleges = selectedColleges.filter(c => c.id !== collegeId);
    }

    updateCardSelection(collegeId, isSelected);
    updateComparisonPanel();
}

function updateCardSelection(collegeId, isSelected) {
    const card = document.querySelector(`[data-id="${collegeId}"]`);
    if (card) {
        if (isSelected) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
        const checkbox = card.querySelector('.college-checkbox');
        if (checkbox) {
            checkbox.checked = isSelected;
        }
    }
}

function updateComparisonPanel() {
    const panel = document.getElementById('comparisonPanel');
    const content = document.getElementById('comparisonContent');

    if (selectedColleges.length === 0) {
        panel.classList.remove('show');
        return;
    }

    panel.classList.add('show');

    let tableHTML = `
        <table class="comparison-table">
            <thead>
                <tr>
                    <th>Property</th>
                    ${selectedColleges.map(c => `<th>${c.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Category</strong></td>
                    ${selectedColleges.map(c => `<td>${c.category}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Cutoff Min</strong></td>
                    ${selectedColleges.map(c => `<td>${c.cutoff_min}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Cutoff Max</strong></td>
                    ${selectedColleges.map(c => `<td>${c.cutoff_max}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Cutoff Range</strong></td>
                    ${selectedColleges.map(c => `<td>${c.cutoff_range}</td>`).join('')}
                </tr>
                <tr>
                    <td><strong>Action</strong></td>
                    ${selectedColleges.map(c => `
                        <td>
                            <button class="btn-small btn-details" onclick="toggleSelection(${c.id}, false)">
                                Remove
                            </button>
                        </td>
                    `).join('')}
                </tr>
            </tbody>
        </table>
    `;

    content.innerHTML = tableHTML;
}

function displayPagination() {
    const totalPages = Math.ceil(filteredColleges.length / itemsPerPage);
    const pagination = document.getElementById('pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i> Previous</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="active">${i}</button>`;
        } else if (i <= 3 || i >= totalPages - 2 || Math.abs(i - currentPage) <= 1) {
            paginationHTML += `<button onclick="goToPage(${i})">${i}</button>`;
        } else if (i === 4 || i === totalPages - 3) {
            paginationHTML += `<button disabled>...</button>`;
        }
    }

    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next <i class="fas fa-chevron-right"></i></button>`;
    }

    pagination.innerHTML = paginationHTML;
}

function goToPage(page) {
    currentPage = page;
    displayColleges();
    document.querySelector('.content').scrollIntoView({ behavior: 'smooth' });
}

function updateResultCount() {
    document.getElementById('resultCount').textContent = filteredColleges.length;
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('userCutoff').value = '';
    document.getElementById('userCutoffValue').textContent = '--';
    document.getElementById('cutoffRange').value = '200';
    document.getElementById('cutoffValue').textContent = '200';
    document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
    selectedColleges = [];
    selectedCategory = null;
    applyFilters();
    document.querySelectorAll('.college-checkbox').forEach(cb => cb.checked = false);
    document.getElementById('comparisonPanel').classList.remove('show');
}

function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.closest('.view-btn').classList.add('active');
    displayColleges();
}

function viewDetails(collegeId) {
    const college = allColleges.find(c => c.id === collegeId);
    const groupInfo = groupCutoffData[selectedGroup];
    
    alert(`
College: ${college.name}
Category: ${college.category}
Group: ${groupInfo.name}
Cutoff Range: ${college.cutoff_range}
Min: ${college.cutoff_min}
Max: ${college.cutoff_max}
    `);
}

function closeComparison() {
    selectedColleges = [];
    document.querySelectorAll('.college-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.college-card').forEach(card => card.classList.remove('selected'));
    document.getElementById('comparisonPanel').classList.remove('show');
}

document.getElementById('cutoffRange').addEventListener('input', (e) => {
    document.getElementById('cutoffValue').textContent = e.target.value;
    applyFilters();
});

document.getElementById('searchInput').addEventListener('input', applyFilters);

document.addEventListener('DOMContentLoaded', loadColleges);
