/* ============================================================
   ANALYTICS.JS — Chart.js visualizations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Chart.js global defaults for dark theme
  Chart.defaults.color = '#5A7A99';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.07)';
  Chart.defaults.font.family = "'Inter', sans-serif";

  const COLORS = {
    high:      '#FF6B35',
    veryHigh:  '#FF2D55',
    low:       '#34C759',
    moderate:  '#00C6FF',
  };

  // Grid color helper
  const gridColor = 'rgba(255,255,255,0.06)';

  /* ============================================================
     1. Risk Distribution — Doughnut Chart
     ============================================================ */
  const riskDistCtx = document.getElementById('riskDistChart');
  if (riskDistCtx) {
    new Chart(riskDistCtx, {
      type: 'doughnut',
      data: {
        labels: ['Low Risk (C2)', 'Moderate Risk (C3)', 'High Risk (C0)', 'Very High Risk (C1)'],
        datasets: [{
          data: [30, 28, 24, 18],
          backgroundColor: [
            COLORS.low + 'CC',
            COLORS.moderate + 'CC',
            COLORS.high + 'CC',
            COLORS.veryHigh + 'CC',
          ],
          borderColor: [COLORS.low, COLORS.moderate, COLORS.high, COLORS.veryHigh],
          borderWidth: 2,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed}%`
            }
          }
        },
        animation: { animateRotate: true, duration: 1200 }
      }
    });
  }

  /* ============================================================
     2. PCA Explained Variance — Bar Chart
     ============================================================ */
  const pcaVarianceCtx = document.getElementById('pcaVarianceChart');
  if (pcaVarianceCtx) {
    // Use values from the backend stats if available, otherwise defaults
    let pc1Var = 38.5, pc2Var = 33.2, pc3Var = 12.1, pc4Var = 8.7, pcRestVar = 7.5;
    if (typeof STATS !== 'undefined' && STATS.explained_variance) {
      pc1Var = STATS.explained_variance[0] || pc1Var;
      pc2Var = STATS.explained_variance[1] || pc2Var;
    }

    new Chart(pcaVarianceCtx, {
      type: 'bar',
      data: {
        labels: ['PC1', 'PC2', 'PC3*', 'PC4*', 'Rest*'],
        datasets: [{
          label: 'Variance Explained (%)',
          data: [pc1Var, pc2Var, pc3Var, pc4Var, pcRestVar],
          backgroundColor: [
            'rgba(0,212,255,0.7)',
            'rgba(0,102,255,0.7)',
            'rgba(168,85,247,0.4)',
            'rgba(168,85,247,0.3)',
            'rgba(168,85,247,0.2)',
          ],
          borderColor: [
            '#00D4FF', '#0066FF',
            'rgba(168,85,247,0.6)',
            'rgba(168,85,247,0.4)',
            'rgba(168,85,247,0.3)',
          ],
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: ctx => ctx.dataIndex >= 2 ? '(*estimated, not from model)' : ''
            }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: '#5A7A99' } },
          y: {
            grid: { color: gridColor },
            ticks: { color: '#5A7A99', callback: v => v + '%' },
            beginAtZero: true, max: 50
          }
        },
        animation: { duration: 1000 }
      }
    });
  }

  /* ============================================================
     3. PCA Scatter Plot — Simulated cluster points + centroids
     ============================================================ */
  const pcaScatterCtx = document.getElementById('pcaScatterChart');
  if (pcaScatterCtx) {

    // Generate reproducible pseudo-random cluster scatter data
    function seededRand(seed) {
      let s = seed;
      return function() {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
      };
    }

    function generateCluster(cx, cy, n, spreadX, spreadY, seed) {
      const rand = seededRand(seed);
      return Array.from({ length: n }, () => ({
        x: +(cx + (rand() - 0.5) * 2 * spreadX).toFixed(3),
        y: +(cy + (rand() - 0.5) * 2 * spreadY).toFixed(3),
      }));
    }

    // Cluster center positions from actual K-Means output (approximate PC space)
    let centers = [
      { x: 1.8,  y: -0.6 },   // Cluster 0: High Risk
      { x: 3.1,  y:  0.8 },   // Cluster 1: Very High Risk
      { x: -2.4, y: -0.5 },   // Cluster 2: Low Risk
      { x: -0.5, y:  1.2 },   // Cluster 3: Moderate Risk
    ];

    if (typeof STATS !== 'undefined' && STATS.centers) {
      centers = STATS.centers.map(c => ({ x: c.pc1, y: c.pc2 }));
    }

    const clusterData = [
      { points: generateCluster(centers[0].x, centers[0].y, 60, 0.9, 0.7, 42),   color: COLORS.high,     label: 'Cluster 0: High Risk' },
      { points: generateCluster(centers[1].x, centers[1].y, 45, 0.8, 0.6, 99),   color: COLORS.veryHigh, label: 'Cluster 1: Very High Risk' },
      { points: generateCluster(centers[2].x, centers[2].y, 75, 1.0, 0.8, 777),  color: COLORS.low,      label: 'Cluster 2: Low Risk' },
      { points: generateCluster(centers[3].x, centers[3].y, 70, 0.95, 0.85, 321),color: COLORS.moderate, label: 'Cluster 3: Moderate Risk' },
    ];

    const datasets = clusterData.map(c => ({
      label: c.label,
      data: c.points,
      backgroundColor: c.color + '55',
      borderColor: c.color,
      borderWidth: 1,
      pointRadius: 4,
      pointHoverRadius: 6,
      type: 'scatter',
    }));

    // Add centroid markers as a separate dataset
    datasets.push({
      label: 'Cluster Centers',
      data: centers.map(c => ({ x: c.x, y: c.y })),
      backgroundColor: '#FFFFFF',
      borderColor: '#00D4FF',
      borderWidth: 2,
      pointRadius: 8,
      pointStyle: 'crossRot',
      pointHoverRadius: 10,
      type: 'scatter',
    });

    new Chart(pcaScatterCtx, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const ds = ctx.dataset.label;
                return ` ${ds}: (${ctx.parsed.x.toFixed(2)}, ${ctx.parsed.y.toFixed(2)})`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: '#5A7A99' },
            title: { display: true, text: 'PC1 — Pain & Symptom Axis', color: '#5A7A99', font: { size: 11 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: '#5A7A99' },
            title: { display: true, text: 'PC2 — Lifestyle Axis', color: '#5A7A99', font: { size: 11 } }
          }
        },
        animation: { duration: 800 }
      }
    });
  }

  /* ============================================================
     4. Risk Factor Radar Chart
     ============================================================ */
  const radarCtx = document.getElementById('radarChart');
  if (radarCtx) {
    const labels = ['Pain', 'Stiffness', 'Posture', 'Sleep', 'Activity', 'Family Hx', 'OTT Use', 'Gut Hx'];
    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: 'Very High Risk (C1)',
            data: [3.2, 2.9, 2.1, 2.8, 2.7, 2.4, 2.6, 2.0],
            backgroundColor: 'rgba(255,45,85,0.15)',
            borderColor: COLORS.veryHigh,
            borderWidth: 2,
            pointBackgroundColor: COLORS.veryHigh,
            pointRadius: 3,
          },
          {
            label: 'Low Risk (C2)',
            data: [0.3, 0.4, 0.5, 0.4, 0.6, 0.3, 0.8, 0.2],
            backgroundColor: 'rgba(52,199,89,0.12)',
            borderColor: COLORS.low,
            borderWidth: 2,
            pointBackgroundColor: COLORS.low,
            pointRadius: 3,
          },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { color: '#A8C0D8', font: { size: 11 }, boxWidth: 12 }
          }
        },
        scales: {
          r: {
            min: 0, max: 3.5,
            ticks: { stepSize: 1, color: '#5A7A99', backdropColor: 'transparent' },
            grid: { color: gridColor },
            angleLines: { color: gridColor },
            pointLabels: { color: '#A8C0D8', font: { size: 10 } }
          }
        },
        animation: { duration: 1000 }
      }
    });
  }

  /* ============================================================
     5. Cluster Risk Score Bar Chart
     ============================================================ */
  const clusterBarCtx = document.getElementById('clusterBarChart');
  if (clusterBarCtx) {
    new Chart(clusterBarCtx, {
      type: 'bar',
      data: {
        labels: ['Cluster 0\nHigh Risk', 'Cluster 1\nVery High Risk', 'Cluster 2\nLow Risk', 'Cluster 3\nModerate Risk'],
        datasets: [{
          label: 'Risk Score',
          data: [75, 95, 20, 50],
          backgroundColor: [
            COLORS.high    + 'BB',
            COLORS.veryHigh + 'BB',
            COLORS.low     + 'BB',
            COLORS.moderate + 'BB',
          ],
          borderColor: [COLORS.high, COLORS.veryHigh, COLORS.low, COLORS.moderate],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` Risk Score: ${ctx.parsed.x} / 100`
            }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: '#5A7A99' },
            min: 0, max: 100,
            title: { display: true, text: 'Risk Score (0-100)', color: '#5A7A99' }
          },
          y: {
            grid: { color: 'transparent' },
            ticks: { color: '#A8C0D8', font: { size: 11 } }
          }
        },
        animation: { duration: 1000 }
      }
    });
  }

  /* ---- Update variance display from STATS ---- */
  if (typeof STATS !== 'undefined' && STATS.explained_variance) {
    const varEl = document.getElementById('varianceDisplay');
    if (varEl) {
      const total = STATS.explained_variance.reduce((a, b) => a + b, 0);
      varEl.textContent = total.toFixed(1) + '%';
    }
  }

});
