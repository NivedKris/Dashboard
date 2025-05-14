import React, { useMemo, useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Line, Bar, Scatter, Bubble } from 'react-chartjs-2';

const TrendAnalysis = ({ data }) => {
  const lineChartRef = useRef(null);
  const [gradientBg, setGradientBg] = useState(null);

  // Create gradient background
  useEffect(() => {
    if (lineChartRef.current) {
      const ctx = lineChartRef.current.canvas.getContext('2d');
      if (ctx) {
        const gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
        gradient1.addColorStop(0, 'rgba(43, 90, 252, 0.5)');
        gradient1.addColorStop(1, 'rgba(0, 208, 255, 0.1)');
        setGradientBg(gradient1);
      }
    }
  }, []);

  // Debug: Log data when component receives it
  useEffect(() => {
    console.log('TrendAnalysis data:', data);
    if (data && data.length > 0) {
      console.log('Sample data item:', data[0]);
      console.log('Years in data:', data.map(item => item.year || item.end_year).filter(Boolean));
    }
  }, [data]);

  // Process data for trend analysis
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        yearlyTrends: {
          labels: [],
          datasets: []
        },
        sectorTrends: {
          labels: [],
          datasets: []
        },
        scatterTrend: {
          datasets: []
        },
        bubbleTrend: {
          datasets: []
        }
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

    // Yearly trends data
    const yearData = {};
    data.forEach(item => {
      // Use year property first (from intensity endpoint), fall back to end_year or "Unknown"
      const year = parseYear(item.year || item.end_year);

      if (!yearData[year]) {
        yearData[year] = {
          intensitySum: 0,
          likelihoodSum: 0,
          relevanceSum: 0,
          count: 0,
        };
      }

      yearData[year].intensitySum += item.intensity || 0;
      yearData[year].likelihoodSum += item.likelihood || 0;
      yearData[year].relevanceSum += item.relevance || 0;
      yearData[year].count += 1;
    });

    // Sort years numerically, not alphabetically
    const years = Object.keys(yearData)
      .filter(y => y !== 'Unknown')
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

    if (yearData['Unknown']) {
      years.push('Unknown');
    }

    // Debug: Log years found
    console.log('Years extracted from data:', years);

    const intensities = years.map(year => yearData[year].intensitySum / yearData[year].count);
    const likelihoods = years.map(year => yearData[year].likelihoodSum / yearData[year].count);
    const relevances = years.map(year => yearData[year].relevanceSum / yearData[year].count);

    // Sector trends over time
    const sectorYearData = {};
    data.forEach(item => {
      // Use year property first, fall back to end_year
      const year = parseYear(item.year || item.end_year);

      if (item.sector && year !== 'Unknown') {
        if (!sectorYearData[item.sector]) {
          sectorYearData[item.sector] = {};
        }
        if (!sectorYearData[item.sector][year]) {
          sectorYearData[item.sector][year] = {
            count: 0,
            intensitySum: 0
          };
        }
        sectorYearData[item.sector][year].count += 1;
        sectorYearData[item.sector][year].intensitySum += item.intensity || 0;
      }
    });

    // Get top 5 sectors by total count
    const sectorCounts = {};
    Object.keys(sectorYearData).forEach(sector => {
      sectorCounts[sector] = Object.values(sectorYearData[sector]).reduce((sum, data) => sum + data.count, 0);
    });

    const topSectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    const validYears = years.filter(y => y !== 'Unknown');

    // Debug: Log sectors found
    console.log('Top sectors found:', topSectors);
    console.log('Valid years for sector trends:', validYears);

    const sectorDatasets = topSectors.map((sector, index) => {
      const hue = (360 / topSectors.length) * index;
      return {
        label: sector,
        data: validYears.map(year => {
          if (sectorYearData[sector] && sectorYearData[sector][year]) {
            return sectorYearData[sector][year].intensitySum / sectorYearData[sector][year].count;
          }
          return 0;
        }),
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.2)`,
        borderColor: `hsla(${hue}, 70%, 60%, 1)`,
        tension: 0.4,
        fill: false
      };
    });

    // Scatter plot for intensity vs year
    const scatterData = data
      // Filter items that have a valid year and intensity
      .filter(item => {
        const year = parseYear(item.year || item.end_year);
        return year !== 'Unknown' && item.intensity;
      })
      .map(item => {
        const year = parseYear(item.year || item.end_year);
        return {
          x: parseInt(year, 10),
          y: item.intensity,
          sector: item.sector,
          topic: item.topic
        };
      });

    // Bubble chart for year vs likelihood vs relevance
    const bubbleData = data
      .filter(item => {
        const year = parseYear(item.year || item.end_year);
        return year !== 'Unknown' && item.likelihood && item.relevance;
      })
      .map(item => {
        const year = parseYear(item.year || item.end_year);
        return {
          x: parseInt(year, 10),
          y: item.likelihood,
          r: Math.max(3, item.relevance * 1.5),
          sector: item.sector || 'Unknown',
          topic: item.topic || 'Unknown'
        };
      });

    // Debug: Log scatter data points count
    console.log('Scatter data points count:', scatterData.length);
    console.log('Bubble data points count:', bubbleData.length);

    // Calculate min and max years for scales
    let minYear = 2016;
    let maxYear = 2030;

    if (scatterData.length > 0) {
      const years = scatterData.map(item => item.x);
      minYear = Math.min(...years);
      maxYear = Math.max(...years);

      // Add some padding to the range
      minYear = Math.max(2000, minYear - 1);
      maxYear = Math.min(2050, maxYear + 1);
    }

    return {
      yearlyTrends: {
        labels: years,
        datasets: [
          {
            label: 'Intensity',
            data: intensities,
            backgroundColor: 'rgba(43, 90, 252, 0.2)',
            borderColor: 'rgba(43, 90, 252, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false
          },
          {
            label: 'Likelihood',
            data: likelihoods,
            backgroundColor: 'rgba(0, 208, 255, 0.2)',
            borderColor: 'rgba(0, 208, 255, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false
          },
          {
            label: 'Relevance',
            data: relevances,
            backgroundColor: 'rgba(0, 230, 118, 0.2)',
            borderColor: 'rgba(0, 230, 118, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: false
          }
        ]
      },
      sectorTrends: {
        labels: validYears,
        datasets: sectorDatasets
      },
      scatterTrend: {
        datasets: [{
          label: 'Intensity by Year',
          data: scatterData,
          backgroundColor: scatterData.map(item => {
            // Color by sector if available
            if (item.sector) {
              const sectorIndex = topSectors.indexOf(item.sector);
              if (sectorIndex >= 0) {
                const hue = (360 / topSectors.length) * sectorIndex;
                return `hsla(${hue}, 70%, 60%, 0.7)`;
              }
            }
            return 'rgba(0, 208, 255, 0.6)';
          }),
          borderColor: 'rgba(0, 208, 255, 0.8)',
          pointRadius: 5,
          pointHoverRadius: 8
        }],
        minYear,
        maxYear
      },
      bubbleTrend: {
        datasets: [{
          label: 'Likelihood vs Year vs Relevance',
          data: bubbleData,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }],
        minYear,
        maxYear
      }
    };
  }, [data]);

  // Chart options
  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            size: 11
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Yearly Trends',
        color: 'white',
        font: {
          size: 16
        }
      },
    },
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
    }
  };

  const sectorOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'white',
          font: {
            size: 11
          },
          padding: 15
        }
      },
      title: {
        display: true,
        text: 'Sector Intensity Trends',
        color: 'white',
        font: {
          size: 16
        }
      },
    },
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
    }
  };

  const scatterOptions = useMemo(() => {
    const minYear = chartData.scatterTrend?.minYear || 2016;
    const maxYear = chartData.scatterTrend?.maxYear || 2030;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Intensity Distribution by Year',
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
                `Year: ${item.x}`,
                `Intensity: ${item.y}`,
                `Sector: ${item.sector || 'N/A'}`,
                `Topic: ${item.topic || 'N/A'}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            color: 'white'
          },
          min: minYear,
          max: maxYear,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            stepSize: Math.ceil((maxYear - minYear) / 10), // Adjust step size based on the range
            color: 'white'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Intensity',
            color: 'white'
          },
          min: 0,
          suggestedMax: 10,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        }
      }
    };
  }, [chartData.scatterTrend]);

  const bubbleOptions = useMemo(() => {
    const minYear = chartData.bubbleTrend?.minYear || 2016;
    const maxYear = chartData.bubbleTrend?.maxYear || 2030;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Likelihood vs Year vs Relevance',
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
                `Year: ${item.x}`,
                `Likelihood: ${item.y}`,
                `Relevance: ${(item.r / 1.5).toFixed(1)}`,
                `Sector: ${item.sector || 'N/A'}`,
                `Topic: ${item.topic || 'N/A'}`
              ];
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            color: 'white'
          },
          min: minYear,
          max: maxYear,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            stepSize: Math.ceil((maxYear - minYear) / 10),
            color: 'white'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Likelihood',
            color: 'white'
          },
          min: 0,
          suggestedMax: 10,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: 'white'
          }
        }
      }
    };
  }, [chartData.bubbleTrend]);

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-5 text-white">
        <i className="bi bi-exclamation-circle display-4"></i>
        <p className="mt-3">No data available for trend analysis. Please adjust filters or load data.</p>
      </div>
    );
  }

  // Count data points with year information
  const dataWithYear = data.filter(item => {
    const year = item.year || item.end_year;
    return year && year !== 'Unknown' && !isNaN(parseInt(year, 10));
  }).length;

  const debugInfo = `Data points: ${data.length}, with valid year information: ${dataWithYear}`;

  return (
    <div className="fade-in">
      <h4 className="text-white mb-4">Trend Analysis</h4>

      {/* Debug information - can be removed in production */}
      <Alert variant="info" className="mb-4">
        <small>{debugInfo}</small>
      </Alert>

      <Row>
        <Col md={12} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-graph-up-arrow"></i> Yearly Trends</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Line
                  ref={lineChartRef}
                  data={chartData.yearlyTrends}
                  options={lineOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-diagram-3"></i> Sector Intensity Trends</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Line data={chartData.sectorTrends} options={sectorOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-scatter-chart"></i> Intensity Distribution by Year</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Scatter data={chartData.scatterTrend} options={scatterOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-circle"></i> Likelihood by Year (Bubble size = Relevance)</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Bubble data={chartData.bubbleTrend} options={bubbleOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TrendAnalysis; 