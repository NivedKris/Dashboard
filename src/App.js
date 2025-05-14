import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Row, Col, Alert, Spinner, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Filters from './components/Filters';
import Charts from './components/Charts';
import DashboardSummary from './components/DashboardSummary';
import SideNav from './components/SideNav';
import RegionalAnalysis from './components/RegionalAnalysis';
import TopicAnalysis from './components/TopicAnalysis';
import TrendAnalysis from './components/TrendAnalysis';
import { fetchData, fetchFilters } from './api';
import FuturisticLoader from './components/FuturisticLoader';
import './styles.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [activePage, setActivePage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTransition, setPageTransition] = useState('fade-in');
  const [loadingMessage, setLoadingMessage] = useState("Initializing dashboard...");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Show loading animation for at least 1 second for better UX
        const startTime = Date.now();

        // Update loading message
        setLoadingMessage("Fetching filter options...");

        // Fetch filters first
        const filtersData = await fetchFilters();
        setFilters(filtersData);

        // Update loading message
        setLoadingMessage("Retrieving visualization data...");

        // Fetch data
        const responseData = await fetchData();

        // Update loading message
        setLoadingMessage("Preparing dashboard interface...");

        // Ensure loading spinner shows for at least 1 second
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < 1500) {
          await new Promise(resolve => setTimeout(resolve, 1500 - elapsedTime));
        }

        setData(responseData);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters handler
  const handleApplyFilters = async (newFilters) => {
    try {
      setLoading(true);
      setError(null);
      setAppliedFilters(newFilters);

      // Add shimmer effect before loading
      setPageTransition('scale-in');

      // Update loading message
      setLoadingMessage("Applying filters...");

      // Show loading for at least 500ms for better UX
      const startTime = Date.now();

      const filteredData = await fetchData(newFilters);

      // Ensure loading spinner shows for at least 500ms
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsedTime));
      }

      setData(filteredData);
    } catch (err) {
      setError('Failed to apply filters. Please try again.');
      console.error('Error applying filters:', err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);

    // If opening sidebar on mobile, prevent body scroll
    if (isMobile) {
      document.body.style.overflow = !sidebarOpen ? 'hidden' : '';
    }
  };

  // Change active page with animation
  const changePage = (page) => {
    setPageTransition('fade-out');

    // Short delay for animation
    setTimeout(() => {
      setActivePage(page);
      setPageTransition('fade-in');
    }, 300);

    // Close sidebar on mobile when page changes
    if (isMobile) {
      setSidebarOpen(false);
      document.body.style.overflow = '';
    }
  };

  // Render active page content
  const renderPage = () => {
    switch (activePage) {
      case 'regional':
        return <RegionalAnalysis data={data} />;
      case 'topic':
        return <TopicAnalysis data={data} />;
      case 'trend':
        return <TrendAnalysis data={data} />;
      case 'overview':
      default:
        return <DashboardSummary data={data} />;
    }
  };

  return (
    <div id="dashboard-app" className="futuristic-grid">
      {/* Navbar - only visible when sidebar is closed */}
      <Navbar bg="dark" variant="dark" expand="lg" className={`navbar-top ${sidebarOpen ? 'd-none d-lg-flex' : ''}`}>
        <Container fluid>
          <Navbar.Brand href="#home">
            <Image src="/img/logo.jpeg" alt="BLACKCOFFER" height="30" className="d-inline-block align-top me-2" roundedCircle />
            <span className="ms-2">BLACKCOFFER</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#about">
                <i className="bi bi-info-circle"></i> About
              </Nav.Link>
              <Nav.Link href="#settings">
                <i className="bi bi-gear"></i> Settings
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Toggle sidebar button */}
      <div className="toggle-sidebar" onClick={toggleSidebar}>
        <i className={`bi ${sidebarOpen ? 'bi-x' : 'bi-list'}`}></i>
      </div>

      {/* Side navigation */}
      <SideNav
        isOpen={sidebarOpen}
        activePage={activePage}
        onSelectPage={changePage}
      />

      {/* Overlay when sidebar is open on mobile */}
      {isMobile && (
        <div
          className={`side-nav-overlay ${sidebarOpen ? 'active' : ''}`}
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className={`content-with-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Container fluid className="py-4">
          {/* Error alert */}
          {error && (
            <Alert variant="danger" className="mb-4 fade-in">
              <i className="bi bi-exclamation-triangle me-2"></i> {error}
            </Alert>
          )}

          {/* Filters section */}
          <div className="filters-section">
            <Filters
              filters={filters}
              onApplyFilters={handleApplyFilters}
              appliedFilters={appliedFilters}
            />
          </div>

          {/* Loading indicator */}
          {loading ? (
            <FuturisticLoader message={loadingMessage} />
          ) : (
            <div className={pageTransition}>
              {/* Render the active page content */}
              {renderPage()}
            </div>
          )}

          {/* Footer */}
          <footer className="dashboard-footer">
            <span>BLACKCOFFER © {new Date().getFullYear()}</span>
          </footer>
        </Container>
      </div>
    </div>
  );
}

export default App; 