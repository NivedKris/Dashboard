# BLACKCOFFER Dashboard

A full-stack data visualization dashboard built with Flask (backend) and React (frontend) to analyze and visualize data trends.

## Features

- Interactive data visualizations using Chart.js
- Multiple chart types: Bar charts, Line charts, Pie charts, Radar charts, Scatter plots
- Regional analysis with interactive visualizations
- Topic analysis with importance metrics
- Trend analysis showing data patterns over time
- Source URL access for direct reference to original content
- Filter data by various criteria: Year, Topic, Sector, Region, PEST, Source, Country
- Dashboard summary with key metrics
- Responsive design with mobile-friendly interface
- Futuristic UI with modern animations and styling

## Project Structure

```
/dashboard-app
  /backend           # Flask API
    app.py           # Main Flask application
    models.py        # Database models
    load_data.py     # Script to load data
    requirements.txt # Python dependencies
    jsondata.json    # Sample data
  /frontend          # React frontend
    /public
      /img           # Image assets including logo
    /src
      /components    # React components
      App.js         # Main React component
      api.js         # API client
      styles.css     # Custom styling
```

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory
   ```
   cd dashboard-app/backend
   ```

2. Create a virtual environment (optional but recommended)
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Initialize the database and load sample data
   ```
   python load_data.py
   ```

5. Start the Flask API server
   ```
   python app.py
   ```

The Flask API will run on http://localhost:5000

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory
   ```
   cd dashboard-app/frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```

The React application will run on http://localhost:3000

## Quick Start

For convenience, you can use the included start script to launch both the backend and frontend:

```
cd dashboard-app
./start.sh
```

## API Endpoints

- `GET /api/data` - Get filtered data
- `GET /api/filters` - Get unique values for filter fields
- `GET /api/intensity` - Get data formatted for intensity charts
- `GET /api/topic/{topic}` - Get detailed information about a specific topic
- `GET /api/region/{region}` - Get detailed information about a specific region

## Main Dashboard Sections

1. **Dashboard Overview** - Key metrics and summary statistics
2. **Regional Analysis** - Data trends by geographic region
3. **Topic Analysis** - Data categorized by topics
4. **Trend Analysis** - Time-based trends and patterns

## License

MIT 
