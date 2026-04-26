let scatterChart;
let barChart;
let bottomBarChart;
let allDataPoints = [];
let countryCount;
let happiestCountry;

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
                    backgroundColor: 'rgba(75, 192, 192, 1)'
                }]
            },
            options: {
                scales: {
                    x: { 
                        title: { display: true, text: 'GDP per capita', color: '#fff' },
                        grid: { color: '#555' },
                        ticks: { color: '#fff' }
                    },
                    y: { 
                        title: { display: true, text: 'Happiness Score', color: '#fff' },
                        grid: { color: '#555' },
                        ticks: { color: '#fff' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => ctx.raw.label + ": Score " + ctx.raw.y
                        },
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        backgroundColor: '#333'
                    }
                }
            }
        });
    }

    loadBarChart();
    loadBottomBarChart();
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
                    backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgba(75, 192, 192, 1)',
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
                        ticks: { color: '#fff' }
                    },
                    y: {
                        grid: { color: '#555' },
                        ticks: { color: '#fff' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    },
                    tooltip: {
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        backgroundColor: '#333'
                    }
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
                    backgroundColor: 'rgba(255, 99, 132, 0.8)',
                    borderColor: 'rgba(255, 99, 132, 1)',
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
                        ticks: { color: '#fff' }
                    },
                    y: {
                        grid: { color: '#555' },
                        ticks: { color: '#fff' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    },
                    tooltip: {
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        backgroundColor: '#333'
                    }
                }
            }
        });
    }
}

document.getElementById('yearSelect').addEventListener('change', e => {
    loadChart(e.target.value);
});

document.getElementById('countrySearch').addEventListener('input', filterData);

loadChart();