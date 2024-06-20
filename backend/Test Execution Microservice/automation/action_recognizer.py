import json
import time

class ActionRecognizer:
    def __init__(self, driver):
        self.driver = driver

    def inject_script(self):
        # Check if the script is already injected and active
        check_script = "return window.seleniumMonitorInitialized || false;"
        if not self.driver.execute_script(check_script):
            self.monitor_actions()

    def monitor_actions(self):
        # JavaScript for monitoring user actions
        script = """
        if (window.seleniumMonitorInitialized) return;
        window.seleniumMonitorInitialized = true;
        window.seleniumMonitorActions = [];
        const keysPressed = {};
        let dragSrcEl = null;

        function getCoordinatesRelativeToViewport(event) {
            const rect = document.body.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }

        function logAction(action) {
            console.log('Action:', action);
            window.seleniumMonitorActions.push(action);
        }

        document.addEventListener('click', function(event) {
            const coords = getCoordinatesRelativeToViewport(event);
            logAction({
                type: 'click',
                x: coords.x,
                y: coords.y,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                timestamp: Date.now()
            });
        }, true);

        document.addEventListener('dblclick', function(event) {
            const coords = getCoordinatesRelativeToViewport(event);
            logAction({
                type: 'double_click',
                x: coords.x,
                y: coords.y,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                timestamp: Date.now()
            });
        }, true);

        document.addEventListener('contextmenu', function(event) {
            const coords = getCoordinatesRelativeToViewport(event);
            logAction({
                type: 'right_click',
                x: coords.x,
                y: coords.y,
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                timestamp: Date.now()
            });
        }, true);

        document.addEventListener('scroll', function(event) {
            logAction({
                type: 'scroll',
                scrollX: window.scrollX,
                scrollY: window.scrollY,
                timestamp: Date.now()
            });
        }, true);

        document.addEventListener('keydown', function(event) {
            keysPressed[event.key] = true;
            const pressedKeys = Object.keys(keysPressed).filter(key => keysPressed[key]);

            if (pressedKeys.length > 1) {
                logAction({
                    type: 'key_combination',
                    keys: pressedKeys.join('+'),
                    timestamp: Date.now()
                });
            } else {
                logAction({
                    type: 'key_press',
                    key: event.key,
                    timestamp: Date.now()
                });
            }
        });

        document.addEventListener('keyup', function(event) {
            keysPressed[event.key] = false;
        });

        document.querySelectorAll('input, textarea, select').forEach(function(input) {
            input.addEventListener('change', function() {
                const inputCoords = input.getBoundingClientRect();
                logAction({
                    type: 'input_change',
                    value: input.value,
                    selector: input.tagName.toLowerCase() + 
                              (input.id ? '#' + input.id : input.className ? '.' + input.className.split(' ')[0] : ''),
                    x: inputCoords.left + window.scrollX,
                    y: inputCoords.top + window.scrollY,
                    timestamp: Date.now()
                });
            });

            input.addEventListener('focus', function() {
                logAction({
                    type: 'focus',
                    selector: input.tagName.toLowerCase() + 
                              (input.id ? '#' + input.id : input.className ? '.' + input.className.split(' ')[0] : ''),
                    timestamp: Date.now()
                });
            });

            input.addEventListener('blur', function() {
                logAction({
                    type: 'blur',
                    selector: input.tagName.toLowerCase() + 
                              (input.id ? '#' + input.id : input.className ? '.' + input.className.split(' ')[0] : ''),
                    timestamp: Date.now()
                });
            });
        });

        document.addEventListener('submit', function(event) {
            const form = event.target;
            const formCoords = form.getBoundingClientRect();
            logAction({
                type: 'form_submit',
                selector: form.tagName.toLowerCase() + 
                          (form.id ? '#' + form.id : form.className ? '.' + form.className.split(' ')[0] : ''),
                x: formCoords.left + window.scrollX,
                y: formCoords.top + window.scrollY,
                timestamp: Date.now()
            });
        }, true);

        window.addEventListener('resize', function(event) {
            logAction({
                type: 'resize',
                width: window.innerWidth,
                height: window.innerHeight,
                timestamp: Date.now()
            });
        });

        document.addEventListener('dragstart', function(event) {
            dragSrcEl = event.target;
            const coords = getCoordinatesRelativeToViewport(event);
            logAction({
                type: 'drag_start',
                x: coords.x,
                y: coords.y,
                selector: dragSrcEl.tagName.toLowerCase() + 
                          (dragSrcEl.id ? '#' + dragSrcEl.id : dragSrcEl.className ? '.' + dragSrcEl.className.split(' ')[0] : ''),
                timestamp: Date.now()
            });
        }, true);

        document.addEventListener('drop', function(event) {
            if (dragSrcEl) {
                const coords = getCoordinatesRelativeToViewport(event);
                logAction({
                    type: 'drop',
                    x: coords.x,
                    y: coords.y,
                    selector: dragSrcEl.tagName.toLowerCase() + 
                              (dragSrcEl.id ? '#' + dragSrcEl.id : dragSrcEl.className ? '.' + dragSrcEl.className.split(' ')[0] : ''),
                    timestamp: Date.now()
                });
                dragSrcEl = null;
            }
        }, true);

        document.addEventListener('dragend', function(event) {
            const coords = getCoordinatesRelativeToViewport(event);
            logAction({
                type: 'drag_end',
                x: coords.x,
                y: coords.y,
                timestamp: Date.now()
            });
        }, true);

        """
        self.driver.execute_script(script)

    def fetch_and_save_actions(self, filepath='recorded_actions.json'):
        self.inject_script()  # Ensure the script is active
        actions = self.driver.execute_script("return window.seleniumMonitorActions;")
        with open(filepath, 'w') as file:
            json.dump(actions, file, indent=4)
        print(f"Actions saved to {filepath}")

    def log_actions(self, actions):
        for action in actions:
            print(f"Action recorded: {json.dumps(action, indent=4)}")

    def start_continuous_monitoring(self):
        """Continuously checks if the monitoring script is active and reinjects it if necessary."""
        try:
            while True:
                self.inject_script()
                time.sleep(1)  # Check every second
        except Exception as e:
            print("Error during continuous monitoring:", e)
