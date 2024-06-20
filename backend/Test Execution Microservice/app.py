import os
from flask import Flask, render_template, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from functools import wraps
from automation.recorder import Recorder
from automation.test_runner import TestRunner
from automation.screen_recorder import ScreenRecorder
import threading
from flask_cors import CORS
from models import db, Project, init_db
from flask_migrate import Migrate



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://test_user:test_password@localhost:3306/test_database'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})

def roles_required(required_roles):
    def decorator(func):
        @wraps(func)
        @jwt_required()
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            if 'role' not in identity or identity['role'] not in required_roles:
                return jsonify({'message': 'Permission denied'}), 403
            return func(*args, **kwargs)
        return wrapper
    return decorator

recorder = None
screen_recorder = None
recorder_lock = threading.Lock()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/projects', methods=['POST'])
def create_project():
    data = request.json
    new_project = Project(name=data['name'], description=data['description'])
    db.session.add(new_project)
    db.session.commit()
    return jsonify({'id': new_project.id, 'name': new_project.name, 'description': new_project.description}), 201

@app.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([{'id': project.id, 'name': project.name, 'description': project.description} for project in projects]), 200

@app.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify({'id': project.id, 'name': project.name, 'description': project.description, 'test_files': project.test_files}), 200


@app.route('/start', methods=['POST'])
def start():
    global recorder, screen_recorder
    data = request.get_json()
    url = data.get('url')
    filename = data.get('filename')
    if not url or not filename:
        return "URL and filename are required", 400

    with recorder_lock:
        if recorder is not None:
            return "Recording is already in progress", 409

        recorder = Recorder(url, filename)
        screen_recorder = ScreenRecorder(output_filename=f'{filename}_manual_test.avi', frame_rate=10.0, with_audio=False)

        threading.Thread(target=recorder.start_recording).start()
        threading.Thread(target=screen_recorder.start_recording).start()

    return jsonify({'message': 'Recording started'}), 200

@app.route('/test')
def test_page():
    return render_template('index1.html')

@app.route('/run-test', methods=['POST'])
def run_test():
    global screen_recorder
    data = request.json
    url = data.get('url')
    filename = data.get('filename')
    if not url or not filename:
        return jsonify({'error': 'URL and filename are required'}), 400

    filepath = f'{filename}'
    try:
        screen_recorder = ScreenRecorder(output_filename=f'{filename}_automated_test.avi', frame_rate=10.0, with_audio=False)
        screen_recorder.start_recording()

        runner = TestRunner(filepath)
        runner.run_test(url)

        screen_recorder.stop_recording()
        return jsonify({'message': 'Test completed successfully!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/stop', methods=['GET'])
def stop():
    global recorder, screen_recorder
    with recorder_lock:
        if recorder:
            recorder.stop_recording()
            recorder = None
        if screen_recorder:
            screen_recorder.stop_recording()
            screen_recorder = None
        return 'Recording stopped and data saved.' if recorder or screen_recorder else 'No active recording.'

@app.route('/list-tests', methods=['GET'])
def list_tests():
    test_files = [f for f in os.listdir('.') if f.endswith('.json')]
    print("Files found:", test_files)  # Debug print statement
    return jsonify({'tests': test_files})

if __name__ == '__main__':
    init_db(app)
    app.run(host='0.0.0.0', port=5000, debug=True)
