import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Game from '../pages/Board';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/board',
    element: <Game />
  }
])