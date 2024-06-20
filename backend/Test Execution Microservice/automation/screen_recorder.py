import cv2
import numpy as np
from PIL import ImageGrab
import pyaudio
import wave
import threading
import time
from pynput import keyboard

class ScreenRecorder:
    def __init__(self, output_filename='recording.avi', frame_rate=10.0, record_duration=None, with_audio=False):
        self.output_filename = output_filename
        self.frame_rate = frame_rate
        self.record_duration = record_duration  # Duration in seconds
        self.with_audio = with_audio
        self.record_area = (0, 0, 1920, 1080)  # Default full screen
        self.is_recording = False

    def start_recording(self):
        self.is_recording = True
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(self.output_filename, fourcc, self.frame_rate, (self.record_area[2] - self.record_area[0], self.record_area[3] - self.record_area[1]))

        audio, stream, audio_frames = self.setup_audio() if self.with_audio else (None, None, None)

        # Start the recording in a separate thread
        recording_thread = threading.Thread(target=self.record_screen, args=(out, stream, audio_frames))
        recording_thread.start()

        # Start the keyboard listener in a separate thread
        listener_thread = threading.Thread(target=self.start_keyboard_listener)
        listener_thread.start()

        # Stop recording after a certain duration if specified
        if self.record_duration is not None:
            threading.Timer(self.record_duration, self.stop_recording).start()

    def setup_audio(self):
        audio = pyaudio.PyAudio()
        stream = audio.open(format=pyaudio.paInt16, channels=2, rate=44100, input=True, frames_per_buffer=1024)
        audio_frames = []
        return audio, stream, audio_frames

    def record_screen(self, out, stream, audio_frames):
        time.sleep(2)
        try:
            while self.is_recording:
                img = ImageGrab.grab(bbox=self.record_area)
                img_np = np.array(img)
                frame = cv2.cvtColor(img_np, cv2.COLOR_BGR2RGB)
                out.write(frame)
                if self.with_audio:
                    data = stream.read(1024)
                    audio_frames.append(data)
        finally:
            out.release()
            self.cleanup_audio(stream, audio_frames)

    def cleanup_audio(self, stream, audio_frames):
        if self.with_audio and stream and audio_frames:
            stream.stop_stream()
            stream.close()
            pyaudio.PyAudio().terminate()
            with wave.open(self.output_filename.replace('.avi', '.wav'), 'wb') as wf:
                wf.setnchannels(2)
                wf.setsampwidth(pyaudio.PyAudio().get_sample_size(pyaudio.paInt16))
                wf.setframerate(44100)
                wf.writeframes(b''.join(audio_frames))

    def stop_recording(self):
        self.is_recording = False

    def start_keyboard_listener(self):
        with keyboard.Listener(on_press=self.on_press) as listener:
            listener.join()

    def on_press(self, key):
        # Stop recording when the Escape key is pressed
        if key == keyboard.Key.esc:
            self.stop_recording()
            return False
