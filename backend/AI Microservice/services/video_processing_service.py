import cv2
import os
import numpy as np
from config import MANUAL_DIR, AUTOMATED_DIR

class VideoProcessingService:
    def __init__(self, threshold=3):
        self.threshold = threshold

    def extract_significant_frames(self, video_path, output_path, start_time=0):
        cap = cv2.VideoCapture(video_path)
        prev_frame = None
        frame_counter = 0
        significant_frame_counter = 0
        fps = cap.get(cv2.CAP_PROP_FPS)
        start_frame = int(start_time * fps)
        saved_frames = []

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_counter >= start_frame:
                if prev_frame is not None:
                    diff = cv2.absdiff(frame, prev_frame).mean()
                    if diff > self.threshold:
                        frame_filename = f'frame_{significant_frame_counter}.jpg'
                        frame_path = os.path.join(output_path, frame_filename)
                        cv2.imwrite(frame_path, frame)
                        saved_frames.append(frame_filename)
                        significant_frame_counter += 1

                prev_frame = frame

            frame_counter += 1

        cap.release()
        cv2.destroyAllWindows()

        return saved_frames

    def find_most_similar_frame(self, manual_frame_path, automated_video_path):
        manual_frame = cv2.imread(manual_frame_path, cv2.IMREAD_GRAYSCALE)
        cap = cv2.VideoCapture(automated_video_path)
        best_match_frame = None
        best_match_score = float('inf')
        frame_counter = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            score = np.mean(cv2.absdiff(manual_frame, frame_gray))
            if score < best_match_score:
                best_match_score = score
                best_match_frame = frame

            frame_counter += 1

        cap.release()
        cv2.destroyAllWindows()

        return best_match_frame

    def process_videos(self, manual_video_path, automated_video_path):
        manual_filenames = self.extract_significant_frames(manual_video_path, MANUAL_DIR)
        automated_frames_dir = AUTOMATED_DIR
        os.makedirs(automated_frames_dir, exist_ok=True)

        for manual_frame_filename in manual_filenames:
            manual_frame_path = os.path.join(MANUAL_DIR, manual_frame_filename)
            best_match_frame = self.find_most_similar_frame(manual_frame_path, automated_video_path)
            frame_filename = f'automated_{manual_frame_filename}'
            frame_path = os.path.join(automated_frames_dir, frame_filename)
            cv2.imwrite(frame_path, best_match_frame)

        return manual_filenames, [f'automated_{filename}' for filename in manual_filenames]
