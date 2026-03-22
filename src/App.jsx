import './App.css'

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Véto Maeva</h2>
        <nav>
          <ul>
            <li><a href="#" className="active">Tableau de bord</a></li>
            <li><a href="#">Rendez-vous</a></li>
            <li><a href="#">Patients</a></li>
            <li><a href="#">Propriétaires</a></li>
            <li><a href="#">Paramètres</a></li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <header>
          <h1>Tableau de bord</h1>
        </header>
        <div className="dashboard">
          <div className="card">
            <h3>Rendez-vous du jour</h3>
            <p className="card-value">0</p>
          </div>
          <div className="card">
            <h3>Patients</h3>
            <p className="card-value">0</p>
          </div>
          <div className="card">
            <h3>Propriétaires</h3>
            <p className="card-value">0</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
