// Tamil Nadu Cutoff Calculator
const degreeFormulas = {
    engineering: {
        name: 'Engineering (TNEA)',
        formula: 'Mathematics + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200,
        inputs: [
            { name: 'maths', label: 'Mathematics Marks', max: 100 },
            { name: 'physics', label: 'Physics Marks', max: 100 },
            { name: 'chemistry', label: 'Chemistry Marks', max: 100 }
        ],
        calculate: (marks) => marks.maths + (marks.physics / 2) + (marks.chemistry / 2)
    },
    medical: {
        name: 'Medical (MBBS/BDS)',
        formula: 'Biology + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200,
        inputs: [
            { name: 'biology', label: 'Biology Marks', max: 100 },
            { name: 'physics', label: 'Physics Marks', max: 100 },
            { name: 'chemistry', label: 'Chemistry Marks', max: 100 }
        ],
        calculate: (marks) => marks.biology + (marks.physics / 2) + (marks.chemistry / 2)
    },
    agriculture: {
        name: 'Agriculture (TNAU)',
        formula: 'Biology + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200,
        inputs: [
            { name: 'biology', label: 'Biology Marks', max: 100 },
            { name: 'physics', label: 'Physics Marks', max: 100 },
            { name: 'chemistry', label: 'Chemistry Marks', max: 100 }
        ],
        calculate: (marks) => marks.biology + (marks.physics / 2) + (marks.chemistry / 2)
    },
    pharmacy: {
        name: 'Paramedical (B.Pharm, B.Sc Nursing)',
        formula: 'Biology + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200,
        inputs: [
            { name: 'biology', label: 'Biology Marks', max: 100 },
            { name: 'physics', label: 'Physics Marks', max: 100 },
            { name: 'chemistry', label: 'Chemistry Marks', max: 100 }
        ],
        calculate: (marks) => marks.biology + (marks.physics / 2) + (marks.chemistry / 2)
    },
    nursing: {
        name: 'Nursing (B.Sc Nursing)',
        formula: 'Biology + (Physics / 2) + (Chemistry / 2)',
        maxCutoff: 200,
        inputs: [
            { name: 'biology', label: 'Biology Marks', max: 100 },
            { name: 'physics', label: 'Physics Marks', max: 100 },
            { name: 'chemistry', label: 'Chemistry Marks', max: 100 }
        ],
        calculate: (marks) => marks.biology + (marks.physics / 2) + (marks.chemistry / 2)
    },
    arts: {
        name: 'Arts & Science (B.A., B.Com, B.Sc)',
        formula: 'Subject 1 + Subject 2 + Subject 3 + Subject 4',
        maxCutoff: 400,
        inputs: [
            { name: 'subject1', label: 'Subject 1 Marks', max: 100 },
            { name: 'subject2', label: 'Subject 2 Marks', max: 100 },
            { name: 'subject3', label: 'Subject 3 Marks', max: 100 },
            { name: 'subject4', label: 'Subject 4 Marks', max: 100 }
        ],
        calculate: (marks) => marks.subject1 + marks.subject2 + marks.subject3 + marks.subject4
    }
};

const categoryMinimumCutoffs = {
    engineering: {
        'OC': 180,
        'BC': 160,
        'BCM': 155,
        'MBC': 150,
        'SC': 140,
        'ST': 130
    },
    medical: {
        'OC': 180,
        'BC': 160,
        'BCM': 155,
        'MBC': 150,
        'SC': 140,
        'ST': 130
    },
    agriculture: {
        'OC': 170,
        'BC': 150,
        'BCM': 145,
        'MBC': 140,
        'SC': 130,
        'ST': 120
    },
    pharmacy: {
        'OC': 170,
        'BC': 150,
        'BCM': 145,
        'MBC': 140,
        'SC': 130,
        'ST': 120
    },
    nursing: {
        'OC': 160,
        'BC': 140,
        'BCM': 135,
        'MBC': 130,
        'SC': 120,
        'ST': 110
    },
    arts: {
        'OC': 300,
        'BC': 260,
        'BCM': 250,
        'MBC': 240,
        'SC': 220,
        'ST': 200
    }
};

