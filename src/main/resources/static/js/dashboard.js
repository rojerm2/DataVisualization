let scatterChart;
let allDataPoints = [];
let countryCount;

async function loadChart(year = "2019"){
    const response = await fetch("/api/happiness-data?year=" + year);
    const rawData = await response.json();

    allDataPoints = rawData.map(item => ({
        x: item.gdp,
        y: item.score,
        label: item.country
    }));

    countryCount = allDataPoints.length;

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

    document.getElementById('yearSelect').addEventListener('change', e => {
        loadChart(e.target.value);
    })

    document.getElementById('countrySearch').addEventListener('input', filterData);
    document.getElementById('countryCountId').innerText = countryCount;
}

function filterData(event){
    const searchTerm = event.target.value.toLowerCase();

    const filteredData = allDataPoints.filter(point =>
        point.label.toLowerCase().includes(searchTerm));

    scatterChart.data.datasets[0].data = filteredData;
    scatterChart.update();
}

loadChart();