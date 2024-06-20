from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import keyboard  
import threading
from automation.action_recognizer import ActionRecognizer

class Recorder:
    def __init__(self, url, filename):
        self.url = url
        self.filename = filename
        options = Options()
        options.add_argument("--kiosk")  # Maximize to ensure consistent dimensions
        self.driver = webdriver.Chrome(options=options)
        self.action_recognizer = ActionRecognizer(self.driver)
        self.recording_active = False
        self.thread = threading.Thread(target=self.monitor_escape_key)
    
    def monitor_escape_key(self):
        """Monitor for the Escape key press to stop recording."""
        keyboard.wait('esc')  # Blocks until 'esc' is pressed
        self.stop_recording()

    def start_recording(self):
        self.driver.get(self.url)
        self.action_recognizer.monitor_actions()
        self.recording_active = True
        self.thread.start()  # Start the thread that monitors for the Escape key

    def stop_recording(self):
        if self.recording_active:
            self.recording_active = False
            self.action_recognizer.fetch_and_save_actions(self.filename)
            self.driver.quit()
            print('Recording stopped and actions saved.')