let collegeDatabase = {};

async function loadColleges() {
    try {
        const response = await fetch('collages.json');
        const data = await response.json();
        collegeDatabase = {};
        
        data.colleges.forEach(college => {
            let category = college.category.toLowerCase();
            
            if (category === 'engineering') category = 'engineering';
            else if (category === 'arts and science') category = 'arts';
            else if (category === 'agriculture') category = 'agriculture';
            else if (category === 'veterinary') category = 'agriculture';
            else if (category === 'polytechnic') category = 'engineering';
            
            if (!collegeDatabase[category]) {
                collegeDatabase[category] = [];
            }
            collegeDatabase[category].push({
                name: college.name,
                cutoffMin: college.cutoff_min,
                cutoffMax: college.cutoff_max
            });
        });
    } catch (error) {
        console.error('Error loading colleges:', error);
    }
}

let currentDegree = '';
let currentCutoff = 0;
let currentCategory = '';

document.addEventListener('DOMContentLoaded', async () => {
    await loadColleges();
    setupEventListeners();
});

function setupEventListeners() {
    const form = document.getElementById('cutoffForm');
    form.addEventListener('submit', handleCalculate);
}

function updateFormula() {
    const degree = document.getElementById('degree').value;
    const formulaBox = document.getElementById('formulaBox');
    const formulaText = document.getElementById('formulaText');
    const inputContainer = document.getElementById('inputContainer');
    const calculateBtn = document.getElementById('calculateBtn');

    if (!degree) {
        formulaBox.style.display = 'none';
        inputContainer.innerHTML = '';
        calculateBtn.disabled = true;
        updateStepIndicator(1);
        return;
    }

    currentDegree = degree;
    const degreeInfo = degreeFormulas[degree];

    formulaBox.style.display = 'block';
    formulaText.innerHTML = `<code>${degreeInfo.formula}</code><br><small>Maximum Cutoff: ${degreeInfo.maxCutoff}</small>`;

    inputContainer.innerHTML = '';
    degreeInfo.inputs.forEach(input => {
        const group = document.createElement('div');
        group.className = 'form-group';
        group.innerHTML = `
            <label for="${input.name}">
                ${input.label} <span style="color: #999;">(out of ${input.max})</span>
                ${input.optional ? '<span style="color: #999;">(Optional)</span>' : '<span style="color: red;">*</span>'}
            </label>
            <input type="number" id="${input.name}" name="${input.name}" 
                   min="0" max="${input.max}" placeholder="0" 
                   ${!input.optional ? 'required' : ''}>
        `;
        inputContainer.appendChild(group);
    });

    calculateBtn.disabled = false;
    updateStepIndicator(2);
}

function handleCalculate(e) {
    e.preventDefault();

    const degree = document.getElementById('degree').value;
    if (!degree) {
        showError('Please select a degree');
        return;
    }

    const degreeInfo = degreeFormulas[degree];
    const marks = {};
    let isValid = true;

    degreeInfo.inputs.forEach(input => {
        const value = parseInt(document.getElementById(input.name).value) || 0;

        if (!input.optional && value === 0) {
            showError(`Please enter ${input.label}`);
            isValid = false;
            return;
        }

        if (value < 0 || value > input.max) {
            showError(`${input.label} must be between 0 and ${input.max}`);
            isValid = false;
            return;
        }

        marks[input.name] = value;
    });

    if (!isValid) return;

    currentCutoff = Math.round(degreeInfo.calculate(marks) * 100) / 100;

    displayResults();
    updateStepIndicator(3);
}

