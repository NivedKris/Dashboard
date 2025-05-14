from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class DataPoint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    end_year = db.Column(db.String(10))
    intensity = db.Column(db.Integer)
    sector = db.Column(db.String(100))
    topic = db.Column(db.String(100))
    insight = db.Column(db.String(255))
    url = db.Column(db.String(255))
    region = db.Column(db.String(100))
    start_year = db.Column(db.String(10))
    impact = db.Column(db.String(255))
    added = db.Column(db.String(50))
    published = db.Column(db.String(50))
    country = db.Column(db.String(100))
    relevance = db.Column(db.Integer)
    pestle = db.Column(db.String(100))
    source = db.Column(db.String(100))
    title = db.Column(db.Text)
    likelihood = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'end_year': self.end_year,
            'intensity': self.intensity,
            'sector': self.sector,
            'topic': self.topic,
            'insight': self.insight,
            'url': self.url,
            'region': self.region,
            'start_year': self.start_year,
            'impact': self.impact,
            'added': self.added,
            'published': self.published,
            'country': self.country,
            'relevance': self.relevance,
            'pestle': self.pestle,
            'source': self.source,
            'title': self.title,
            'likelihood': self.likelihood
        } 