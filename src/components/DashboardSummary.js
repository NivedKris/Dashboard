import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Bar, Doughnut, Bubble, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

// Register all ChartJS components
ChartJS.register(...registerables);

// Helper function to create gradient backgrounds for charts
const createGradientBackground = (ctx, colorStart, colorEnd) => {
  if (!ctx) return colorStart;

  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, colorStart);
  gradient.addColorStop(1, colorEnd);
  return gradient;
};

const DashboardSummary = ({ data = [] }) => {
  const barChartRef = useRef(null);
  const [gradientBg, setGradientBg] = useState(null);

  // Create gradient for the bar chart
  useEffect(() => {
    if (barChartRef.current) {
      const ctx = barChartRef.current.canvas.getContext('2d');
      if (ctx) {
        const gradient = createGradientBackground(
          ctx,
          'rgba(43, 90, 252, 0.7)',
          'rgba(0, 208, 255, 0.3)'
        );
        setGradientBg(gradient);
      }
    }
  }, []);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalRecords: 0,
        avgIntensity: 0,
        avgLikelihood: 0,
        avgRelevance: 0,
        uniqueCountries: 0,
        uniqueTopics: 0,
        uniqueSectors: 0,
        uniqueRegions: 0
      };
    }

    const countries = new Set();
    const topics = new Set();
    const sectors = new Set();
    const regions = new Set();
    let intensitySum = 0;
    let likelihoodSum = 0;
    let relevanceSum = 0;

    data.forEach(item => {
      if (item.country) countries.add(item.country);
      if (item.topic) topics.add(item.topic);
      if (item.sector) sectors.add(item.sector);
      if (item.region) regions.add(item.region);

      intensitySum += item.intensity || 0;
      likelihoodSum += item.likelihood || 0;
      relevanceSum += item.relevance || 0;
    });

    return {
      totalRecords: data.length,
      avgIntensity: (intensitySum / data.length || 1).toFixed(2),
      avgLikelihood: (likelihoodSum / data.length || 1).toFixed(2),
      avgRelevance: (relevanceSum / data.length || 1).toFixed(2),
      uniqueCountries: countries.size,
      uniqueTopics: topics.size,
      uniqueSectors: sectors.size,
      uniqueRegions: regions.size
    };
  }, [data]);

  // Process data for sector distribution chart
  const sectorDoughnutData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    const sectorCounts = {};
    data.forEach(item => {
      if (item.sector) {
        sectorCounts[item.sector] = (sectorCounts[item.sector] || 0) + 1;
      }
    });

    // Sort sectors by count and get top 7, group others
    const sortedSectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1]);

    const topSectors = sortedSectors.slice(0, 7);
    const otherSectors = sortedSectors.slice(7);

    let finalSectors = [...topSectors];
    if (otherSectors.length > 0) {
      const otherCount = otherSectors.reduce((sum, sector) => sum + sector[1], 0);
      finalSectors.push(["Others", otherCount]);
    }

    const chartLabels = finalSectors.map(s => s[0]);
    const chartData = finalSectors.map(s => s[1]);

    return {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(231, 233, 237, 0.7)',
            'rgba(97, 97, 97, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(231, 233, 237, 1)',
            'rgba(97, 97, 97, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  // Process data for bubble chart
  const bubbleChartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        datasets: []
      };
    }

    // Group data by likelihood vs intensity with relevance as bubble size
    const bubbleData = data
      .filter(item => item.intensity && item.likelihood && item.relevance)
      .slice(0, 50) // Limit to reasonable number of bubbles
      .map(item => ({
        x: item.intensity,
        y: item.likelihood,
        r: Math.max(3, item.relevance * 1.5), // Scale bubble size
        topic: item.topic,
        sector: item.sector
      }));

    return {
      datasets: [
        {
          label: 'Intensity vs Likelihood',
          data: bubbleData,
          backgroundColor: 'rgba(0, 208, 255, 0.6)',
          borderColor: 'rgba(0, 208, 255, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  // Process data for region bar chart
  const regionBarData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const regionCounts = {};
    data.forEach(item => {
      if (item.region) {
        regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
      }
    });

    // Sort regions by count and get top 8
    const sortedRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return {
      labels: sortedRegions.map(r => r[0]),
      datasets: [
        {
          label: 'Data Points by Region',
          data: sortedRegions.map(r => r[1]),
          backgroundColor: gradientBg || 'rgba(43, 90, 252, 0.6)',
          borderColor: 'rgba(43, 90, 252, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [data, gradientBg]);

  // Process data for year distribution pie chart
  const yearPieData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    // Helper function to ensure year is a valid number or 'Unknown'
    const parseYear = (yearValue) => {
      if (!yearValue) return 'Unknown';
      if (yearValue === 'Unknown') return 'Unknown';

      // Try to parse as number
      const parsed = parseInt(yearValue, 10);
      if (isNaN(parsed)) return 'Unknown';

      return String(parsed); // Convert back to string for consistency
    };

    const yearCounts = {};
    data.forEach(item => {
      const year = parseYear(item.year || item.end_year);
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    // Sort years and filter out 'Unknown' for better visualization
    const sortedYears = Object.entries(yearCounts)
      .filter(([year]) => year !== 'Unknown')
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    if (yearCounts['Unknown']) {
      sortedYears.push(['Unknown', yearCounts['Unknown']]);
    }

    // Generate colors for each year
    const colors = sortedYears.map((_, index) => {
      const hue = (180 / sortedYears.length) * index + 180; // Use blue-green spectrum
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    });

    return {
      labels: sortedYears.map(y => y[0]),
      datasets: [
        {
          data: sortedYears.map(y => y[1]),
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  // Options for the sector doughnut chart
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white',
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Sector Distribution',
        color: 'white',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = ((value * 100) / total).toFixed(1) + '%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    },
    cutout: '60%',
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  // Options for the bubble chart
  const bubbleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Intensity',
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Likelihood',
          color: 'white'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Intensity vs Likelihood',
        color: 'white',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const item = context.raw;
            return [
              `Topic: ${item.topic || 'Unknown'}`,
              `Sector: ${item.sector || 'Unknown'}`,
              `Intensity: ${item.x}`,
              `Likelihood: ${item.y}`,
              `Relevance: ${(item.r / 1.5).toFixed(1)}`
            ];
          }
        }
      }
    }
  };

  // Options for region bar chart
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Data Points by Region',
        color: 'white',
        font: {
          size: 16
        }
      }
    }
  };

  // Options for year pie chart
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'white',
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Data Distribution by Year',
        color: 'white',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = ((value * 100) / total).toFixed(1) + '%';
            return `${label}: ${value} (${percentage})`;
          }
        }
      }
    }
  };

  return (
    <div className="dashboard-summary fade-in">
      <h4 className="text-white mb-3">Dashboard Overview</h4>

      {/* Summary Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <div className="summary-card records">
            <div className="icon">
              <i className="bi bi-database"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.totalRecords}</h3>
              <p>Total Records</p>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="summary-card intensity">
            <div className="icon">
              <i className="bi bi-lightning-charge"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.avgIntensity}</h3>
              <p>Avg. Intensity</p>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="summary-card likelihood">
            <div className="icon">
              <i className="bi bi-percent"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.avgLikelihood}</h3>
              <p>Avg. Likelihood</p>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="summary-card relevance">
            <div className="icon">
              <i className="bi bi-bullseye"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.avgRelevance}</h3>
              <p>Avg. Relevance</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <div className="summary-card countries">
            <div className="icon">
              <i className="bi bi-flag"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.uniqueCountries}</h3>
              <p>Unique Countries</p>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="summary-card topics">
            <div className="icon">
              <i className="bi bi-tag"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.uniqueTopics}</h3>
              <p>Unique Topics</p>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="summary-card sectors">
            <div className="icon">
              <i className="bi bi-building"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.uniqueSectors}</h3>
              <p>Unique Sectors</p>
            </div>
          </div>
        </Col>

        <Col md={3} sm={6}>
          <div className="summary-card regions">
            <div className="icon">
              <i className="bi bi-globe"></i>
            </div>
            <div className="summary-data">
              <h3>{summaryMetrics.uniqueRegions}</h3>
              <p>Unique Regions</p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Charts Row 1 */}
      <Row className="mt-4">
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-pie-chart"></i> Sector Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                {data && data.length > 0 ? (
                  <Doughnut data={sectorDoughnutData} options={doughnutOptions} />
                ) : (
                  <div className="text-center mt-5 text-muted">
                    <i className="bi bi-exclamation-circle display-4"></i>
                    <p className="mt-3">No data available</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-graph-up-arrow"></i> Intensity vs Likelihood</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                {data && data.length > 0 ? (
                  <Bubble data={bubbleChartData} options={bubbleOptions} />
                ) : (
                  <div className="text-center mt-5 text-muted">
                    <i className="bi bi-exclamation-circle display-4"></i>
                    <p className="mt-3">No data available</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Row 2 */}
      <Row className="mt-4">
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-bar-chart-steps"></i> Data by Region</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                {data && data.length > 0 ? (
                  <Bar
                    ref={barChartRef}
                    data={regionBarData}
                    options={barOptions}
                  />
                ) : (
                  <div className="text-center mt-5 text-muted">
                    <i className="bi bi-exclamation-circle display-4"></i>
                    <p className="mt-3">No data available</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-calendar3"></i> Data Distribution by Year</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                {data && data.length > 0 ? (
                  <Pie data={yearPieData} options={pieOptions} />
                ) : (
                  <div className="text-center mt-5 text-muted">
                    <i className="bi bi-exclamation-circle display-4"></i>
                    <p className="mt-3">No data available</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardSummary; 