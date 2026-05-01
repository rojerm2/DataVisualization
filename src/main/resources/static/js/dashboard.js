let scatterChart;
let barChart;
let bottomBarChart;
let distributionChart;
let gdpDistChart;
let quartileChart;
let radarChart;
let allCountriesChart;
let allDataPoints = [];
let countryCount;
let happiestCountry;

// Color palette
const colors = {
    teal: 'rgba(75, 192, 192, 1)',
    tealLight: 'rgba(75, 192, 192, 0.8)',
    red: 'rgba(255, 99, 132, 1)',
    redLight: 'rgba(255, 99, 132, 0.8)',
    blue: 'rgba(54, 162, 235, 1)',
    blueLight: 'rgba(54, 162, 235, 0.8)',
    orange: 'rgba(255, 159, 64, 1)',
    orangeLight: 'rgba(255, 159, 64, 0.8)',
    green: 'rgba(75, 192, 75, 1)',
    greenLight: 'rgba(75, 192, 75, 0.8)',
    purple: 'rgba(153, 102, 255, 1)',
    purpleLight: 'rgba(153, 102, 255, 0.8)'
};

function updateStatistics(){
    if(allDataPoints.length === 0) return;
    
    const scores = allDataPoints.map(p => p.y);
    const avgScore = (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(2);
    const minScore = Math.min(...scores).toFixed(2);
    const maxScore = Math.max(...scores).toFixed(2);
    
    document.getElementById('avgScoreId').innerText = avgScore;
    document.getElementById('rangeId').innerText = `${minScore} - ${maxScore}`;
}

async function loadChart(year = "2019"){
    const response = await fetch("/api/happiness-data?year=" + year);
    const rawData = await response.json();

    allDataPoints = rawData.map(item => ({
        x: item.gdp,
        y: item.score,
        label: item.country
    }));

    countryCount = allDataPoints.length;
    document.getElementById('countryCountId').innerText = countryCount;
    updateStatistics();

    // Main scatter chart
    if(scatterChart){
        scatterChart.data.datasets[0].data = allDataPoints;
        scatterChart.update();
    } else{
        const ctx = document.getElementById('happinessChart').getContext('2d');
        scatterChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Countries',
                    data: allDataPoints,
                    backgroundColor: colors.teal,
                    borderColor: colors.teal
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { 
                        title: { display: true, text: 'GDP per capita', color: '#fff', font: {size: 14} },
                        grid: { color: '#555' },
                        ticks: { color: '#fff' }
                    },
                    y: { 
                        title: { display: true, text: 'Happiness Score (0-10)', color: '#fff', font: {size: 14} },
                        grid: { color: '#555' },
                        ticks: { color: '#fff' },
                        min: 0,
                        max: 10
                    }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => `${ctx.raw.label}: ${ctx.raw.y.toFixed(2)} (GDP: ${ctx.raw.x.toFixed(2)})`
                        },
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        backgroundColor: '#333'
                    }
                }
            }
        });
    }

    loadDistributionChart();
    loadGdpDistributionChart();
    loadBarChart();
    loadBottomBarChart();
    loadQuartileChart();
    loadRadarChart();
    loadAllCountriesChart();
}

function loadDistributionChart(){
    const scores = allDataPoints.map(p => p.y).sort((a,b) => a-b);
    const bins = {};
    
    scores.forEach(score => {
        const bin = (Math.floor(score * 2) / 2).toFixed(1);
        bins[bin] = (bins[bin] || 0) + 1;
    });

    const binKeys = Object.keys(bins).sort((a,b) => parseFloat(a) - parseFloat(b));
    const binValues = binKeys.map(k => bins[k]);

    if(distributionChart){
        distributionChart.data.labels = binKeys;
        distributionChart.data.datasets[0].data = binValues;
        distributionChart.update();
    } else {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        distributionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: binKeys,
                datasets: [{
                    label: 'Number of Countries',
                    data: binValues,
                    backgroundColor: colors.blueLight,
                    borderColor: colors.blue,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: '#555' }, ticks: { color: '#fff' } },
                    x: { grid: { color: '#555' }, ticks: { color: '#fff' } }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: { titleColor: '#fff', bodyColor: '#fff', backgroundColor: '#333' }
                }
            }
        });
    }
}

