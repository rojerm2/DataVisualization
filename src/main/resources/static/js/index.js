// Configuration & Colors
const BLUE = "#4e73df",
  ORANGE = "#f6c23e",
  GREEN = "#1cc88a",
  RED = "#e74a3b",
  PINK = "#d4537e";

if (typeof ChartDataLabels !== 'undefined') {
  Chart.register(ChartDataLabels);
  Chart.defaults.plugins.datalabels = {
    display: false,
    color: "#fff",
    formatter: (value) => value,
    anchor: "center",
    align: "center",
    font: { weight: "600", size: 12 },
  };
}

// Linear regression calculation
function calculateLinearRegression(data) {
  if (data.length < 2) return null;
  const n = data.length;
  const sumX = data.reduce((a, p) => a + p.x, 0);
  const sumY = data.reduce((a, p) => a + p.y, 0);
  const sumXY = data.reduce((a, p) => a + (p.x * p.y), 0);
  const sumXX = data.reduce((a, p) => a + (p.x * p.x), 0);
  
  const denominator = n * sumXX - sumX * sumX;
  if (Math.abs(denominator) < 1e-10) return null;
  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

// Generate trendline data points
function getTrendlineData(data, regression) {
  if (!regression || data.length === 0) return [];
  const xValues = data.map(p => p.x).sort((a, b) => a - b);
  const minX = xValues[0];
  const maxX = xValues[xValues.length - 1];
  
  return [
    { x: minX, y: regression.slope * minX + regression.intercept },
    { x: maxX, y: regression.slope * maxX + regression.intercept }
  ];
}

async function initDashboard() {
  try {
    // Show loading overlay
    showLoading();

    // Update date and time
    updateDateTime();

    // 1. Fetch from your Spring Boot API
    const response = await fetch("/api/sleep-data-all");
    const apiData = await response.json();

    // 2. Map API data to the format used by the charts
    const rows = apiData.map((item) => ({
      gender: item.gender,
      age: item.age,
      occupation: item.occupation,
      sleepDur: item.sleepDuration,
      sleepQual: item.sleepQuality,
      activity: item.physicalActivity,
      stress: item.stressLevel,
      bmi: item.bmiCategory,
      bloodPressure: item.bloodPressure,
      heartRate: item.heartRate,
      steps: item.dailySteps,
      disorder: item.sleepDisorder || "None",
    }));

    // Generate insights
    generateInsights(rows);

    // Render metrics with animations
    renderMetrics(rows);

    // Render charts
    renderCharts(rows);

    // Hide loading overlay
    hideLoading();

    // Update last updated time
    updateLastUpdated();

  } catch (err) {
    console.error("Dashboard failed to load:", err);
    hideLoading();
  }
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
function groupBy(arr, key) {
  return arr.reduce((m, r) => {
    (m[r[key]] = m[r[key]] || []).push(r);
    return m;
  }, {});
}

function parseBloodPressure(bp) {
  if (!bp || typeof bp !== "string") return null;
  const parts = bp.split("/").map((value) => parseInt(value, 10));
  if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) return null;
  return { systolic: parts[0], diastolic: parts[1] };
}

function renderMetrics(rows) {
  const totalParticipants = rows.length;
  const avgSleep = avg(rows.map((r) => r.sleepDur));
  const avgQuality = avg(rows.map((r) => r.sleepQual));
  const disorderPercentage = ((rows.filter((r) => r.disorder !== "None").length / rows.length) * 100);

  // Animated counters
  animateCounter("stat-total", 0, totalParticipants, 1000);
  animateCounter("stat-avg-sleep", 0, avgSleep, 1000, "h", 1);
  animateCounter("stat-avg-quality", 0, avgQuality, 1000, " / 10", 1);
  animateCounter("stat-disorder", 0, disorderPercentage, 1000, "%", 1);

  // Progress bars
  setTimeout(() => {
    setProgressBar("total-progress", 100); // Always 100% for total
    setProgressBar("sleep-progress", (avgSleep / 12) * 100); // Assuming 12 hours max
    setProgressBar("quality-progress", (avgQuality / 10) * 100); // Out of 10
    setProgressBar("disorder-progress", disorderPercentage);
  }, 500);
}

function renderCharts(rows) {
  // C1: Sleep Duration Histogram
  const bins = {};
  rows.forEach((r) => {
    const b = Math.floor(r.sleepDur);
    bins[b] = (bins[b] || 0) + 1;
  });
  const binKeys = Object.keys(bins).sort((a, b) => +a - +b);

  new Chart(document.getElementById("c1"), {
    type: "bar",
    data: {
      labels: binKeys.map((k) => k + "h"),
      datasets: [
        {
          label: "Count",
          data: binKeys.map((k) => bins[k]),
          backgroundColor: BLUE,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
        x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
      },
    },
  });

  // C2: Sleep Quality Histogram
  const qualBins = {};
  rows.forEach((r) => {
    const b = Math.floor(r.sleepQual);
    qualBins[b] = (qualBins[b] || 0) + 1;
  });
  const qualBinKeys = Object.keys(qualBins).sort((a, b) => +a - +b);

  new Chart(document.getElementById("c2"), {
    type: "bar",
    data: {
      labels: qualBinKeys.map((k) => k + "/10"),
      datasets: [
        {
          label: "Count",
          data: qualBinKeys.map((k) => qualBins[k]),
          backgroundColor: ORANGE,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
        x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
      },
    },
  });

  // C3: Disorder Doughnut
  const disCounts = groupBy(rows, "disorder");
  new Chart(document.getElementById("c3"), {
    type: "doughnut",
    data: {
      labels: Object.keys(disCounts),
      datasets: [
        {
          data: Object.keys(disCounts).map((k) => disCounts[k].length),
          backgroundColor: [BLUE, ORANGE, GREEN, RED, PINK],
        },
      ],
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: { labels: { color: "#a1a1a8" } },
        datalabels: {
          display: true,
          color: "#fff",
          formatter: (value) => value,
          anchor: "center",
          align: "center",
          font: { weight: "600", size: 12 },
        },
      },
    },
  });

  // C4: Gender Pie
  const genCounts = groupBy(rows, "gender");
  new Chart(document.getElementById("c4"), {
    type: "pie",
    data: {
      labels: ["Male", "Female"],
      datasets: [
        {
          data: [genCounts.Male?.length || 0, genCounts.Female?.length || 0],
          backgroundColor: [BLUE, PINK],
        },
      ],
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#a1a1a8" } },
        datalabels: {
          display: true,
          color: "#fff",
          formatter: (value) => value,
          anchor: "center",
          align: "center",
          font: { weight: "600", size: 12 },
        },
      },
    },
  });

  // C5: BMI Category
  const bmiCounts = groupBy(rows, "bmi");
  new Chart(document.getElementById("c5"), {
    type: "pie",
    data: {
      labels: Object.keys(bmiCounts),
      datasets: [
        {
          data: Object.keys(bmiCounts).map((k) => bmiCounts[k].length),
          backgroundColor: [BLUE, ORANGE, GREEN, RED, PINK],
        },
      ],
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: "#a1a1a8" } },
        datalabels: {
          display: true,
          color: "#fff",
          formatter: (value) => value,
          anchor: "center",
          align: "center",
          font: { weight: "600", size: 12 },
        },
      },
    },
  });

  // C6: Occupation Bar (Horizontal)
  const byOcc = groupBy(rows, "occupation");
  const occLabels = Object.keys(byOcc).sort();
  new Chart(document.getElementById("c6"), {
    type: "bar",
    data: {
      labels: occLabels,
      datasets: [
        {
          label: "Avg Hours",
          data: occLabels.map((o) =>
            avg(byOcc[o].map((r) => r.sleepDur)).toFixed(2),
          ),
          backgroundColor: BLUE,
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" }, min: 5, max: 9 },
        y: { ticks: { color: "#a1a1a8" }, },
      },
      plugins: { legend: { labels: { color: "#a1a1a8" } } },
    },
  });

  // C7: Heart Rate Distribution
  // const hrBins = {};
  // rows.forEach((r) => {
  //   const b = Math.floor(r.heartRate / 10) * 10;
  //   hrBins[b] = (hrBins[b] || 0) + 1;
  // });
  // const hrKeys = Object.keys(hrBins).sort((a, b) => +a - +b);

  // new Chart(document.getElementById("c7"), {
  //   type: "bar",
  //   data: {
  //     labels: hrKeys.map((k) => k + "-" + (parseInt(k) + 9)),
  //     datasets: [
  //       {
  //         label: "Count",
  //         data: hrKeys.map((k) => hrBins[k]),
  //         backgroundColor: RED,
  //         borderRadius: 4,
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: { legend: { display: false } },
  //     scales: {
  //       y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //       x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //     },
  //   },
  // });

  // C8: Age Distribution
  const ageBins = {};
  rows.forEach((r) => {
    const b = Math.floor(r.age / 5) * 5;
    ageBins[b] = (ageBins[b] || 0) + 1;
  });
  const ageKeys = Object.keys(ageBins).sort((a, b) => +a - +b);

  // new Chart(document.getElementById("c8"), {
  //   type: "bar",
  //   data: {
  //     labels: ageKeys.map((k) => k + "-" + (parseInt(k) + 4)),
  //     datasets: [
  //       {
  //         label: "Count",
  //         data: ageKeys.map((k) => ageBins[k]),
  //         backgroundColor: GREEN,
  //         borderRadius: 4,
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: { legend: { display: false } },
  //     scales: {
  //       y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //       x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //     },
  //   },
  // });

  // C9: Physical Activity Level (binned)
  // const actCounts = {};
  // rows.forEach((r) => {
  //   const value = r.activity;
  //   const bucket =
  //     value <= 40 ? "Low (â‰¤40)" : value <= 65 ? "Medium (41-65)" : "High (â‰¥66)";
  //   actCounts[bucket] = (actCounts[bucket] || 0) + 1;
  // });
  // const actLabels = ["Low (â‰¤40)", "Medium (41-65)", "High (â‰¥66)"];
  // new Chart(document.getElementById("c9"), {
  //   type: "bar",
  //   data: {
  //     labels: actLabels,
  //     datasets: [
  //       {
  //         label: "Count",
  //         data: actLabels.map((label) => actCounts[label] || 0),
  //         backgroundColor: PINK,
  //         borderRadius: 4,
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: { legend: { display: false } },
  //     scales: {
  //       y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //       x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //     },
  //   },
  // });

  // C10: Stress Level Distribution
  // const stressBins = {};
  // rows.forEach((r) => {
  //   stressBins[r.stress] = (stressBins[r.stress] || 0) + 1;
  // });
  // const stressKeys = Object.keys(stressBins).sort((a, b) => +a - +b);

  // new Chart(document.getElementById("c10"), {
  //   type: "bar",
  //   data: {
  //     labels: stressKeys.map((k) => k + "/10"),
  //     datasets: [
  //       {
  //         label: "Count",
  //         data: stressKeys.map((k) => stressBins[k]),
  //         backgroundColor: ORANGE,
  //         borderRadius: 4,
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: { legend: { display: false } },
  //     scales: {
  //       y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //       x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //     },
  //   },
  // });

  // C11: Daily Steps Distribution
  const stepsBins = {};
  rows.forEach((r) => {
    const b = Math.floor(r.steps / 2000) * 2000;
    stepsBins[b] = (stepsBins[b] || 0) + 1;
  });
  const stepsKeys = Object.keys(stepsBins).sort((a, b) => +a - +b);

  new Chart(document.getElementById("c11"), {
    type: "bar",
    data: {
      labels: stepsKeys.map(
        (k) => parseInt(k) / 1000 + "k-" + (parseInt(k) + 1999),
      ),
      datasets: [
        {
          label: "Count",
          data: stepsKeys.map((k) => stepsBins[k]),
          backgroundColor: GREEN,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
        x: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
      },
    },
  });

  // C12: Stress vs Sleep Duration Scatter
  const c12Data = rows.map((r) => ({ x: r.stress, y: r.sleepDur }));
  const c12Regression = calculateLinearRegression(c12Data);
  const c12Trendline = getTrendlineData(c12Data, c12Regression);
  
  new Chart(document.getElementById("c12"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Stress vs Sleep Duration",
          data: c12Data,
          backgroundColor: BLUE,
          borderColor: BLUE,
          showLine: false,
          fill: false,
        },
        {
          label: "Trend Line",
          type: "line",
          data: c12Trendline,
          borderColor: RED,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Stress Level (1-10)",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
        },
        y: {
          title: {
            display: true,
            text: "Sleep Duration (hours)",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
        },
      },
      plugins: { legend: { labels: { color: "#a1a1a8" } } },
    },
  });

  // C13: Activity vs Sleep Quality Scatter
  const c13Data = rows.map((r) => ({
    x: r.activity,
    y: r.sleepQual,
    label: `${r.activity} activity`,
  }));
  const c13Regression = calculateLinearRegression(c13Data);
  const c13Trendline = getTrendlineData(c13Data, c13Regression);
  
  new Chart(document.getElementById("c13"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Activity vs Sleep Quality",
          data: c13Data,
          backgroundColor: GREEN,
          borderColor: GREEN,
          showLine: false,
          fill: false,
        },
        {
          label: "Trend Line",
          type: "line",
          data: c13Trendline,
          borderColor: ORANGE,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Physical Activity Level (Minutes per day)",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
          suggestedMin: 20,
          suggestedMax: 100,
        },
        y: {
          title: {
            display: true,
            text: "Sleep Quality (1-10)",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
          suggestedMin: 3,
          suggestedMax: 10,
        },
      },
      plugins: {
        legend: { labels: { color: "#a1a1a8" } },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return (
                "Activity: " +
                ctx.raw.x.toFixed(0) +
                ", Score: " +
                ctx.raw.y.toFixed(1)
              );
            },
          },
          titleColor: "#a1a1a8",
          bodyColor: "#fff",
          backgroundColor: "#333",
        },
      },
    },
  });

  // C16: Average Quality per Stress Level
  const stressLevels = [3, 4, 5, 6, 7, 8];
  const averageQuality = stressLevels.map((level) => {
    const values = rows
      .filter((r) => Number(r.stress) === level)
      .map((r) => Number(r.sleepQual));
    return values.length ? avg(values).toFixed(2) : null;
  });

  new Chart(document.getElementById("c16"), {
    type: "line",
    data: {
      labels: stressLevels.map((level) => level.toString()),
      datasets: [
        {
          label: "Avg Sleep Quality",
          data: averageQuality,
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          borderColor: ORANGE,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: ORANGE,
          pointBorderColor: "#ffffff",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Stress Level (1-10)",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
        },
        y: {
          title: { display: true, text: "Avg Sleep Quality", color: "#a1a1a8" },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
          suggestedMin: 5,
          suggestedMax: 10,
        },
      },
      plugins: {
        legend: { labels: { color: "#a1a1a8" } },
        tooltip: {
          callbacks: {
            label: function (context) {
              return "Avg Quality: " + context.parsed.y.toFixed(2);
            },
          },
          titleColor: "#a1a1a8",
          bodyColor: "#fff",
          backgroundColor: "#333",
        },
      },
    },
  });

  // C17: Blood Pressure vs Sleep Apnea
  const apneaRows = rows.filter((r) =>
    r.disorder && r.disorder.toLowerCase().includes("apnea"),
  );
  const nonApneaRows = rows.filter(
    (r) => !r.disorder || !r.disorder.toLowerCase().includes("apnea"),
  );

  const apneaBpValues = apneaRows
    .map((r) => parseBloodPressure(r.bloodPressure))
    .filter(Boolean);
  const nonApneaBpValues = nonApneaRows
    .map((r) => parseBloodPressure(r.bloodPressure))
    .filter(Boolean);

  const avgApneaSystolic = avg(apneaBpValues.map((bp) => bp.systolic)).toFixed(1);
  const avgApneaDiastolic = avg(apneaBpValues.map((bp) => bp.diastolic)).toFixed(1);
  const avgNonApneaSystolic = avg(nonApneaBpValues.map((bp) => bp.systolic)).toFixed(1);
  const avgNonApneaDiastolic = avg(nonApneaBpValues.map((bp) => bp.diastolic)).toFixed(1);

    const bpGroups = [
    {
      label: "Sleep Apnea",
      color: ORANGE,
      filter: (r) => r.disorder && r.disorder.toLowerCase().includes("apnea"),
    },
    {
      label: "Insomnia",
      color: GREEN,
      filter: (r) => r.disorder && r.disorder.toLowerCase().includes("insomnia"),
    },
    {
      label: "None",
      color: BLUE,
      filter: (r) => !r.disorder || r.disorder.toLowerCase() === "none",
    },
  ];

  const bpDatasets = bpGroups.flatMap((group) => {
    const points = rows
      .filter(group.filter)
      .map((r) => ({
        bp: parseBloodPressure(r.bloodPressure),
        disorder: r.disorder,
      }))
      .filter((item) => item.bp)
      .map((item) => ({
        x: item.bp.systolic,
        y: item.bp.diastolic,
        label: item.disorder,
      }));

    const regression = calculateLinearRegression(points);
    const trendline = getTrendlineData(points, regression);

    const scatterDataset = {
      label: group.label,
      data: points,
      backgroundColor: group.color,
      borderColor: group.color,
      pointRadius: 6,
      pointHoverRadius: 8,
      showLine: false,
    };

    const lineDataset = {
      label: `${group.label} Trend`,
      type: "line",
      data: trendline,
      borderColor: group.color,
      backgroundColor: "transparent",
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false,
      tension: 0,
      spanGaps: true,
      hidden: points.length < 2,
    };

    return [scatterDataset, lineDataset];
  });

  new Chart(document.getElementById("c17"), {
    type: "scatter",
    data: { datasets: bpDatasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: "Systolic BP (mmHg)",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
          min: 100,
          max: 160,
        },
        y: {
          title: {
            display: true,
            text: "Diastolic BP (mmHg)",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
          min: 65,
          max: 105,
        },
      },
      plugins: {
        legend: { labels: { color: "#a1a1a8" } },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.x}/${context.parsed.y} mmHg`;
            },
          },
          titleColor: "#a1a1a8",
          bodyColor: "#fff",
          backgroundColor: "#333",
        },
      },
    },
  });

  // Heatmap: Sleep Quality by Stress Level & Activity Level
  renderHeatmap(rows);
  // C14: Sleep Disorders by Age Group
  const ageGroups = { "20-30": [], "31-40": [], "41-50": [], "50+": [] };
  rows.forEach((r) => {
    if (r.age <= 30) ageGroups["20-30"].push(r);
    else if (r.age <= 40) ageGroups["31-40"].push(r);
    else if (r.age <= 50) ageGroups["41-50"].push(r);
    else ageGroups["50+"].push(r);
  });

  const ageGroupDisorders = {};
  Object.keys(ageGroups).forEach((group) => {
    ageGroupDisorders[group] = groupBy(ageGroups[group], "disorder");
  });

  const disorderTypes = new Set();
  rows.forEach((r) => disorderTypes.add(r.disorder));
  const disorderArray = Array.from(disorderTypes);
  const colors = [BLUE, ORANGE, GREEN, RED, PINK];

  new Chart(document.getElementById("c14"), {
    type: "bar",
    data: {
      labels: Object.keys(ageGroups),
      datasets: disorderArray.map((disorder, idx) => ({
        label: disorder,
        data: Object.keys(ageGroups).map(
          (group) => ageGroupDisorders[group][disorder]?.length || 0,
        ),
        backgroundColor: colors[idx % colors.length],
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          stacked: false,
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
        },
        x: { stacked: false, ticks: { color: "#a1a1a8" } },
      },
      plugins: { legend: { labels: { color: "#a1a1a8" } } },
    },
  });

  // C15: Average Heart Rate by Disorder Type
  // const disorderHR = groupBy(rows, "disorder");
  // const disorderLabels = Object.keys(disorderHR);
  // const avgHRByDisorder = disorderLabels.map((d) =>
  //   avg(disorderHR[d].map((r) => r.heartRate)),
  // );

  // new Chart(document.getElementById("c15"), {
  //   type: "bar",
  //   data: {
  //     labels: disorderLabels,
  //     datasets: [
  //       {
  //         label: "Avg Heart Rate (bpm)",
  //         data: avgHRByDisorder,
  //         backgroundColor: [BLUE, ORANGE, GREEN, RED, PINK],
  //         borderRadius: 4,
  //       },
  //     ],
  //   },
  //   options: {
  //     responsive: true,
  //     maintainAspectRatio: false,
  //     plugins: { legend: { labels: { color: "#a1a1a8" } } },
  //     scales: {
  //       y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
  //       x: { ticks: { color: "#a1a1a8" } },
  //     },
  //   },
  // });
}

function renderHeatmap(rows) {
  const canvas = document.getElementById("heatmapCanvas");

  const fields = [
    { id: "age", label: "Age" },
    { id: "sleepDur", label: "Sleep Duration" },
    { id: "sleepQual", label: "Quality of Sleep" },
    { id: "activity", label: "Physical Activity" },
    { id: "stress", label: "Stress Level" },
    { id: "heartRate", label: "Heart Rate" },
    { id: "steps", label: "Daily Steps" },
  ];

  function getCorrelation(x, y) {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const num = n * sumXY - sumX * sumY;
    const den = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
    );
    return den === 0 ? 0 : num / den;
  }

  const matrixData = [];
  for (let i = 0; i < fields.length; i++) {
    for (let j = 0; j < fields.length; j++) {
      const xValues = rows.map((r) => Number(r[fields[j].id]) || 0);
      const yValues = rows.map((r) => Number(r[fields[i].id]) || 0);
      const corr = getCorrelation(xValues, yValues);
      matrixData.push({ x: fields[j].label, y: fields[i].label, v: corr });
    }
  }

  const heatmapColor = (value) => {
    const v = Math.max(-1, Math.min(1, value));
    const negative = [58, 123, 213];
    const neutral = [245, 245, 245];
    const positive = [235, 85, 64];

    const mix = (a, b, weight) =>
      a.map((component, index) =>
        Math.round(component + (b[index] - component) * weight),
      );

    const color = v >= 0 ? mix(neutral, positive, v) : mix(negative, neutral, 1 + v);
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  };

  if (window.heatmapChart) {
    window.heatmapChart.destroy();
  }

  window.heatmapChart = new Chart(canvas, {
    type: "matrix",
    data: {
      datasets: [
        {
          label: "Correlation",
          data: matrixData,
          backgroundColor: (ctx) => heatmapColor(ctx.dataset.data[ctx.dataIndex].v),
          borderColor: "#2d2d2d",
          borderWidth: 1,
          width: (ctx) => {
            const area = ctx.chart.chartArea;
            return area ? (area.right - area.left) / fields.length - 4 : 0;
          },
          height: (ctx) => {
            const area = ctx.chart.chartArea;
            return area ? (area.bottom - area.top) / fields.length - 4 : 0;
          },
        },
      ],
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        datalabels: {
          color: (ctx) =>
            Math.abs(ctx.dataset.data[ctx.dataIndex].v) > 0.3 ? "#ffffff" : "#111111",
          formatter: (ctx) => ctx.dataset.data[ctx.dataIndex].v.toFixed(2),
          anchor: "center",
          align: "center",
          font: { weight: "600", size: 12 },
        },
        tooltip: {
          callbacks: {
            title: (items) => `${items[0].raw.y} vs ${items[0].raw.x}`,
            label: (context) => `Correlation: ${context.raw.v.toFixed(2)}`,
          },
          titleColor: "#a1a1a8",
          bodyColor: "#fff",
          backgroundColor: "#333",
        },
      },
      scales: {
        x: {
          type: "category",
          labels: fields.map((field) => field.label),
          offset: true,
          ticks: { color: "#a1a1a8", maxRotation: 90, minRotation: 90 },
          grid: { color: "#3f3f46", display: false },
        },
        y: {
          type: "category",
          labels: fields.map((field) => field.label),
          offset: true,
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46", display: false },
          reverse: true,
        },
      },
    },
  });
}

initDashboard();

// ===== NEW UTILITY FUNCTIONS =====

// Animated counter function
function animateCounter(elementId, start, end, duration, suffix = "", decimals = 0) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const startTime = performance.now();
  const endValue = typeof end === 'number' ? end : parseFloat(end);

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function for smooth animation
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = start + (endValue - start) * easeOutQuart;

    element.textContent = currentValue.toFixed(decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Progress bar animation
function setProgressBar(elementId, percentage) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.style.setProperty('--progress-width', `${Math.min(100, Math.max(0, percentage))}%`);
}

// Date and time functions
function updateDateTime() {
  const now = new Date();
  const dateElement = document.getElementById('current-date');
  const timeElement = document.getElementById('last-updated');

  if (dateElement) {
    dateElement.textContent = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  if (timeElement) {
    timeElement.textContent = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

function updateLastUpdated() {
  updateDateTime();
}

// Loading overlay functions
function showLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

// Generate insights based on data analysis
function generateInsights(rows) {
  if (!rows || rows.length === 0) return;

  // Calculate key metrics
  const avgSleep = avg(rows.map(r => r.sleepDur));
  const avgQuality = avg(rows.map(r => r.sleepQual));
  const avgStress = avg(rows.map(r => r.stress));
  const avgActivity = avg(rows.map(r => r.activity));

  const disorderCount = rows.filter(r => r.disorder !== "None").length;
  const disorderPercentage = (disorderCount / rows.length) * 100;

  // Generate key finding
  let keyFinding = "Higher stress levels correlate with reduced sleep duration and quality";
  if (avgStress > 6) {
    keyFinding = "Participants report high stress levels, impacting sleep quality";
  } else if (avgActivity > 60) {
    keyFinding = "Active lifestyles correlate with better sleep quality";
  }

  // Generate trend insight
  let trendInsight = "Physical activity shows positive correlation with sleep quality";
  const activityCorrelation = calculateCorrelation(
    rows.map(r => r.activity),
    rows.map(r => r.sleepQual)
  );
  if (activityCorrelation > 0.3) {
    trendInsight = "Physical activity strongly correlates with better sleep quality";
  } else if (activityCorrelation < -0.3) {
    trendInsight = "Higher activity levels may be associated with sleep disturbances";
  }

  // Update insights in the UI
  document.getElementById('key-insight').textContent = keyFinding;
  document.getElementById('trend-insight').textContent = trendInsight;
  document.getElementById('disorder-percentage').textContent = disorderPercentage.toFixed(1) + '%';
}

// Calculate correlation coefficient
function calculateCorrelation(x, y) {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);

  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

// Export dashboard functionality
// function exportDashboard() {
//   // Create a simple data export
//   const data = {
//     timestamp: new Date().toISOString(),
//     metrics: {
//       totalParticipants: document.getElementById('stat-total').textContent,
//       avgSleepDuration: document.getElementById('stat-avg-sleep').textContent,
//       avgSleepQuality: document.getElementById('stat-avg-quality').textContent,
//       disorderPrevalence: document.getElementById('stat-disorder').textContent
//     },
//     insights: {
//       keyFinding: document.getElementById('key-insight').textContent,
//       trendAlert: document.getElementById('trend-insight').textContent,
//       healthConcern: document.getElementById('disorder-percentage').textContent
//     }
//   };

  // // Create and download JSON file
  // const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = `sleep-health-dashboard-${new Date().toISOString().split('T')[0]}.json`;
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);
  // URL.revokeObjectURL(url);

  // // Show success message
  // showNotification('Dashboard data exported successfully!', 'success');


// Theme toggle (basic implementation)
function toggleTheme() {
  const body = document.body;
  const currentTheme = body.getAttribute('data-theme') || 'dark';

  if (currentTheme === 'dark') {
    body.setAttribute('data-theme', 'light');
    showNotification('Switched to light theme', 'info');
  } else {
    body.setAttribute('data-theme', 'dark');
    showNotification('Switched to dark theme', 'info');
  }
}

// Refresh data
function refreshData() {
  showNotification('Refreshing data...', 'info');
  initDashboard();
}

// Modal functions
function showAbout() {
  showModal('About Sleep Health Dashboard',
    `<p>This dashboard provides comprehensive insights into sleep health data, including correlations between various factors affecting sleep quality and duration.</p>
    <p><strong>Features:</strong></p>
    <ul>
      <li>Correlation analysis with regression lines</li>
      <li>Interactive charts and heatmaps</li>
      <li>Automated insights generation</li>
    </ul>
    <p><strong>Data Source:</strong> Sleep Health and Lifestyle Dataset by Laksika Tharmalingam in Kaggle.com</p>`
  );
}

function showHelp() {
  showModal('Help & Usage',
    `<p><strong>Navigation:</strong> Use the top navigation to switch between different dashboard views.</p>
    <p><strong>Charts:</strong> Hover over data points to see detailed information. Regression lines show trends in scatter plots.</p>
    <p><strong>Insights:</strong> The banner at the top shows key findings from the data analysis.</p>`
  );
}

function showContact() {
  showModal('Contact Information',
    // `<p>For questions or feedback about this dashboard:</p>
    // <p><strong>Email:</strong> dashboard@example.com</p>
    // <p><strong>Version:</strong> 1.0.0</p>
    // <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>`
    ''
  );
}

function showModal(title, content) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = content;
  document.getElementById('info-modal').classList.add('show');
}

function closeModal() {
  document.getElementById('info-modal').classList.remove('show');
}

// Notification system
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <i class="fas ${getNotificationIcon(type)}"></i>
    <span>${message}</span>
  `;

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => document.body.removeChild(notification), 300);
  }, 3000);
}

function getNotificationIcon(type) {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-exclamation-circle';
    case 'warning': return 'fa-exclamation-triangle';
    default: return 'fa-info-circle';
  }
}

// Initialize date/time updates
setInterval(updateDateTime, 1000);

// Close modal when clicking outside
document.addEventListener('click', function(event) {
  const modal = document.getElementById('info-modal');
  if (event.target === modal) {
    closeModal();
  }
});