function displayResults() {
    const resultSection = document.getElementById('resultSection');
    const cutoffScore = document.getElementById('cutoffScore');
    const formulaUsed = document.getElementById('formulaUsed');
    const degreeInfo = degreeFormulas[currentDegree];

    cutoffScore.textContent = currentCutoff.toFixed(2);
    formulaUsed.innerHTML = `
        <strong>Formula Used:</strong> ${degreeInfo.formula}<br>
        <strong>Your Score:</strong> ${currentCutoff.toFixed(2)} / ${degreeInfo.maxCutoff}
    `;

    const categoryGrid = document.getElementById('categoryGrid');
    categoryGrid.innerHTML = '';
    const categories = Object.keys(categoryMinimumCutoffs[currentDegree]);

    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.onclick = () => selectCategory(category);
        categoryGrid.appendChild(btn);
    });

    resultSection.classList.add('show');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectCategory(category) {
    currentCategory = category;

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    displayCategoryResults();
    updateStepIndicator(4);
}

function displayCategoryResults() {
    const minimumCutoff = categoryMinimumCutoffs[currentDegree][currentCategory];
    const isEligible = currentCutoff >= minimumCutoff;

    const cutoffTable = document.getElementById('cutoffTable');
    const cutoffTableBody = document.getElementById('cutoffTableBody');
    cutoffTable.style.display = 'table';
    cutoffTableBody.innerHTML = '';

    Object.entries(categoryMinimumCutoffs[currentDegree]).forEach(([cat, minCutoff]) => {
        const row = document.createElement('tr');
        const status = currentCutoff >= minCutoff ? '✓ Eligible' : '✗ Not Eligible';
        const statusColor = currentCutoff >= minCutoff ? '#28a745' : '#dc3545';
        row.innerHTML = `
            <td><strong>${cat}</strong></td>
            <td>${minCutoff}</td>
            <td style="color: ${statusColor}; font-weight: 600;">${status}</td>
        `;
        cutoffTableBody.appendChild(row);
    });

    const eligibilityMessage = document.getElementById('eligibilityMessage');
    eligibilityMessage.style.display = 'block';
    if (isEligible) {
        eligibilityMessage.className = 'eligibility-message eligible';
        eligibilityMessage.innerHTML = `
            <i class="fas fa-check-circle"></i> 
            Congratulations! You are eligible for ${currentCategory} category with a cutoff of ${currentCutoff.toFixed(2)}
        `;
    } else {
        eligibilityMessage.className = 'eligibility-message not-eligible';
        eligibilityMessage.innerHTML = `
            <i class="fas fa-times-circle"></i> 
            You need a minimum cutoff of ${minimumCutoff} for ${currentCategory} category. Your cutoff is ${currentCutoff.toFixed(2)}
        `;
    }

    displayEligibleColleges();
}

function displayEligibleColleges() {
    const collegesSection = document.getElementById('collegesSection');
    const collegeList = document.getElementById('collegeList');
    collegesSection.style.display = 'block';
    collegeList.innerHTML = '';

    const colleges = collegeDatabase[currentDegree] || [];
    const eligibleColleges = colleges.filter(college => 
        currentCutoff >= college.cutoffMin && currentCutoff <= college.cutoffMax
    );

    if (eligibleColleges.length === 0) {
        collegeList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No colleges found for your cutoff range</p>';
        return;
    }

    eligibleColleges.forEach(college => {
        const collegeItem = document.createElement('div');
        collegeItem.className = 'college-item';
        collegeItem.innerHTML = `
            <div class="college-name">${college.name}</div>
            <div class="college-info"><i class="fas fa-chart-line"></i> Cutoff: ${college.cutoffMin}-${college.cutoffMax}</div>
        `;
        collegeList.appendChild(collegeItem);
    });
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function resetForm() {
    document.getElementById('cutoffForm').reset();
    document.getElementById('formulaBox').style.display = 'none';
    document.getElementById('inputContainer').innerHTML = '';
    document.getElementById('resultSection').classList.remove('show');
    document.getElementById('calculateBtn').disabled = true;
    currentDegree = '';
    currentCutoff = 0;
    currentCategory = '';
    updateStepIndicator(1);
}

function updateStepIndicator(step) {
    for (let i = 1; i <= 4; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (i <= step) {
            stepElement.classList.add('active');
        } else {
            stepElement.classList.remove('active');
        }
    }
}
