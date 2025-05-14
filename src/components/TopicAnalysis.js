import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Doughnut, Bar, Bubble, HeatMap } from 'react-chartjs-2';

const TopicAnalysis = ({ data }) => {
  const barChartRef = useRef(null);
  const [gradientBg, setGradientBg] = useState(null);
  const [topicUrls, setTopicUrls] = useState([]);

  // Create gradient for charts
  useEffect(() => {
    if (barChartRef.current) {
      const ctx = barChartRef.current.canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 208, 255, 0.7)');
        gradient.addColorStop(1, 'rgba(43, 90, 252, 0.3)');
        setGradientBg(gradient);
      }
    }
  }, []);

  // Extract relevant URLs for each topic
  useEffect(() => {
    if (data && data.length > 0) {
      const urlsByTopic = {};

      // Group URLs by topic
      data.forEach(item => {
        if (item.topic && item.url) {
          if (!urlsByTopic[item.topic]) {
            urlsByTopic[item.topic] = [];
          }

          // Add URL if it's not already in the array
          const urlEntry = {
            url: item.url,
            title: item.title || 'No title',
            source: item.source || 'Unknown source',
            insight: item.insight || ''
          };

          // Check if URL is already in the array
          const exists = urlsByTopic[item.topic].some(entry => entry.url === item.url);
          if (!exists) {
            urlsByTopic[item.topic].push(urlEntry);
          }
        }
      });

      // Convert to array and sort by topics with most URLs
      const topics = Object.keys(urlsByTopic);
      const topicUrlArray = topics.map(topic => ({
        topic,
        urls: urlsByTopic[topic]
      })).sort((a, b) => b.urls.length - a.urls.length).slice(0, 10); // Top 10 topics

      setTopicUrls(topicUrlArray);
    }
  }, [data]);

  // Process data for topic analysis
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        topicDistribution: {
          labels: [],
          datasets: []
        },
        topicsByIntensity: {
          labels: [],
          datasets: []
        },
        topicBubble: {
          datasets: []
        },
        topicSectorMap: {
          labels: [],
          datasets: []
        }
      };
    }

    // Topic distribution data
    const topicCounts = {};
    data.forEach(item => {
      if (item.topic) {
        if (!topicCounts[item.topic]) {
          topicCounts[item.topic] = 0;
        }
        topicCounts[item.topic] += 1;
      }
    });

    const topics = Object.keys(topicCounts);
    const counts = topics.map(topic => topicCounts[topic]);

    // Generate colors for each topic
    const backgroundColors = topics.map((_, index) => {
      const hue = (360 / topics.length) * index;
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    });

    // Topics by intensity
    const topicIntensityMap = {};
    data.forEach(item => {
      if (item.topic && item.intensity) {
        if (!topicIntensityMap[item.topic]) {
          topicIntensityMap[item.topic] = {
            intensitySum: 0,
            count: 0
          };
        }
        topicIntensityMap[item.topic].intensitySum += item.intensity;
        topicIntensityMap[item.topic].count += 1;
      }
    });

    // Get top 10 topics by count
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);

    const topicIntensities = topTopics.map(topic =>
      topicIntensityMap[topic] ? topicIntensityMap[topic].intensitySum / topicIntensityMap[topic].count : 0
    );

    // Topic bubble chart data (intensity vs likelihood vs relevance)
    const bubbleData = data
      .filter(item => item.topic && item.intensity && item.likelihood && item.relevance)
      .map(item => ({
        x: item.intensity,
        y: item.likelihood,
        r: Math.max(3, item.relevance * 1.5), // Scale for better visualization
        topic: item.topic,
        sector: item.sector
      }));

    // Topic and sector relationship
    const topicSectorRelation = {};
    data.forEach(item => {
      if (item.topic && item.sector) {
        if (!topicSectorRelation[item.topic]) {
          topicSectorRelation[item.topic] = {};
        }
        if (!topicSectorRelation[item.topic][item.sector]) {
          topicSectorRelation[item.topic][item.sector] = 0;
        }
        topicSectorRelation[item.topic][item.sector] += 1;
      }
    });

    // Get top 5 topics and top 5 sectors
    const topTopicsBySector = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    const sectorCounts = {};
    data.forEach(item => {
      if (item.sector) {
        sectorCounts[item.sector] = (sectorCounts[item.sector] || 0) + 1;
      }
    });

    const topSectors = Object.entries(sectorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);

    // Create relationship matrix data
    const relationshipData = topTopicsBySector.map(topic => {
      return topSectors.map(sector => {
        return topicSectorRelation[topic] && topicSectorRelation[topic][sector]
          ? topicSectorRelation[topic][sector]
          : 0;
      });
    });

    return {
      topicDistribution: {
        labels: topics,
        datasets: [{
          label: 'Topics Distribution',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
          hoverOffset: 10
        }]
      },
      topicsByIntensity: {
        labels: topTopics,
        datasets: [{
          label: 'Average Intensity by Topic',
          data: topicIntensities,
          backgroundColor: gradientBg || 'rgba(0, 208, 255, 0.6)',
          borderColor: 'rgba(0, 208, 255, 1)',
          borderWidth: 1
        }]
      },
      topicBubble: {
        datasets: [{
          label: 'Topic Analysis (Intensity vs Likelihood)',
          data: bubbleData,
          backgroundColor: bubbleData.map(item => {
            // Generate color based on topic
            const topicIndex = topics.indexOf(item.topic);
            const hue = (360 / topics.length) * (topicIndex >= 0 ? topicIndex : 0);
            return `hsla(${hue}, 70%, 60%, 0.7)`;
          }),
          borderColor: 'rgba(0, 208, 255, 1)',
        }]
      },
      topicSectorMap: {
        xLabels: topSectors,
        yLabels: topTopicsBySector,
        data: relationshipData
      }
    };
  }, [data, gradientBg]);

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
          padding: 15,
          boxWidth: 12
        }
      },
      title: {
        display: true,
        text: 'Topics Distribution',
        color: 'white',
        font: {
          size: 16
        }
      },
    },
    cutout: '60%'
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
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
        text: 'Top 10 Topics by Intensity',
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

  const bubbleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Topic Analysis (Intensity vs Likelihood)',
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
              `Topic: ${item.topic || 'N/A'}`,
              `Sector: ${item.sector || 'N/A'}`,
              `Intensity: ${item.x}`,
              `Likelihood: ${item.y}`,
              `Relevance: ${(item.r / 1.5).toFixed(1)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Intensity',
          color: 'white'
        },
        min: 0,
        max: 10,
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
        min: 0,
        max: 10,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  // Open URL in new tab
  const openUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Render topic sources table
  const renderTopicSources = () => {
    if (!topicUrls || topicUrls.length === 0) {
      return (
        <div className="text-center p-3">
          <p className="text-white">No source URLs available for current topics.</p>
        </div>
      );
    }

    return (
      <div className="topic-sources">
        <Table responsive variant="dark" className="custom-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Source</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {topicUrls.flatMap((topicData, index) =>
              topicData.urls.slice(0, 3).map((urlData, urlIndex) => (
                <tr key={`${index}-${urlIndex}`}>
                  {urlIndex === 0 ? (
                    <td rowSpan={Math.min(3, topicData.urls.length)} className="topic-cell">
                      {topicData.topic}
                      <span className="badge bg-info ms-2">{topicData.urls.length}</span>
                    </td>
                  ) : null}
                  <td>{urlData.source}</td>
                  <td className="title-cell" title={urlData.title}>
                    {urlData.title.length > 60 ? `${urlData.title.substring(0, 60)}...` : urlData.title}
                  </td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => openUrl(urlData.url)}
                    >
                      <i className="bi bi-link-45deg"></i> Open
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center p-5 text-white">
        <i className="bi bi-exclamation-circle display-4"></i>
        <p className="mt-3">No data available for topic analysis. Please adjust filters or load data.</p>
      </div>
    );
  }

  // Render topic-sector matrix manually since Chart.js doesn't have built-in heatmap
  const renderTopicSectorMatrix = () => {
    if (!chartData.topicSectorMap.data || chartData.topicSectorMap.data.length === 0) {
      return <div className="text-center p-5">No relationship data available</div>;
    }

    const maxValue = Math.max(...chartData.topicSectorMap.data.flatMap(arr => arr));

    return (
      <div className="topic-sector-matrix">
        <div className="matrix-row header-row">
          <div className="matrix-cell corner-cell"></div>
          {chartData.topicSectorMap.xLabels.map((sector, i) => (
            <div key={`header-${i}`} className="matrix-cell header-cell">
              {sector}
            </div>
          ))}
        </div>

        {chartData.topicSectorMap.yLabels.map((topic, rowIndex) => (
          <div key={`row-${rowIndex}`} className="matrix-row">
            <div className="matrix-cell header-cell">{topic}</div>
            {chartData.topicSectorMap.data[rowIndex].map((value, colIndex) => {
              const intensity = value / maxValue;
              const backgroundColor = value > 0
                ? `rgba(0, 208, 255, ${Math.max(0.1, intensity.toFixed(2))})`
                : 'rgba(43, 51, 70, 0.5)';

              return (
                <div
                  key={`cell-${rowIndex}-${colIndex}`}
                  className="matrix-cell data-cell"
                  style={{ backgroundColor }}
                  title={`${topic} × ${chartData.topicSectorMap.xLabels[colIndex]}: ${value} entries`}
                >
                  {value > 0 ? value : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <h4 className="text-white mb-4">Topic Analysis</h4>

      <style jsx="true">{`
        .topic-sector-matrix {
          background: rgba(13, 28, 50, 0.4);
          border-radius: 10px;
          overflow: hidden;
          color: white;
        }
        .matrix-row {
          display: flex;
        }
        .matrix-cell {
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 60px;
          min-height: 60px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 12px;
          text-align: center;
        }
        .header-cell {
          background: rgba(43, 90, 252, 0.2);
          font-weight: 500;
        }
        .corner-cell {
          background: rgba(0, 0, 0, 0.2);
        }
        .data-cell {
          transition: all 0.2s ease;
        }
        .data-cell:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(0, 208, 255, 0.5);
          z-index: 1;
        }
        .custom-table {
          background: rgba(13, 28, 50, 0.4);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .custom-table th {
          background: rgba(43, 90, 252, 0.2);
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .custom-table td {
          border-color: rgba(255, 255, 255, 0.05);
        }
        
        .topic-cell {
          background: rgba(0, 208, 255, 0.1);
          font-weight: 500;
        }
        
        .title-cell {
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-pie-chart"></i> Topics Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Doughnut data={chartData.topicDistribution} options={doughnutOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-bar-chart-steps"></i> Top Topics by Intensity</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Bar
                  ref={barChartRef}
                  data={chartData.topicsByIntensity}
                  options={barOptions}
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
              <h5><i className="bi bi-circle"></i> Topic Analysis (Intensity vs Likelihood)</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Bubble data={chartData.topicBubble} options={bubbleOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-grid-3x3"></i> Topic-Sector Relationship Matrix</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative', overflowY: 'auto' }}>
                {renderTopicSectorMatrix()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5><i className="bi bi-link"></i> Topic Source URLs</h5>
            </Card.Header>
            <Card.Body>
              {renderTopicSources()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TopicAnalysis; 