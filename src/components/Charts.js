import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Doughnut, Bubble, Pie, Radar } from 'react-chartjs-2';

// Register all ChartJS components
ChartJS.register(...registerables);

// Helper to create gradient background
const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

const Charts = ({ data }) => {
  const barChartRef = useRef(null);
  const [gradientBg, setGradientBg] = useState('rgba(54, 162, 235, 0.5)');

  useEffect(() => {
    if (barChartRef.current) {
      const ctx = barChartRef.current.canvas.getContext('2d');
      if (ctx) {
        setGradientBg(createGradient(
          ctx,
          'rgba(43, 90, 252, 0.7)',
          'rgba(0, 208, 255, 0.3)'
        ));
      }
    }
  }, []);

  // Process data for visualizations
  const processBubbleChart = () => {
    if (!data || data.length === 0) return { datasets: [] };

    const bubbleData = data
      .filter(item => item.intensity && item.likelihood && item.relevance)
      .slice(0, 50)
      .map(item => ({
        x: item.intensity,
        y: item.likelihood,
        r: Math.max(3, item.relevance * 1.5),
        label: item.topic || 'Unknown',
        sector: item.sector || 'Unknown'
      }));

    return {
      datasets: [{
        label: 'Intensity vs Likelihood',
        data: bubbleData,
        backgroundColor: 'rgba(0, 208, 255, 0.6)',
        borderColor: 'rgba(0, 208, 255, 1)',
        borderWidth: 1
      }]
    };
  };

  const processSectorDoughnut = () => {
    if (!data || data.length === 0) return { labels: [], datasets: [{ data: [] }] };

    const sectorCounts = {};
    data.forEach(item => {
      if (item.sector) {
        sectorCounts[item.sector] = (sectorCounts[item.sector] || 0) + 1;
      }
    });

    const sectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    return {
      labels: sectors.map(s => s[0]),
      datasets: [{
        data: sectors.map(s => s[1]),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(231, 233, 237, 0.7)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(231, 233, 237, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  const processRegionBar = () => {
    if (!data || data.length === 0) return { labels: [], datasets: [{ data: [] }] };

    const regionCounts = {};
    data.forEach(item => {
      if (item.region) {
        regionCounts[item.region] = (regionCounts[item.region] || 0) + 1;
      }
    });

    const regions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7);

    return {
      labels: regions.map(r => r[0]),
      datasets: [{
        label: 'Records by Region',
        data: regions.map(r => r[1]),
        backgroundColor: gradientBg,
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    };
  };

  const processTopicPie = () => {
    if (!data || data.length === 0) return { labels: [], datasets: [{ data: [] }] };

    const topicCounts = {};
    data.forEach(item => {
      if (item.topic) {
        topicCounts[item.topic] = (topicCounts[item.topic] || 0) + 1;
      }
    });

    const topics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: topics.map(t => t[0]),
      datasets: [{
        data: topics.map(t => t[1]),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  const processRadarChart = () => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    // Calculate averages by region for intensity, likelihood, and relevance
    const regionData = {};
    data.forEach(item => {
      if (item.region) {
        if (!regionData[item.region]) {
          regionData[item.region] = {
            intensitySum: 0,
            likelihoodSum: 0,
            relevanceSum: 0,
            count: 0
          };
        }
        regionData[item.region].intensitySum += item.intensity || 0;
        regionData[item.region].likelihoodSum += item.likelihood || 0;
        regionData[item.region].relevanceSum += item.relevance || 0;
        regionData[item.region].count += 1;
      }
    });

    // Get top 5 regions by count
    const regions = Object.entries(regionData)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([region, data]) => ({
        region,
        avgIntensity: data.intensitySum / data.count,
        avgLikelihood: data.likelihoodSum / data.count,
        avgRelevance: data.relevanceSum / data.count
      }));

    return {
      labels: ['Intensity', 'Likelihood', 'Relevance'],
      datasets: regions.map((region, index) => {
        const hue = (360 / regions.length) * index;
        return {
          label: region.region,
          data: [region.avgIntensity, region.avgLikelihood, region.avgRelevance],
          backgroundColor: `hsla(${hue}, 70%, 60%, 0.2)`,
          borderColor: `hsla(${hue}, 70%, 60%, 1)`,
          pointBackgroundColor: `hsla(${hue}, 70%, 60%, 1)`,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: `hsla(${hue}, 70%, 60%, 1)`
        };
      })
    };
  };

  const processIntensityBar = () => {
    if (!data || data.length === 0) return { labels: [], datasets: [{ data: [] }] };

    // Group intensity values
    const intensityCounts = {};
    for (let i = 0; i <= 10; i++) {
      intensityCounts[i] = 0;
    }

    data.forEach(item => {
      if (item.intensity !== undefined && item.intensity !== null) {
        const intensity = Math.round(item.intensity);
        if (intensityCounts[intensity] !== undefined) {
          intensityCounts[intensity]++;
        }
      }
    });

    return {
      labels: Object.keys(intensityCounts),
      datasets: [{
        label: 'Intensity Distribution',
        data: Object.values(intensityCounts),
        backgroundColor: gradientBg,
        borderColor: 'rgba(43, 90, 252, 1)',
        borderWidth: 1
      }]
    };
  };

  const processRegionTopicChart = () => {
    if (!data || data.length === 0) return { labels: [], datasets: [] };

    const regionTopicMap = {};
    data.forEach(item => {
      if (item.region && item.topic) {
        if (!regionTopicMap[item.region]) {
          regionTopicMap[item.region] = {};
        }

        if (!regionTopicMap[item.region][item.topic]) {
          regionTopicMap[item.region][item.topic] = 0;
        }

        regionTopicMap[item.region][item.topic]++;
      }
    });

    // Get top 5 regions
    const topRegions = Object.entries(regionTopicMap)
      .sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length)
      .slice(0, 5);

    // Get the top topic for each region
    const regionTopics = topRegions.map(([region, topics]) => {
      const topTopic = Object.entries(topics)
        .sort((a, b) => b[1] - a[1])[0];

      return {
        region,
        topic: topTopic[0],
        count: topTopic[1]
      };
    });

    return {
      labels: regionTopics.map(rt => rt.region),
      datasets: [{
        data: regionTopics.map(rt => rt.count),
        backgroundColor: regionTopics.map((_, index) => {
          const hue = (360 / regionTopics.length) * index;
          return `hsla(${hue}, 70%, 60%, 0.7)`;
        }),
        borderColor: regionTopics.map((_, index) => {
          const hue = (360 / regionTopics.length) * index;
          return `hsla(${hue}, 70%, 60%, 1)`;
        }),
        borderWidth: 1,
        tooltipData: regionTopics.map(rt => rt.topic)
      }]
    };
  };

  // Chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
    cutout: '65%'
  };

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
              `Topic: ${item.label}`,
              `Sector: ${item.sector}`,
              `Intensity: ${item.x}`,
              `Likelihood: ${item.y}`,
              `Relevance: ${(item.r / 1.5).toFixed(1)}`
            ];
          }
        }
      }
    }
  };

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
        text: 'Records by Region',
        color: 'white',
        font: {
          size: 16
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
        text: 'Top Topics',
        color: 'white',
        font: {
          size: 16
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        pointLabels: {
          color: 'white',
          font: {
            size: 12
          }
        },
        ticks: {
          color: 'white',
          backdropColor: 'transparent'
        }
      }
    },
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
        text: 'Regional Metrics Comparison',
        color: 'white',
        font: {
          size: 16
        }
      }
    }
  };

  const intensityBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Intensity Value',
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
          text: 'Count',
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
        text: 'Intensity Distribution',
        color: 'white',
        font: {
          size: 16
        }
      }
    }
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
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
        text: 'Top Topics by Region',
        color: 'white',
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const regionIndex = context.dataIndex;
            const topTopic = context.chart.data.datasets[0].tooltipData[regionIndex];
            return [`Topic: ${topTopic}`, `Count: ${context.raw}`];
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          backdropColor: 'transparent'
        }
      }
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-5 text-white">
        <i className="bi bi-exclamation-circle display-4"></i>
        <p className="mt-3">No data available for visualization. Please adjust filters or load data.</p>
      </div>
    );
  }

  return (
    <div className="charts-container fade-in">
      <h4 className="text-white mb-4">Visualizations</h4>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-pie-chart"></i> Sector Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Doughnut data={processSectorDoughnut()} options={doughnutOptions} />
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
                <Bubble data={processBubbleChart()} options={bubbleOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-bar-chart"></i> Records by Region</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Bar
                  ref={barChartRef}
                  data={processRegionBar()}
                  options={barOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-diagram-3"></i> Top Topics</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Pie data={processTopicPie()} options={pieOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-reception-4"></i> Regional Metrics Comparison</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Radar data={processRadarChart()} options={radarOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-bar-chart-steps"></i> Intensity Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Bar data={processIntensityBar()} options={intensityBarOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-radar"></i> Top Topics by Region</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Radar
                  data={processRegionTopicChart()}
                  options={polarOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Charts; 