function loadGdpDistributionChart(){
    const gdps = allDataPoints.map(p => p.x).sort((a,b) => a-b);
    const bins = {};
    const minGdp = Math.min(...gdps);
    const maxGdp = Math.max(...gdps);
    const step = (maxGdp - minGdp) / 10;

    gdps.forEach(gdp => {
        const bin = Math.floor((gdp - minGdp) / step);
        const binLabel = (minGdp + bin * step).toFixed(1);
        bins[binLabel] = (bins[binLabel] || 0) + 1;
    });

    const binKeys = Object.keys(bins).sort((a,b) => parseFloat(a) - parseFloat(b));
    const binValues = binKeys.map(k => bins[k]);

    if(gdpDistChart){
        gdpDistChart.data.labels = binKeys;
        gdpDistChart.data.datasets[0].data = binValues;
        gdpDistChart.update();
    } else {
        const ctx = document.getElementById('gdpDistChart').getContext('2d');
        gdpDistChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: binKeys,
                datasets: [{
                    label: 'Number of Countries',
                    data: binValues,
                    backgroundColor: colors.greenLight,
                    borderColor: colors.green,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { grid: { color: '#555' }, ticks: { color: '#fff' } },
                    x: { grid: { color: '#555' }, ticks: { color: '#fff' } }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: { titleColor: '#fff', bodyColor: '#fff', backgroundColor: '#333' }
                }
            }
        });
    }
}

function loadQuartileChart(){
    const scores = allDataPoints.map(p => p.y).sort((a,b) => a-b);
    const q1 = scores[Math.floor(scores.length * 0.25)];
    const q2 = scores[Math.floor(scores.length * 0.5)];
    const q3 = scores[Math.floor(scores.length * 0.75)];
    
    const q1Count = scores.filter(s => s <= q1).length;
    const q2Count = scores.filter(s => s > q1 && s <= q2).length;
    const q3Count = scores.filter(s => s > q2 && s <= q3).length;
    const q4Count = scores.filter(s => s > q3).length;

    if(quartileChart){
        quartileChart.data.datasets[0].data = [q1Count, q2Count, q3Count, q4Count];
        quartileChart.update();
    } else {
        const ctx = document.getElementById('quartileChart').getContext('2d');
        quartileChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [`Q1 (≤${q1.toFixed(2)})`, `Q2 (${q1.toFixed(2)}-${q2.toFixed(2)})`, `Q3 (${q2.toFixed(2)}-${q3.toFixed(2)})`, `Q4 (>${q3.toFixed(2)})`],
                datasets: [{
                    data: [q1Count, q2Count, q3Count, q4Count],
                    backgroundColor: [colors.red, colors.orange, colors.blueLight, colors.teal],
                    borderColor: ['#333', '#333', '#333', '#333'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: { titleColor: '#fff', bodyColor: '#fff', backgroundColor: '#333' }
                }
            }
        });
    }
}

function loadRadarChart(){
    const top10 = [...allDataPoints].sort((a, b) => b.y - a.y).slice(0, 10);
    const labels = top10.map(item => item.label.substring(0, 8));
    const scores = top10.map(item => item.y);

    if(radarChart){
        radarChart.data.labels = labels;
        radarChart.data.datasets[0].data = scores;
        radarChart.update();
    } else {
        const ctx = document.getElementById('top10RadarChart').getContext('2d');
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Happiness Score',
                    data: scores,
                    borderColor: colors.teal,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    pointBackgroundColor: colors.teal,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: colors.teal
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        grid: { color: '#555' },
                        ticks: { color: '#fff' },
                        min: 0,
                        max: 10
                    }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: { titleColor: '#fff', bodyColor: '#fff', backgroundColor: '#333' }
                }
            }
        });
    }
}

