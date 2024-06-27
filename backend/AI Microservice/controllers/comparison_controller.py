from flask import Blueprint, request, jsonify
from services.comparison_service import ComparisonService

comparison_bp = Blueprint('comparison', __name__)

# Initialize ComparisonService with the path to the YOLOv8 model
comparison_service = ComparisonService('C:/Users/Emna/OneDrive/Bureau/Taha/PFE/TestAutomationFramework/AI Microservice/models/YOLOv8.pt')

@comparison_bp.route('/compare', methods=['POST'])
def compare_videos():
    manual_frames_dir = request.form.get('manual_frames_dir')
    automated_frames_dir = request.form.get('automated_frames_dir')

    if not manual_frames_dir or not automated_frames_dir:
        return jsonify({'error': 'Please provide paths for both manual and automated frames directories'}), 400

    try:
        results = comparison_service.compare_frames(manual_frames_dir, automated_frames_dir)
        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
