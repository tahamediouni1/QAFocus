import os
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager
import json
import threading
from automation.test_runner import TestRunner
from automation.recorder import Recorder
from automation.screen_recorder import ScreenRecorder
from flask_cors import CORS

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})

PROJECTS_DIR = 'projects'

screen_recorders = {}

def stop_recording(filename):
    if filename in screen_recorders:
        screen_recorders[filename].stop_recording()
        del screen_recorders[filename]
    print("Recording stopped")

@app.route('/')
def index():
    return jsonify({'message': 'Welcome to the Test Execution Microservice'})

@app.route('/projects', methods=['GET'])
def get_projects():
    try:
        projects = [{'id': project, 'name': project} for project in os.listdir(PROJECTS_DIR) if os.path.isdir(os.path.join(PROJECTS_DIR, project))]
        return jsonify(projects)
    except FileNotFoundError:
        return jsonify([])

@app.route('/projects', methods=['POST'])
def create_project():
    data = request.json
    project_name = data.get('name')
    if not project_name:
        return jsonify({'message': 'Project name is required'}), 400
    project_dir = os.path.join(PROJECTS_DIR, project_name)
    os.makedirs(project_dir, exist_ok=True)
    # Save the description
    description = data.get('description', '')
    with open(os.path.join(project_dir, 'description.txt'), 'w') as f:
        f.write(description)
    return jsonify({'message': 'Project created successfully', 'name': project_name}), 201

@app.route('/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    project_dir = os.path.join(PROJECTS_DIR, project_id)
    if os.path.exists(project_dir) and os.path.isdir(project_dir):
        for root, dirs, files in os.walk(project_dir, topdown=False):
            for name in files:
                os.remove(os.path.join(root, name))
            for name in dirs:
                os.rmdir(os.path.join(root, name))
        os.rmdir(project_dir)
        return jsonify({'message': 'Project deleted successfully'}), 200
    return jsonify({'message': 'Project not found'}), 404

@app.route('/projects/<project_id>/testruns', methods=['GET'])
def get_test_runs(project_id):
    project_dir = os.path.join(PROJECTS_DIR, project_id)
    try:
        test_files = [f for f in os.listdir(project_dir) if f.endswith('.json')]
        return jsonify(test_files)
    except FileNotFoundError:
        return jsonify({'message': 'Project not found'}), 404

@app.route('/projects/<project_id>/testruns', methods=['POST'])
def create_test_run(project_id):
    data = request.json
    test_name = data.get('name')
    actions = data.get('actions')
    if not test_name or not actions:
        return jsonify({'message': 'Test name and actions are required'}), 400
    test_path = os.path.join(PROJECTS_DIR, project_id, f"{test_name}.json")
    with open(test_path, 'w') as f:
        json.dump(actions, f)
    return jsonify({'message': 'Test created successfully', 'name': test_name}), 201

@app.route('/start', methods=['POST'])
def start():
    data = request.json
    url = data.get('url')
    filename = data.get('filename')
    project_id = data.get('project_id')
    if not url or not filename or not project_id:
        return jsonify({'message': 'URL, filename, and project ID are required'}), 400

    filepath = os.path.join(PROJECTS_DIR, project_id, f"{filename}.json")
    recorder = Recorder(url, filepath)
    recording_filename = os.path.join(PROJECTS_DIR, project_id, f"{filename}_manual_test.avi")
    screen_recorder = ScreenRecorder(output_filename=recording_filename)
    screen_recorders[filename] = screen_recorder

    threading.Thread(target=recorder.start_recording).start()
    threading.Thread(target=screen_recorder.start_recording).start()

    return jsonify({'message': 'Recording started'}), 200

@app.route('/projects/<project_id>/testruns/<filename>', methods=['POST'])
def run_test(project_id, filename):
    data = request.json
    url = data.get('url')
    if not url or not filename or not project_id:
        return jsonify({'message': 'URL, filename, and project ID are required'}), 400

    test_path = os.path.join(PROJECTS_DIR, project_id, f"{filename}")
    try:
        with open(test_path, 'r') as f:
            actions = json.load(f)
    except FileNotFoundError:
        return jsonify({'message': 'Test file not found'}), 404

    # Run the test using TestRunner
    recording_filename = os.path.join(PROJECTS_DIR, project_id, f"{filename.replace('.json', '')}_automated_test.avi")
    screen_recorder = ScreenRecorder(output_filename=recording_filename)
    screen_recorders[filename] = screen_recorder

    test_runner = TestRunner(actions)

    threading.Thread(target=test_runner.run_test, args=(url,)).start()
    threading.Thread(target=screen_recorder.start_recording).start()

    return jsonify({'message': 'Test run started'}), 200

@app.route('/projects/<project_id>/testruns/<filename>', methods=['DELETE'])
def delete_test_run(project_id, filename):
    test_path = os.path.join(PROJECTS_DIR, project_id, filename)
    manual_video_path = os.path.join(PROJECTS_DIR, project_id, f"{filename.replace('.json', '')}_manual_test.avi")
    automated_video_path = os.path.join(PROJECTS_DIR, project_id, f"{filename.replace('.json', '')}_automated_test.avi")

    deleted_files = []

    if os.path.exists(test_path):
        os.remove(test_path)
        deleted_files.append(test_path)

    if os.path.exists(manual_video_path):
        os.remove(manual_video_path)
        deleted_files.append(manual_video_path)

    if os.path.exists(automated_video_path):
        os.remove(automated_video_path)
        deleted_files.append(automated_video_path)

    if deleted_files:
        return jsonify({'message': 'Test files deleted successfully', 'deleted_files': deleted_files}), 200
    return jsonify({'message': 'Test file not found'}), 404

@app.route('/stop', methods=['POST'])
def stop():
    data = request.json
    filename = data.get('filename')
    if filename in screen_recorders:
        screen_recorders[filename].stop_recording()
        del screen_recorders[filename]
    return jsonify({'message': 'Recording stopped'}), 200

@app.route('/projects/<project_id>/description', methods=['GET'])
def get_project_description(project_id):
    project_dir = os.path.join(PROJECTS_DIR, project_id)
    description_path = os.path.join(project_dir, 'description.txt')
    try:
        with open(description_path, 'r') as f:
            description = f.read()
        return jsonify({'description': description})
    except FileNotFoundError:
        return jsonify({'description': ''}), 404

if __name__ == '__main__':
    os.makedirs(PROJECTS_DIR, exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)
