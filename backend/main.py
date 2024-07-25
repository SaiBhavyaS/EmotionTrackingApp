from flask import Flask, request
from flask_socketio import SocketIO, emit
import cv2
from fer import FER
import numpy as np
import base64
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")
emotion_detector = FER(mtcnn=True)

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('webcam_frame')
def handle_webcam_frame(data):
    frame_data = data['frame']
    frame = base64.b64decode(frame_data)
    np_arr = np.frombuffer(frame, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Asynchronous emotion detection
    socketio.start_background_task(emotion_detection_task, img)

def emotion_detection_task(img):
    emotions = emotion_detector.detect_emotions(img)
    if emotions:
        socketio.emit('emotion_result', {'emotions': emotions[0]['emotions']})
    else:
        socketio.emit('emotion_result', {'emotions': 'No emotion detected'})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)

