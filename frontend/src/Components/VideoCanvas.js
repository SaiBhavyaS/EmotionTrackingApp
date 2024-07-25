import React, { useEffect, useRef } from 'react';

const VideoCanvas = ({ videoRef, streaming, sendFrame }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const sendFrameWrapper = () => {
            const frameInterval = 1000 / 5; // Send 5 frames per second
            let lastFrameTime = 0;

            const sendFrame = (time) => {
                if (videoRef.current && streaming) {
                    if (time - lastFrameTime >= frameInterval) {
                        lastFrameTime = time;

                        const canvas = canvasRef.current;
                        const context = canvas.getContext('2d');
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
                        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                        const frame = canvas.toDataURL('image/jpeg').split(',')[1];
                        sendFrame(frame);
                    }

                    requestAnimationFrame(sendFrame);
                }
            };

            requestAnimationFrame(sendFrame);
        };

        if (videoRef.current && streaming) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    sendFrameWrapper();
                })
                .catch((error) => console.error('Error accessing webcam:', error));
        }

        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };
    }, [videoRef, streaming, sendFrame]);

    return <canvas ref={canvasRef} style={{ display: 'none' }} />;
};

export default VideoCanvas;
