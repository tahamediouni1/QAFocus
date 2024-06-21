import json
import time
import pyautogui
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import traceback

class TestRunner:
    def __init__(self, actions):
        self.actions = actions  # Parse JSON actions
        self.driver = self.init_driver()

    def init_driver(self):
        chrome_options = Options()
        chrome_options.add_argument("--kiosk")  # Start browser maximized
        return webdriver.Chrome(options=chrome_options)

    def ensure_page_loaded(self):
        """Wait until the document is fully loaded"""
        WebDriverWait(self.driver, 10).until(
            lambda driver: driver.execute_script("return document.readyState") == "complete"
        )

    def run_test(self, initial_url):
        try:
            self.driver.get(initial_url)
            self.ensure_page_loaded()
            actions = self.actions
            last_url = self.driver.current_url

            for action in actions:
                current_url = self.driver.current_url
                if current_url != last_url:
                    print(f"URL changed from {last_url} to {current_url}")
                    self.ensure_page_loaded()  # Ensure new page is loaded before continuing
                    last_url = current_url

                if action['type'] == 'click':
                    self.perform_click(action)
                elif action['type'] == 'key_combination':
                    self.perform_key_combination(action)
                elif action['type'] == 'key_press':
                    self.perform_key_press(action)
                elif action['type'] == 'input_change':
                    self.perform_input_change(action)
                elif action['type'] == 'scroll':
                    self.perform_scroll(action)
                elif action['type'] == 'drag_start':
                    self.perform_drag_start(action)
                elif action['type'] == 'drop':
                    self.perform_drop(action)
                elif action['type'] == 'drag_end':
                    self.perform_drag_end(action)
                elif action['type'] == 'resize':
                    self.perform_resize(action)

        except Exception as e:
            print("An error occurred during test execution:")
            print(str(e))
            traceback.print_exc()
        finally:
            self.close()  # Ensure the close method is called here

    def perform_click(self, action):
        try:
            x, y = action['x'], action['y']
            ActionChains(self.driver).move_by_offset(x, y).click().perform()
            ActionChains(self.driver).move_by_offset(-x, -y).perform()  # Reset mouse position
            time.sleep(2)  # Delay to visualize the click
        except Exception as e:
            print(f"Error performing click at ({x}, {y}): {str(e)}")
            pyautogui.click(x, y)  # Ensure the click is performed using pyautogui as a fallback

    def perform_key_combination(self, action):
        keys = action['keys'].split('+')
        pyautogui.hotkey(*[self.translate_keys(key) for key in keys])
        time.sleep(0.5)  # Delay to visualize the key combination

    def perform_key_press(self, action):
        pyautogui.press(action['key'])

    def perform_input_change(self, action):
        element = self.driver.find_element(By.CSS_SELECTOR, action['selector'])
        element.clear()
        element.send_keys(action['value'])

    def perform_scroll(self, action):
        try:
            self.driver.execute_script(f"window.scrollTo({action['scrollX']}, {action['scrollY']});")
            self.wait_for_scroll(action['scrollX'], action['scrollY'])
        except Exception as e:
            print(f"Error performing scroll to ({action['scrollX']}, {action['scrollY']}): {str(e)}")

    def perform_drag_start(self, action):
        source = self.driver.find_element(By.CSS_SELECTOR, action['selector'])
        ActionChains(self.driver).click_and_hold(source).perform()

    def perform_drop(self, action):
        target = self.driver.find_element(By.CSS_SELECTOR, action['selector'])
        ActionChains(self.driver).move_to_element(target).release().perform()

    def perform_drag_end(self, action):
        ActionChains(self.driver).release().perform()

    def perform_resize(self, action):
        self.driver.set_window_size(action['width'], action['height'])

    def translate_keys(self, key_string):
        """ Translate key names to pyautogui-compatible names """
        key_map = {
            'Control': 'ctrl',
            'Alt': 'alt',
            'Shift': 'shift',
            'Backspace': 'backspace'  # Backspace key
        }
        return key_map.get(key_string.strip(), key_string.strip())

    def wait_for_scroll(self, scrollX, scrollY):
        """Wait until the scroll action is complete"""
        WebDriverWait(self.driver, 10).until(
            lambda driver: driver.execute_script("return window.scrollX") == scrollX and
                           driver.execute_script("return window.scrollY") == scrollY
        )

    def close(self):
        """Closes the browser and quits the driver."""
        self.driver.quit()