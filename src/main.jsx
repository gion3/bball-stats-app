import ReactDOM from 'react-dom/client'
import {BrowserRouter, Routes,Route} from 'react-router-dom'
import './index.css'
import App from './components/App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
