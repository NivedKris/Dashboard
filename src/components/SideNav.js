import React from 'react';
import { Nav, Image } from 'react-bootstrap';

const SideNav = ({ isOpen, activePage, onSelectPage }) => {
  return (
    <div className={`side-nav ${isOpen ? 'open' : ''}`}>
      {/* Logo and brand section */}
      <div className="side-nav-header">
        <div className="side-nav-logo">
          <Image src="/img/logo.jpeg" alt="BLACKCOFFER" width="30" height="30" roundedCircle />
          <span>BLACKCOFFER</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="nav-section-title">
        <span>Main</span>
      </div>

      <Nav className="flex-column">
        <div className="nav-item">
          <Nav.Link
            className={activePage === 'overview' ? 'active' : ''}
            onClick={() => onSelectPage('overview')}
          >
            <i className="bi bi-speedometer2"></i>
            Dashboard
          </Nav.Link>
        </div>

        <div className="nav-item">
          <Nav.Link
            className={activePage === 'regional' ? 'active' : ''}
            onClick={() => onSelectPage('regional')}
          >
            <i className="bi bi-globe"></i>
            Regional Analysis
          </Nav.Link>
        </div>

        <div className="nav-item">
          <Nav.Link
            className={activePage === 'topic' ? 'active' : ''}
            onClick={() => onSelectPage('topic')}
          >
            <i className="bi bi-diagram-3"></i>
            Topic Analysis
          </Nav.Link>
        </div>

        <div className="nav-item">
          <Nav.Link
            className={activePage === 'trend' ? 'active' : ''}
            onClick={() => onSelectPage('trend')}
          >
            <i className="bi bi-graph-up-arrow"></i>
            Trend Analysis
          </Nav.Link>
        </div>

        <div className="nav-section-title">
          <span>Insights</span>
        </div>

        <div className="nav-item">
          <Nav.Link className="disabled d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-stars"></i>
              Predictive Analytics
            </div>
            <span className="coming-soon-badge">Soon</span>
          </Nav.Link>
        </div>

        <div className="nav-item">
          <Nav.Link className="disabled d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-bezier2"></i>
              Advanced Reports
            </div>
            <span className="coming-soon-badge">Soon</span>
          </Nav.Link>
        </div>
      </Nav>
    </div>
  );
};

export default SideNav; 