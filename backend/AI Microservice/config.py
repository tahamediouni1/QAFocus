import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')
MANUAL_DIR = os.path.join(STATIC_DIR, 'manual')
AUTOMATED_DIR = os.path.join(STATIC_DIR, 'automated')

os.makedirs(MANUAL_DIR, exist_ok=True)
os.makedirs(AUTOMATED_DIR, exist_ok=True)
