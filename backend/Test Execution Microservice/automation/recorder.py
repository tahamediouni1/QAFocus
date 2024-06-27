from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import threading
from automation.action_recognizer import ActionRecognizer
import keyboard

class Recorder:
    def __init__(self, url, filepath):
        self.url = url
        self.filepath = filepath
        options = Options()
        options.add_argument("--start-maximized")
        self.driver = webdriver.Chrome(options=options)
        self.action_recognizer = ActionRecognizer(self.driver, self.filepath)
        self.recording_active = False
        self.thread = threading.Thread(target=self.monitor_escape_key)

    def monitor_escape_key(self):
        keyboard.wait('esc')
        self.stop_recording()

    def start_recording(self):
        self.driver.get(self.url)
        self.action_recognizer.start_recording()
        self.recording_active = True
        self.thread.start()

    def stop_recording(self):
        if self.recording_active:
            self.recording_active = False
            self.action_recognizer.stop_recording()
            self.driver.quit()
            print('Recording stopped and actions saved.')
