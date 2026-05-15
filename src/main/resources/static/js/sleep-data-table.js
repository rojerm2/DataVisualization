let sleepData = [];
let currentPage = 1;
let pageSize = 10;
let sortColumn = null;
let sortDirection = 'asc';
let searchQuery = '';
let isInitialized = false;

async function loadSleepData() {
    try {
        const response = await fetch('/api/sleep-data-all');
        sleepData = await response.json();
        currentPage = 1;
        searchQuery = '';
        document.getElementById('searchInput').value = '';

        if (!isInitialized) {
            setupPagination();
            setupSort();
            setupSearch();
            isInitialized = true;
        }

        renderPage();
    } catch (error) {
        console.error('Error fetching sleep data:', error);
    }
}

function getFilteredData() {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sleepData;

    return sleepData.filter(row =>
        Object.values(row).some(value =>
            String(value).toLowerCase().includes(query),
        ),
    );
}

function getSortedData() {
    const filtered = getFilteredData();
    if (!sortColumn) {
        return filtered;
    }

    return [...filtered].sort((a, b) => {
        let aValue = a[sortColumn];
        let bValue = b[sortColumn];
        const numericFields = [
            'personId',
            'age',
            'sleepDuration',
            'sleepQuality',
            'physicalActivity',
            'stressLevel',
            'heartRate',
            'dailySteps',
        ];

        if (numericFields.includes(sortColumn)) {
            aValue = parseFloat(aValue) || 0;
            bValue = parseFloat(bValue) || 0;
        } else {
            aValue = aValue ? String(aValue).toLowerCase() : '';
            bValue = bValue ? String(bValue).toLowerCase() : '';
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function renderPage() {
    const tableBody = document.querySelector('#sleepTable tbody');
    const start = (currentPage - 1) * pageSize;
    const pageRows = getSortedData().slice(start, start + pageSize);

    tableBody.innerHTML = pageRows
        .map(row => `
                <tr>
                    <td>${row.personId}</td>
                    <td>${row.gender}</td>
                    <td>${row.age}</td>
                    <td>${row.occupation}</td>
                    <td>${row.sleepDuration} hrs</td>
                    <td>${row.sleepQuality}/10</td>
                    <td>${row.physicalActivity}</td>
                    <td>${row.stressLevel}/10</td>
                    <td>${row.bmiCategory}</td>
                    <td>${row.bloodPressure}</td>
                    <td>${row.heartRate} bpm</td>
                    <td>${row.dailySteps}</td>
                    <td>
                        <span class="badge ${row.sleepDisorder ? 'badge-disorder' : 'badge-none'}">
                            ${row.sleepDisorder || 'None'}
                        </span>
                    </td>
                </tr>
            `)
        .join('');

    updatePagination();
}

function setupPagination() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageSizeSelect = document.getElementById('pageSize');

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage -= 1;
            renderPage();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < getPageCount()) {
            currentPage += 1;
            renderPage();
        }
    });

    pageSizeSelect.addEventListener('change', event => {
        pageSize = Number(event.target.value);
        currentPage = 1;
        renderPage();
    });
}

function setupSort() {
    const headers = document.querySelectorAll('th.sortable');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const key = header.dataset.key;
            if (sortColumn === key) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = key;
                sortDirection = 'asc';
            }
            currentPage = 1;
            updateSortHeaders();
            renderPage();
        });
    });
    updateSortHeaders();
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', event => {
        searchQuery = event.target.value || '';
        currentPage = 1;
        renderPage();
    });
}

function updateSortHeaders() {
    document.querySelectorAll('th.sortable').forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        if (header.dataset.key === sortColumn) {
            header.classList.add(sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    });
}

function getPageCount() {
    return Math.max(1, Math.ceil(getFilteredData().length / pageSize));
}

function updatePagination() {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const paginationSummary = document.getElementById('paginationSummary');
    const totalRecords = getFilteredData().length;

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === getPageCount();
    paginationSummary.textContent = `Page ${currentPage} of ${getPageCount()} (${totalRecords} records)`;
}

function exportTable() {
    const filtered = getFilteredData();
    if (!filtered.length) {
        return;
    }

    const headers = [
        'ID',
        'Gender',
        'Age',
        'Occupation',
        'Sleep Duration',
        'Quality',
        'Activity Level',
        'Stress Level',
        'BMI Category',
        'Blood Pressure',
        'Heart Rate',
        'Daily Steps',
        'Sleep Disorder',
    ];

    const rows = filtered.map(row => [
        row.personId,
        row.gender,
        row.age,
        row.occupation,
        `${row.sleepDuration} hrs`,
        `${row.sleepQuality}/10`,
        row.physicalActivity,
        `${row.stressLevel}/10`,
        row.bmiCategory,
        row.bloodPressure,
        `${row.heartRate} bpm`,
        row.dailySteps,
        row.sleepDisorder || 'None',
    ]);

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

}

window.addEventListener('DOMContentLoaded', loadSleepData);