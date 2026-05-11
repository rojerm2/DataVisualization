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

async function initDashboard() {
  try {
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
      heartRate: item.heartRate,
      steps: item.dailySteps,
      disorder: item.sleepDisorder || "None",
    }));

    renderMetrics(rows);
    renderCharts(rows);
  } catch (err) {
    console.error("Dashboard failed to load:", err);
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

function renderMetrics(rows) {
  document.getElementById("stat-total").innerText = rows.length;
  document.getElementById("stat-avg-sleep").innerText =
    avg(rows.map((r) => r.sleepDur)).toFixed(1) + "h";
  document.getElementById("stat-avg-quality").innerText =
    avg(rows.map((r) => r.sleepQual)).toFixed(1) + " / 10";
  const hasDisorder = rows.filter((r) => r.disorder !== "None").length;
  document.getElementById("stat-disorder").innerText =
    ((hasDisorder / rows.length) * 100).toFixed(1) + "%";
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

  new Chart(document.getElementById("c8"), {
    type: "bar",
    data: {
      labels: ageKeys.map((k) => k + "-" + (parseInt(k) + 4)),
      datasets: [
        {
          label: "Count",
          data: ageKeys.map((k) => ageBins[k]),
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

  // C9: Physical Activity Level (binned)
  const actCounts = {};
  rows.forEach((r) => {
    const value = r.activity;
    const bucket =
      value <= 40 ? "Low (≤40)" : value <= 65 ? "Medium (41-65)" : "High (≥66)";
    actCounts[bucket] = (actCounts[bucket] || 0) + 1;
  });
  const actLabels = ["Low (≤40)", "Medium (41-65)", "High (≥66)"];
  new Chart(document.getElementById("c9"), {
    type: "bar",
    data: {
      labels: actLabels,
      datasets: [
        {
          label: "Count",
          data: actLabels.map((label) => actCounts[label] || 0),
          backgroundColor: PINK,
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
  new Chart(document.getElementById("c12"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Stress vs Sleep Duration",
          data: rows.map((r) => ({ x: r.stress, y: r.sleepDur })),
          backgroundColor: BLUE,
          borderColor: BLUE,
          showLine: false,
          fill: false,
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
  new Chart(document.getElementById("c13"), {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Activity vs Sleep Quality",
          data: rows.map((r) => ({
            x: r.activity,
            y: r.sleepQual,
            label: `${r.activity} activity`,
          })),
          backgroundColor: GREEN,
          borderColor: GREEN,
          showLine: false,
          fill: false,
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
            text: "Physical Activity Level",
            color: "#a1a1a8",
          },
          ticks: { color: "#a1a1a8" },
          grid: { color: "#3f3f46" },
          suggestedMin: 0,
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
          suggestedMin: 0,
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
          suggestedMin: 2,
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
  const disorderHR = groupBy(rows, "disorder");
  const disorderLabels = Object.keys(disorderHR);
  const avgHRByDisorder = disorderLabels.map((d) =>
    avg(disorderHR[d].map((r) => r.heartRate)),
  );

  new Chart(document.getElementById("c15"), {
    type: "bar",
    data: {
      labels: disorderLabels,
      datasets: [
        {
          label: "Avg Heart Rate (bpm)",
          data: avgHRByDisorder,
          backgroundColor: [BLUE, ORANGE, GREEN, RED, PINK],
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: "#a1a1a8" } } },
      scales: {
        y: { ticks: { color: "#a1a1a8" }, grid: { color: "#3f3f46" } },
        x: { ticks: { color: "#a1a1a8" } },
      },
    },
  });
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
    const normalized = (v + 1) / 2;
    const red = Math.round(255 * normalized);
    const blue = Math.round(255 * (1 - normalized));
    const green = Math.round(255 * (1 - Math.abs(v)));
    return `rgb(${red}, ${green}, ${blue})`;
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
          borderColor: "#3f3f46",
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
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
