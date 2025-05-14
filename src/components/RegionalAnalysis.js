import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Row, Col, Card, Table, Button } from 'react-bootstrap';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';

const RegionalAnalysis = ({ data }) => {
  const barChartRef = useRef(null);
  const [gradientBg, setGradientBg] = useState(null);
  const [regionUrls, setRegionUrls] = useState([]);

  // Create gradient for charts
  useEffect(() => {
    if (barChartRef.current) {
      const ctx = barChartRef.current.canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(43, 90, 252, 0.7)');
        gradient.addColorStop(1, 'rgba(0, 208, 255, 0.3)');
        setGradientBg(gradient);
      }
    }
  }, []);

  // Extract relevant URLs for each region
  useEffect(() => {
    if (data && data.length > 0) {
      const urlsByRegion = {};

      // Group URLs by region
      data.forEach(item => {
        if (item.region && item.url) {
          if (!urlsByRegion[item.region]) {
            urlsByRegion[item.region] = [];
          }

          // Add URL if it's not already in the array
          const urlEntry = {
            url: item.url,
            title: item.title || 'No title',
            source: item.source || 'Unknown source',
            country: item.country || 'Unknown country',
            insight: item.insight || ''
          };

          // Check if URL is already in the array
          const exists = urlsByRegion[item.region].some(entry => entry.url === item.url);
          if (!exists) {
            urlsByRegion[item.region].push(urlEntry);
          }
        }
      });

      // Convert to array and sort by regions with most URLs
      const regions = Object.keys(urlsByRegion);
      const regionUrlArray = regions.map(region => ({
        region,
        urls: urlsByRegion[region]
      })).sort((a, b) => b.urls.length - a.urls.length).slice(0, 10); // Top 10 regions

      setRegionUrls(regionUrlArray);
    }
  }, [data]);

  // Process data for regional analysis
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        regionIntensity: {
          labels: [],
          datasets: []
        },
        regionDistribution: {
          labels: [],
          datasets: []
        },
        topCountriesByRegion: {
          labels: [],
          datasets: []
        },
        regionMetrics: {
          labels: [],
          datasets: []
        }
      };
    }

    // Region intensity data
    const regionIntensityMap = {};
    data.forEach(item => {
      if (item.region) {
        if (!regionIntensityMap[item.region]) {
          regionIntensityMap[item.region] = {
            intensitySum: 0,
            likelihoodSum: 0,
            relevanceSum: 0,
            count: 0
          };
        }
        regionIntensityMap[item.region].intensitySum += item.intensity || 0;
        regionIntensityMap[item.region].likelihoodSum += item.likelihood || 0;
        regionIntensityMap[item.region].relevanceSum += item.relevance || 0;
        regionIntensityMap[item.region].count += 1;
      }
    });

    const regions = Object.keys(regionIntensityMap);
    const avgIntensities = regions.map(region =>
      regionIntensityMap[region].intensitySum / regionIntensityMap[region].count
    );

    // Region distribution data
    const regionCounts = regions.map(region => regionIntensityMap[region].count);
    const backgroundColors = regions.map((_, index) => {
      const hue = (360 / regions.length) * index;
      return `hsla(${hue}, 70%, 60%, 0.7)`;
    });

    // Top countries by region
    const regionCountryMap = {};
    data.forEach(item => {
      if (item.region && item.country) {
        if (!regionCountryMap[item.region]) {
          regionCountryMap[item.region] = {};
        }
        if (!regionCountryMap[item.region][item.country]) {
          regionCountryMap[item.region][item.country] = 0;
        }
        regionCountryMap[item.region][item.country] += 1;
      }
    });

    // Get top 3 regions by count
    const topRegions = Object.entries(regionIntensityMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(entry => entry[0]);

    const topRegionDatasets = topRegions.map((region, index) => {
      // Get top 5 countries for this region
      const countries = Object.keys(regionCountryMap[region] || {});
      const countryCounts = countries.map(country => regionCountryMap[region][country]);

      // Sort countries by count
      const countryData = countries.map((country, i) => ({
        country,
        count: countryCounts[i]
      })).sort((a, b) => b.count - a.count).slice(0, 5);

      const hue = (360 / topRegions.length) * index;

      return {
        label: region,
        data: countryData.map(d => d.count),
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.7)`,
        borderColor: `hsla(${hue}, 70%, 60%, 1)`,
        borderWidth: 1
      };
    });

    // Regional metrics radar chart
    const topMetricRegions = Object.entries(regionIntensityMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(entry => entry[0]);

    const regionMetricsDatasets = topMetricRegions.map((region, index) => {
      const hue = (360 / topMetricRegions.length) * index;
      return {
        label: region,
        data: [
          regionIntensityMap[region].intensitySum / regionIntensityMap[region].count,
          regionIntensityMap[region].likelihoodSum / regionIntensityMap[region].count,
          regionIntensityMap[region].relevanceSum / regionIntensityMap[region].count,
          regionIntensityMap[region].count / Math.max(...Object.values(regionIntensityMap).map(r => r.count)) * 10
        ],
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.2)`,
        borderColor: `hsla(${hue}, 70%, 60%, 1)`,
        pointBackgroundColor: `hsla(${hue}, 70%, 60%, 1)`,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: `hsla(${hue}, 70%, 60%, 1)`
      };
    });

    return {
      regionIntensity: {
        labels: regions,
        datasets: [{
          label: 'Average Intensity by Region',
          data: avgIntensities,
          backgroundColor: gradientBg || 'rgba(43, 90, 252, 0.6)',
          borderColor: 'rgba(43, 90, 252, 1)',
          borderWidth: 1
        }]
      },
      regionDistribution: {
        labels: regions,
        datasets: [{
          label: 'Data Points by Region',
          data: regionCounts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      topCountriesByRegion: {
        labels: topRegionDatasets[0] ?
          Object.keys(regionCountryMap[topRegions[0]])
            .sort((a, b) => regionCountryMap[topRegions[0]][b] - regionCountryMap[topRegions[0]][a])
            .slice(0, 5) : [],
        datasets: topRegionDatasets
      },
      regionMetrics: {
        labels: ['Intensity', 'Likelihood', 'Relevance', 'Data Volume'],
        datasets: regionMetricsDatasets
      }
    };
  }, [data, gradientBg]);

  // Chart options
  const barOptions = {
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
        text: 'Average Intensity by Region',
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
          padding: 15,
          boxWidth: 12
        }
      },
      title: {
        display: true,
        text: 'Data Distribution by Region',
        color: 'white',
        font: {
          size: 16
        }
      },
    },
  };

  const barOptions2 = {
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
        text: 'Top Countries by Region',
        color: 'white',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        stacked: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      y: {
        stacked: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
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

  // Open URL in new tab
  const openUrl = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Render region sources table
  const renderRegionSources = () => {
    if (!regionUrls || regionUrls.length === 0) {
      return (
        <div className="text-center p-3">
          <p className="text-white">No source URLs available for current regions.</p>
        </div>
      );
    }

    return (
      <div className="region-sources">
        <Table responsive variant="dark" className="custom-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Country</th>
              <th>Source</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {regionUrls.flatMap((regionData, index) =>
              regionData.urls.slice(0, 2).map((urlData, urlIndex) => (
                <tr key={`${index}-${urlIndex}`}>
                  {urlIndex === 0 ? (
                    <td rowSpan={Math.min(2, regionData.urls.length)} className="region-cell">
                      {regionData.region}
                      <span className="badge bg-primary ms-2">{regionData.urls.length}</span>
                    </td>
                  ) : null}
                  <td>{urlData.country}</td>
                  <td>{urlData.source}</td>
                  <td className="title-cell" title={urlData.title}>
                    {urlData.title.length > 50 ? `${urlData.title.substring(0, 50)}...` : urlData.title}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
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
        <p className="mt-3">No data available for regional analysis. Please adjust filters or load data.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h4 className="text-white mb-4">Regional Analysis</h4>

      <style jsx="true">{`
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
        
        .region-cell {
          background: rgba(43, 90, 252, 0.1);
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
              <h5><i className="bi bi-bar-chart"></i> Intensity by Region</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Bar
                  ref={barChartRef}
                  data={chartData.regionIntensity}
                  options={barOptions}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-pie-chart"></i> Region Distribution</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Pie data={chartData.regionDistribution} options={pieOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-bar-chart-steps"></i> Top Countries by Region</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Bar data={chartData.topCountriesByRegion} options={barOptions2} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100">
            <Card.Header>
              <h5><i className="bi bi-reception-4"></i> Regional Metrics Comparison</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '350px', position: 'relative' }}>
                <Radar data={chartData.regionMetrics} options={radarOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12} className="mb-4">
          <Card>
            <Card.Header>
              <h5><i className="bi bi-link"></i> Region Source URLs</h5>
            </Card.Header>
            <Card.Body>
              {renderRegionSources()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default RegionalAnalysis; 