import json
import time
import pyautogui
import keyboard
from pynput import mouse

class ActionRecognizer:
    def __init__(self, driver, filepath):
        self.driver = driver
        self.filepath = filepath
        self.actions = []
        self.mouse_listener = None
        self.keyboard_hooks = []

    def log_action(self, action):
        print('Action:', action)
        self.actions.append(action)
        with open(self.filepath, 'w') as file:
            json.dump(self.actions, file, indent=4)

    def start_mouse_listener(self):
        def on_move(x, y):
            if not self.mouse_listener:
                return
            screen_width, screen_height = pyautogui.size()
            normalized_x = x / screen_width
            normalized_y = y / screen_height
            action = {
                'type': 'mousemove',
                'x': normalized_x,
                'y': normalized_y,
                'timestamp': time.time()
            }
            self.log_action(action)

        def on_click(x, y, button, pressed):
            if not self.mouse_listener:
                return
            screen_width, screen_height = pyautogui.size()
            normalized_x = x / screen_width
            normalized_y = y / screen_height
            action_type = 'click' if pressed else 'release'
            action = {
                'type': action_type,
                'button': button.name,
                'x': normalized_x,
                'y': normalized_y,
                'timestamp': time.time()
            }
            self.log_action(action)

        def on_scroll(x, y, dx, dy):
            if not self.mouse_listener:
                return
            screen_width, screen_height = pyautogui.size()
            normalized_x = x / screen_width
            normalized_y = y / screen_height
            action = {
                'type': 'scroll',
                'x': normalized_x,
                'y': normalized_y,
                'dx': dx,
                'dy': dy,
                'timestamp': time.time()
            }
            self.log_action(action)

        self.mouse_listener = mouse.Listener(on_move=on_move, on_click=on_click, on_scroll=on_scroll)
        self.mouse_listener.start()

    def start_keyboard_listener(self):
        def on_press(event):
            if event.event_type == 'down':
                action = {
                    'type': 'keypress',
                    'key': event.name,
                    'timestamp': time.time()
                }
                self.log_action(action)

        def on_release(event):
            if event.event_type == 'up':
                action = {
                    'type': 'keyrelease',
                    'key': event.name,
                    'timestamp': time.time()
                }
                self.log_action(action)

        self.keyboard_hooks.append(keyboard.hook(on_press))
        self.keyboard_hooks.append(keyboard.on_release(on_release))

    def start_recording(self):
        self.start_mouse_listener()
        self.start_keyboard_listener()

    def stop_recording(self):
        if self.mouse_listener:
            self.mouse_listener.stop()
            self.mouse_listener = None
        for hook in self.keyboard_hooks:
            keyboard.unhook(hook)
        self.keyboard_hooks = []
        with open(self.filepath, 'w') as file:
            json.dump(self.actions, file, indent=4)
        print(f"Actions saved to {self.filepath}")

    def monitor_escape_key(self):
        keyboard.wait('esc')
        self.stop_recording()
