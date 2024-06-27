import time
import json
import traceback
import pyautogui
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait

class TestRunner:
    def __init__(self, actions, wait_time=2, callback=None):
        self.actions = actions
        self.wait_time = wait_time  # Wait time in seconds
        self.callback = callback  # Callback function to stop recording
        self.driver = self.init_driver()

    def init_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--start-maximized")
        return webdriver.Chrome(options=chrome_options)

    def ensure_page_loaded(self):
        WebDriverWait(self.driver, 10).until(
            lambda driver: driver.execute_script("return document.readyState") == "complete"
        )

    def run_test(self, initial_url):
        try:
            self.driver.get(initial_url)
            self.ensure_page_loaded()
            actions = self.actions
            time.sleep(2)
            last_url = self.driver.current_url

            for action in actions:
                current_url = self.driver.current_url
                if current_url != last_url:
                    print(f"URL changed from {last_url} to {current_url}")
                    time.sleep(self.wait_time)  # Wait before ensuring page is loaded
                    self.ensure_page_loaded()
                    last_url = current_url

                print(f"Performing action: {action}")
                if action['type'] == 'click':
                    self.perform_click(action)
                elif action['type'] == 'release':
                    self.perform_release(action)
                elif action['type'] == 'keypress':
                    self.perform_key_press(action)
                elif action['type'] == 'keyrelease':
                    self.perform_key_release(action)
                elif action['type'] == 'scroll':
                    self.perform_scroll(action)
                elif action['type'] == 'mousemove':
                    self.perform_mouse_move(action)

        except Exception as e:
            print("An error occurred during test execution:")
            print(str(e))
            traceback.print_exc()
        finally:
            self.close()
            if self.callback:
                self.callback()

    def perform_click(self, action):
        try:
            screen_width, screen_height = pyautogui.size()
            x = int(action['x'] * screen_width)
            y = int(action['y'] * screen_height)
            print(f"Clicking and holding at ({x}, {y})")
            pyautogui.mouseDown(x, y)
            time.sleep(0.5)
        except Exception as e:
            print(f"Error performing click at ({x}, {y}): {str(e)}")

    def perform_release(self, action):
        try:
            screen_width, screen_height = pyautogui.size()
            x = int(action['x'] * screen_width)
            y = int(action['y'] * screen_height)
            print(f"Releasing at ({x}, {y})")
            pyautogui.mouseUp(x, y)
            time.sleep(0.5)
        except Exception as e:
            print(f"Error performing release at ({x}, {y}): {str(e)}")

    def perform_key_press(self, action):
        try:
            key = action['key']
            print(f"Pressing key '{key}'")
            pyautogui.press(key)
        except Exception as e:
            print(f"Error performing key press for key '{key}': {str(e)}")

    def perform_key_release(self, action):
        try:
            key = action['key']
            print(f"Releasing key '{key}'")
            pyautogui.keyUp(key)
        except Exception as e:
            print(f"Error performing key release for key '{key}': {str(e)}")

    def perform_scroll(self, action):
        try:
            screen_width, screen_height = pyautogui.size()
            x = int(action['x'] * screen_width)
            y = int(action['y'] * screen_height)
            scroll_amount = action['dy'] * 20  # Increase scroll speed by multiplying delta
            print(f"Scrolling at ({x}, {y}) with delta ({action['dx']}, {scroll_amount})")
            pyautogui.scroll(scroll_amount, x, y)
            time.sleep(0.1)  # Reduce wait time after scrolling
        except Exception as e:
            print(f"Error performing scroll at ({x}, {y}) with delta ({action['dx']}, {action['dy']}): {str(e)}")

    def perform_mouse_move(self, action):
        try:
            screen_width, screen_height = pyautogui.size()
            x = int(action['x'] * screen_width)
            y = int(action['y'] * screen_height)
            print(f"Moving mouse to ({x}, {y})")
            pyautogui.moveTo(x, y, duration=0.001)
        except Exception as e:
            print(f"Error performing mouse move to ({x}, {y}): {str(e)}")

    def close(self):
        time.sleep(3)
        self.driver.quit()