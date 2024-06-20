from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200), nullable=True)
    test_files = db.Column(db.Text, nullable=True)

# Initialize the database
def init_db(app):
    with app.app_context():
        db.init_app(app)
        db.create_all()
