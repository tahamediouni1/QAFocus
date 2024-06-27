from flask import Flask
from controllers.processing_controller import processing_bp
from controllers.comparison_controller import comparison_bp

app = Flask(__name__)
app.register_blueprint(processing_bp, url_prefix='/process')
app.register_blueprint(comparison_bp, url_prefix='/comparison')

if __name__ == '__main__':
    app.run(debug=True)
