import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';

export default function App() {
  const socketRef = useRef<any>(null);
  const navigate = useNavigate();
  const [room, setRoom] = useState({
    serverConfirmed: false,
    room: ''
  });
  const [roomId, setRoomId] = useState<string>('');

  useEffect(() => {
    // Initialize the socket connection
    socketRef.current = socketIOClient('http://localhost:4000');

    // Define the event listeners
    const handleNewGameCreated = (room: any) => {
      setRoom({ serverConfirmed: true, room: room });
      navigate('/board', {
        state: {
          roomId: '66c89b59d67c3755'
        }
      })
    };

    const handleJoinConfirmed = () => {
      console.log({ serverConfirmed: true });
    };

    const handleErrorMessage = (message: any) => {
      console.log(message);
    };

    // Attach the event listeners
    socketRef.current.on('newGameCreated', handleNewGameCreated);
    socketRef.current.on('joinConfirmed', handleJoinConfirmed);
    socketRef.current.on('errorMessage', handleErrorMessage);

    // Cleanup event listeners on component unmount
    return () => {
      socketRef.current.off('newGameCreated', handleNewGameCreated);
      socketRef.current.off('joinConfirmed', handleJoinConfirmed);
      socketRef.current.off('errorMessage', handleErrorMessage);
      socketRef.current.disconnect();
    };
  }, []);

  const onCreateRoom = () => {
    socketRef.current.emit('newGame');
    // navigate('/board');
  };

  const onJoinRoom = () => {
    socketRef.current.emit('joining', { room: roomId });
  };

  return (
    <div>
      {/* Your component UI */}
      <button onClick={onCreateRoom}>Create Room</button>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={onJoinRoom}>Join Room</button>
    </div>
  );
}
