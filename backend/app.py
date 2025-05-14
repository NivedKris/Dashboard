from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, DataPoint
import os
from load_data import load_data

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
CORS(app)

# Helper function to parse year values
def parse_year(year_value):
    if not year_value:
        return None
    
    try:
        # Try to convert to integer
        return int(year_value)
    except (ValueError, TypeError):
        return None

@app.route('/api/data', methods=['GET'])
def get_data():
    query = DataPoint.query
    
    # Apply filters from the request parameters
    if request.args.get('end_year'):
        query = query.filter(DataPoint.end_year == request.args.get('end_year'))
    if request.args.get('start_year'):
        query = query.filter(DataPoint.start_year == request.args.get('start_year'))
    if request.args.get('topic'):
        query = query.filter(DataPoint.topic == request.args.get('topic'))
    if request.args.get('sector'):
        query = query.filter(DataPoint.sector == request.args.get('sector'))
    if request.args.get('region'):
        query = query.filter(DataPoint.region == request.args.get('region'))
    if request.args.get('pestle'):
        query = query.filter(DataPoint.pestle == request.args.get('pestle'))
    if request.args.get('source'):
        query = query.filter(DataPoint.source == request.args.get('source'))
    if request.args.get('country'):
        query = query.filter(DataPoint.country == request.args.get('country'))
    
    # Add numeric filters
    if request.args.get('min_intensity'):
        query = query.filter(DataPoint.intensity >= float(request.args.get('min_intensity')))
    if request.args.get('min_likelihood'):
        query = query.filter(DataPoint.likelihood >= float(request.args.get('min_likelihood')))
    if request.args.get('min_relevance'):
        query = query.filter(DataPoint.relevance >= float(request.args.get('min_relevance')))
    
    # Get all matching data points
    data_points = query.all()
    
    # Convert to list of dictionaries
    result = [dp.to_dict() for dp in data_points]
    
    return jsonify(result)

@app.route('/api/filters', methods=['GET'])
def get_filters():
    """Return unique values for each filter field"""
    start_years = [year[0] for year in db.session.query(DataPoint.start_year).distinct() if year[0]]
    end_years = [year[0] for year in db.session.query(DataPoint.end_year).distinct() if year[0]]
    topics = [topic[0] for topic in db.session.query(DataPoint.topic).distinct() if topic[0]]
    sectors = [sector[0] for sector in db.session.query(DataPoint.sector).distinct() if sector[0]]
    regions = [region[0] for region in db.session.query(DataPoint.region).distinct() if region[0]]
    pestles = [pestle[0] for pestle in db.session.query(DataPoint.pestle).distinct() if pestle[0]]
    sources = [source[0] for source in db.session.query(DataPoint.source).distinct() if source[0]]
    countries = [country[0] for country in db.session.query(DataPoint.country).distinct() if country[0]]

    # Combine start and end years for the years filter
    all_years = sorted(list(set(start_years + end_years)))
    # Convert years to integers where possible for proper sorting
    numeric_years = []
    for year in all_years:
        parsed = parse_year(year)
        if parsed is not None:
            numeric_years.append(str(parsed))  # Convert back to string for JSON

    # Sort years numerically
    numeric_years.sort(key=lambda y: int(y) if y.isdigit() else float('inf'))

    return jsonify({
        'years': numeric_years,
        'topics': sorted(topics),
        'sectors': sorted(sectors),
        'regions': sorted(regions),
        'pestles': sorted(pestles),
        'sources': sorted(sources),
        'countries': sorted(countries)
    })

@app.route('/api/intensity', methods=['GET'])
def get_intensity_data():
    """Get aggregated intensity data for charts"""
    data = []
    for dp in DataPoint.query.all():
        # Try end_year first, then start_year
        end_year = parse_year(dp.end_year)
        start_year = parse_year(dp.start_year)
        
        # Use end_year if available, otherwise use start_year
        # Convert to string for JSON serialization or use "Unknown"
        year = str(end_year) if end_year is not None else (
            str(start_year) if start_year is not None else "Unknown"
        )
        
        data.append({
            'intensity': dp.intensity,
            'likelihood': dp.likelihood,
            'relevance': dp.relevance, 
            'year': year,
            'start_year': str(start_year) if start_year is not None else None,
            'end_year': str(end_year) if end_year is not None else None,
            'country': dp.country,
            'topic': dp.topic,
            'region': dp.region,
            'sector': dp.sector
        })
    return jsonify(data)

# Initialize database and load data when the app starts
with app.app_context():
    db.create_all()
    load_data(app)

if __name__ == '__main__':
    app.run(debug=True) 