function loadAllCountriesChart(){
    const sorted = [...allDataPoints].sort((a, b) => b.y - a.y);
    const labels = sorted.map(item => item.label);
    const scores = sorted.map(item => item.y);
    
    const bgColor = scores.map(score => {
        if(score >= 7.5) return colors.greenLight;
        if(score >= 6.5) return colors.blueLight;
        if(score >= 5.5) return colors.orangeLight;
        return colors.redLight;
    });

    if(allCountriesChart){
        allCountriesChart.data.labels = labels;
        allCountriesChart.data.datasets[0].data = scores;
        allCountriesChart.data.datasets[0].backgroundColor = bgColor;
        allCountriesChart.update();
    } else {
        const ctx = document.getElementById('allCountriesChart').getContext('2d');
        allCountriesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Happiness Score',
                    data: scores,
                    backgroundColor: bgColor,
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { color: '#555' },
                        ticks: { color: '#fff' },
                        min: 0,
                        max: 10
                    },
                    y: { 
                        grid: { color: '#555' },
                        ticks: { color: '#fff', font: {size: 10} }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { titleColor: '#fff', bodyColor: '#fff', backgroundColor: '#333' }
                }
            }
        });
    }
}

function filterData(event){
    const searchTerm = event.target.value.toLowerCase();
    const filteredData = allDataPoints.filter(point =>
        point.label.toLowerCase().includes(searchTerm));
    scatterChart.data.datasets[0].data = filteredData;
    scatterChart.update();
}

function loadBarChart(){
    const top15 = [...allDataPoints]
        .sort((a, b) => b.y - a.y)
        .slice(0, 15);

    const labels = top15.map(item => item.label);
    const scores = top15.map(item => item.y);

    happiestCountry = top15[0]?.label || '';

    if(barChart){
        barChart.data.labels = labels;
        barChart.data.datasets[0].data = scores;
        barChart.update();
    } else{
        const ctx = document.getElementById('barChart').getContext('2d');
        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Happiness Score',
                    data: scores,
                    backgroundColor: colors.tealLight,
                    borderColor: colors.teal,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Happiness Score', color: '#fff' },
                        grid: { color: '#555' },
                        ticks: { color: '#fff' },
                        min: 0,
                        max: 10
                    },
                    y: {
                        grid: { color: '#555' },
                        ticks: { color: '#fff' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: { titleColor: '#fff', bodyColor: '#fff', backgroundColor: '#333' }
                }
            }
        });
    }

    document.getElementById('happiestCountryId').innerText = happiestCountry;
}

function loadBottomBarChart(){
    const bottom15 = [...allDataPoints]
        .sort((a, b) => a.y - b.y)
        .slice(0, 15);

    const labels = bottom15.map(item => item.label);
    const scores = bottom15.map(item => item.y);

    if(bottomBarChart){
        bottomBarChart.data.labels = labels;
        bottomBarChart.data.datasets[0].data = scores;
        bottomBarChart.update();
    } else{
        const ctx = document.getElementById('bottomBarChart').getContext('2d');
        bottomBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Happiness Score',
                    data: scores,
                    backgroundColor: colors.redLight,
                    borderColor: colors.red,
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: { display: true, text: 'Happiness Score', color: '#fff' },
                        grid: { color: '#555' },
                        ticks: { color: '#fff' },
                        min: 0,
                        max: 10
                    },
                    y: {
                        grid: { color: '#555' },
                        ticks: { color: '#fff' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#fff' } },
                    tooltip: { titleColor: '#fff', bodyColor: '#fff', backgroundColor: '#333' }
                }
            }
        });
    }
}

document.getElementById('yearSelect').addEventListener('change', e => {
    loadChart(e.target.value);
});

document.getElementById('countrySearch').addEventListener('input', filterData);

// Load initial data
loadChart('2019');

loadChart();