export default function Dashboard() {
  return (
    <>
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
    </>
  )
}
