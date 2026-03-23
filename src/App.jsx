import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Produits from './pages/Produits'
import Factures from './pages/Factures'
import ListeFactures from './pages/ListeFactures'
import AjouterPosition from './pages/AjouterPosition'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <h2>Véto Maeva</h2>
          <nav>
            <ul>
              <li><NavLink to="/">Tableau de bord</NavLink></li>
              <li><NavLink to="/clients">Clients</NavLink></li>
              <li><NavLink to="/produits">Produits</NavLink></li>
              <li><NavLink to="/factures/nouveau">Nouvelle facture</NavLink></li>
              <li><NavLink to="/factures">Factures</NavLink></li>
              <li><NavLink to="/factures/position">Ajouter produit</NavLink></li>
            </ul>
          </nav>
        </aside>
        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/produits" element={<Produits />} />
            <Route path="/factures" element={<ListeFactures />} />
            <Route path="/factures/nouveau" element={<Factures />} />
            <Route path="/factures/position" element={<AjouterPosition />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
