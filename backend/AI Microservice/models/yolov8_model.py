from ultralytics import YOLO

class YoloV8Model:
    def load_model(self):
        # Load the YOLOv8 model saved locally
        model = YOLO('C:/Users/Emna/OneDrive/Bureau/Taha/PFE/TestAutomationFramework/AI Microservice/models/YOLOv8.pt')
        return model
