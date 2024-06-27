from flask import Blueprint, request, jsonify
from services.video_processing_service import VideoProcessingService

processing_bp = Blueprint('processing', __name__)
video_service = VideoProcessingService()

@processing_bp.route('/videos', methods=['POST'])
def process_videos():
    manual_video = request.files.get('manual_video')
    automated_video = request.files.get('automated_video')

    manual_video_path = 'manual_test.avi'
    automated_video_path = 'automated_test.avi'

    manual_video.save(manual_video_path)
    automated_video.save(automated_video_path)

    manual_filenames, automated_filenames = video_service.process_videos(manual_video_path, automated_video_path)

    return jsonify({
        'manual_frames': manual_filenames,
        'automated_frames': automated_filenames
    })
