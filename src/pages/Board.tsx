import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import styled from 'styled-components';

type SquareProps = {
  value: string,
  onSquareClick: () => void
}

type BoardProps = {
  xIsNext: any
  squares: any
  onPlay: any
}

function Square({ value, onSquareClick }: SquareProps) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  function handleClick(i: any) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    onPlay(nextSquares);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}

const Game = () => {
  const location = useLocation();
  const { roomId } = location.state || {};
  const socket = socketIOClient('http://localhost:4000');
  const [room, setRoom] = useState({
    serverConfirmed: false,
    room: ''
  });
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  const connect = useCallback(() => {
    socket.on('newGameCreated', (room) => {
      setRoom({ serverConfirmed: true, room: room });
    });

    socket.on('joinConfirmed', () => {
      console.log({ serverConfirmed: true })
    })

    socket.on('errorMessage', (message) => console.log(message))
  }, [socket]);

  function handlePlay(nextSquares: any) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: any) {
    setCurrentMove(nextMove);
  }

  const moves = history.map((squares: any, move: any) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  useEffect(() => {
    connect();

    return () => {
      socket.disconnect();
    }
  }, [socket]);

  useEffect(() => {
    socket.emit('joining', { room: roomId })
  }, [roomId]);

  return (
    <Container>
      <h1>{roomId}</h1>
      <div className="game">
        <div className="game-board">
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        </div>
        <div className="game-info">
          <ol>{moves}</ol>
        </div>
      </div>
    </Container>
  )
};

export default Game;

const Container = styled.div`
  display: block;

  > .join-wrapper {
    display: flex;
    gap: 1.5rem;

    div::nth-child(2) {
      display: flex;
      gap: 1rem;
    }
  }
`;

function calculateWinner(squares: number[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}