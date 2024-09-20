import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Box, Drawer, Toolbar, Typography, ThemeProvider, AppBar, Button } from '@mui/material';
import { CircularProgress } from "@mui/material";
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import theme from './theme';

const socket = io('http://127.0.0.1:5000');

const drawerWidth = 230;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A020F0', '#FF1493', '#00FA9A'];

function App() {
    const videoRef = useRef(null);
    const [emotions, setEmotions] = useState([]);
    const [streaming, setStreaming] = useState(false);
    const [isLoading,setIsLoading]=useState(false)
    useEffect(() => {
        socket.on('emotion_result', handleEmotionResult);

        return () => {
            socket.off('emotion_result', handleEmotionResult);
        };
    }, []);

   
        const handleEmotionResult =(data) => {
        const formattedData = Object.entries(data.emotions).map(([emotion, score]) => ({
            name: emotion,
            value: score*100,
        }));
        setEmotions(formattedData);
        setIsLoading(false);
    };
   

    const startStreaming = () => {
        setStreaming(true);
       
    };

    const stopStreaming = () => {
        setStreaming(false); 
        setIsLoading(true);
        
    };

    useEffect(() => {
        const startTime = Date.now();
        const frameInterval = 1000 / 5; 
        let lastFrameTime = 0;

        const sendFrame = (time) => {
            if (videoRef.current && streaming) {
                if (time - lastFrameTime >= frameInterval) {
                    lastFrameTime = time;

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.width = videoRef.current.videoWidth;
                    canvas.height = videoRef.current.videoHeight;
                    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

                    const frame = canvas.toDataURL('image/jpeg').split(',')[1];
                    socket.emit('webcam_frame', { frame });
                }

                if (Date.now() - startTime < 15000) {
                    requestAnimationFrame(sendFrame);
                } else {
                    setStreaming(false);
                    stopVideoStream();
                }
            }
        };

        const stopVideoStream = () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
        };

        if (videoRef.current && streaming) { 
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                    requestAnimationFrame(sendFrame);
                })
                .catch((error) => console.error('Error accessing webcam:', error));
        }

        return () => {
            setStreaming(false);
            stopVideoStream();
        };
    }, [videoRef, streaming]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ display: 'flex' }}>
                <Box sx={{ flexGrow: 1 }}>
                <AppBar
                    position="static"
                    sx={{ bgcolor: 'white', color: 'black', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}
                >
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div">
                            Dashboard
                        </Typography>
                    </Toolbar>
                </AppBar>
            
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                    <Box sx={{ width: 700, p: 2, bgcolor: 'background.paper', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ marginBottom: 2 }}>
                            <Typography variant="h5" gutterBottom fontFamily="Poppins">
                                Emotion Tracker
                            </Typography>
                            <video ref={videoRef} width="640" height="300" style={{ visibility: 'hidden' }}  />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 0.8 }}>
                            <Button variant="contained" color="primary" onClick={startStreaming} disabled={streaming} bgcolor="white" >
                                Start Streaming
                            </Button>
                            <Button variant="contained" color="secondary" onClick={stopStreaming} disabled={!streaming} sx={{ ml: 2 }}>
                                Stop Streaming
                            </Button>
                        </Box>
                    </Box>
                   
                    <Box sx={{ width: 400, p: 2, bgcolor: 'background.paper', borderLeft: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h5" gutterBottom fontFamily="Poppins">
                       Emotion Chart
                     </Typography>
                        {isLoading?<CircularProgress/>:<PieChart width={400} height={400}>
                            <Pie
                                data={emotions}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={150}
                                fill="#8884d8"
                                label
                            >
                                {emotions.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                            }
                    </Box>
                </Box>
            </Box>
            
               
                


                </Box>
        </ThemeProvider>
    );
}

export default App;