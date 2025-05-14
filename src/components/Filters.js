import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Collapse } from 'react-bootstrap';

const Filters = ({ filters, onApplyFilters, appliedFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState({});
  const [shimmerEffect, setShimmerEffect] = useState(false);

  // Initialize local filters from applied filters
  useEffect(() => {
    setLocalFilters(appliedFilters || {});
  }, [appliedFilters]);

  const handleFilterChange = (filterName, value) => {
    setLocalFilters({
      ...localFilters,
      [filterName]: value
    });
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    onApplyFilters({});
    setShimmerEffect(true);
    setTimeout(() => setShimmerEffect(false), 1000);
  };

  const handleApplyFilters = () => {
    // Remove empty filters
    const filtersToApply = Object.fromEntries(
      Object.entries(localFilters).filter(([_, value]) => value !== '')
    );

    onApplyFilters(filtersToApply);
    setShimmerEffect(true);
    setTimeout(() => setShimmerEffect(false), 1000);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!filters || Object.keys(filters).length === 0) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <div className="shimmer"><i className="bi bi-funnel me-2"></i> Loading filters...</div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className={`mb-4 ${shimmerEffect ? 'shimmer' : ''}`}>
      <Card.Header className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0">
          <i className="bi bi-sliders"></i> Dashboard Filters
        </h5>
        <Button
          variant="link"
          className="p-0 text-decoration-none"
          onClick={toggleExpand}
          aria-expanded={isExpanded}
        >
          <i className={`bi bi-${isExpanded ? 'chevron-up' : 'chevron-down'}`}></i>
        </Button>
      </Card.Header>

      <Card.Body>
        <Row className="g-3 mb-3">
          {/* Always visible filters */}
          <Col md={4} sm={6}>
            <div className="filter-group">
              <label className="filter-label">
                <i className="bi bi-globe"></i> Region
              </label>
              <Form.Select
                value={localFilters.region || ''}
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <option value="">All Regions</option>
                {filters.regions?.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </Form.Select>
            </div>
          </Col>

          <Col md={4} sm={6}>
            <div className="filter-group">
              <label className="filter-label">
                <i className="bi bi-building"></i> Sector
              </label>
              <Form.Select
                value={localFilters.sector || ''}
                onChange={(e) => handleFilterChange('sector', e.target.value)}
              >
                <option value="">All Sectors</option>
                {filters.sectors?.map((sector) => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </Form.Select>
            </div>
          </Col>

          <Col md={4} sm={6}>
            <div className="filter-group">
              <label className="filter-label">
                <i className="bi bi-tag"></i> Topic
              </label>
              <Form.Select
                value={localFilters.topic || ''}
                onChange={(e) => handleFilterChange('topic', e.target.value)}
              >
                <option value="">All Topics</option>
                {filters.topics?.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </Form.Select>
            </div>
          </Col>
        </Row>

        {/* Expandable filters */}
        <Collapse in={isExpanded}>
          <div>
            <Row className="g-3 mb-3">
              <Col md={4} sm={6}>
                <div className="filter-group">
                  <label className="filter-label">
                    <i className="bi bi-calendar"></i> Year
                  </label>
                  <Form.Select
                    value={localFilters.end_year || ''}
                    onChange={(e) => handleFilterChange('end_year', e.target.value)}
                  >
                    <option value="">All Years</option>
                    {filters.years?.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </div>
              </Col>

              <Col md={4} sm={6}>
                <div className="filter-group">
                  <label className="filter-label">
                    <i className="bi bi-flag"></i> Country
                  </label>
                  <Form.Select
                    value={localFilters.country || ''}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                  >
                    <option value="">All Countries</option>
                    {filters.countries?.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </Form.Select>
                </div>
              </Col>

              <Col md={4} sm={6}>
                <div className="filter-group">
                  <label className="filter-label">
                    <i className="bi bi-grid"></i> PESTLE
                  </label>
                  <Form.Select
                    value={localFilters.pestle || ''}
                    onChange={(e) => handleFilterChange('pestle', e.target.value)}
                  >
                    <option value="">All PESTLE Categories</option>
                    {filters.pestles?.map((pestle) => (
                      <option key={pestle} value={pestle}>{pestle}</option>
                    ))}
                  </Form.Select>
                </div>
              </Col>

              <Col md={4} sm={6}>
                <div className="filter-group">
                  <label className="filter-label">
                    <i className="bi bi-bar-chart"></i> Min. Intensity
                  </label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="10"
                    value={localFilters.min_intensity || ''}
                    onChange={(e) => handleFilterChange('min_intensity', e.target.value)}
                    placeholder="Min Value"
                  />
                </div>
              </Col>

              <Col md={4} sm={6}>
                <div className="filter-group">
                  <label className="filter-label">
                    <i className="bi bi-percent"></i> Min. Likelihood
                  </label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="5"
                    value={localFilters.min_likelihood || ''}
                    onChange={(e) => handleFilterChange('min_likelihood', e.target.value)}
                    placeholder="Min Value"
                  />
                </div>
              </Col>

              <Col md={4} sm={6}>
                <div className="filter-group">
                  <label className="filter-label">
                    <i className="bi bi-bullseye"></i> Min. Relevance
                  </label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="7"
                    value={localFilters.min_relevance || ''}
                    onChange={(e) => handleFilterChange('min_relevance', e.target.value)}
                    placeholder="Min Value"
                  />
                </div>
              </Col>
            </Row>
          </div>
        </Collapse>

        <div className="d-flex justify-content-between mt-2">
          <Button
            variant="outline-primary"
            onClick={handleResetFilters}
            className="d-flex align-items-center"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i> Reset
          </Button>
          <Button
            variant="primary"
            onClick={handleApplyFilters}
            className="d-flex align-items-center"
          >
            <i className="bi bi-funnel-fill me-1"></i> Apply Filters
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Filters; 