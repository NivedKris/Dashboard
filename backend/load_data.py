import json
import os
from models import db, DataPoint

def load_data(app):
    # Check if database already has data
    with app.app_context():
        if DataPoint.query.first() is not None:
            print("Database already contains data. Skipping data load.")
            return
        
        # Load JSON data
        json_path = os.path.join(os.path.dirname(__file__), 'jsondata.json')
        with open(json_path, 'r') as f:
            data = json.load(f)
        
        # Insert data into database
        for item in data:
            # Convert empty strings to None for end_year and start_year
            if 'end_year' in item and item['end_year'] == '':
                item['end_year'] = None
            if 'start_year' in item and item['start_year'] == '':
                item['start_year'] = None
                
            data_point = DataPoint(**item)
            db.session.add(data_point)
        
        db.session.commit()
        print(f"Successfully loaded {len(data)} records into the database.")

if __name__ == '__main__':
    from app import app
    with app.app_context():
        db.create_all()
        load_data(app) 