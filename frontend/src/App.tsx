import { useState } from 'react';
import './App.css';

const API = 'http://localhost:3000/api/tickets/conflicts';

function App() {
  const [bbox, setBbox] = useState('-80.00,43.18,-79.65,43.38');
  const [station, setStation] = useState('');
  const [utility, setUtility] = useState('');
  const [radius, setRadius] = useState('250');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({
        bbox,
        radiusMeters: radius,
      });

      if (station) params.set('stationCode', station);
      if (utility) params.set('utilityType', utility);

      const response = await fetch(`${API}?${params}`);

      if (!response.ok) throw new Error(await response.text());

      setData(await response.json());
    } catch (err: any) {
      setError(err.message || 'Unable to load tickets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Utility Ticket Dashboard</h1>
        <p>Ticket Conflict & Service Area Validator</p>
      </header>

      <section className="filters">
        <label>
          Bounding Box
          <input value={bbox} onChange={e => setBbox(e.target.value)}
            placeholder="minLng,minLat,maxLng,maxLat" />
        </label>

        <label>
          Station Code
          <input value={station} onChange={e => setStation(e.target.value)}
            placeholder="All stations" />
        </label>

        <label>
          Utility Type
          <select value={utility} onChange={e => setUtility(e.target.value)}>
            <option value="">All utilities</option>
            <option value="WATER">WATER</option>
            <option value="GAS">GAS</option>
            <option value="SANITARY">SANITARY</option>
            <option value="TELECOM">TELECOM</option>
          </select>
        </label>

        <label>
          Radius (meters)
          <input type="number" value={radius}
            onChange={e => setRadius(e.target.value)} />
        </label>

        <button onClick={search} disabled={loading}>
          {loading ? 'Searching...' : 'Search Tickets'}
        </button>
      </section>

      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <section className="cards">
            <div>Total Tickets<h2>{data.summary.total}</h2></div>
            <div className="high">High Risk<h2>{data.summary.highRisk}</h2></div>
            <div className="medium">Medium Risk<h2>{data.summary.mediumRisk}</h2></div>
            <div className="low">Low Risk<h2>{data.summary.lowRisk}</h2></div>
            <div>Outside Area<h2>{data.summary.outsideServiceArea}</h2></div>
          </section>

          <h2>Tickets</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Ticket No.</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Station</th>
                  <th>Utility</th>
                  <th>Service Area</th>
                  <th>Nearest Emergency</th>
                  <th>Distance (m)</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {data.tickets.map((ticket: any) => (
                  <tr key={ticket.id}>
                    <td>{ticket.ticketNo}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.priority}</td>
                    <td>{ticket.stationCode}</td>
                    <td>{ticket.utilityType}</td>
                    <td>{ticket.insideServiceArea ? 'Inside' : 'Outside'}</td>
                    <td>{ticket.nearestEmergencyTicketNo || '-'}</td>
                    <td>{ticket.distanceToNearestEmergencyMeters ?? '-'}</td>
                    <td>
                      <span className={`risk ${ticket.riskLevel.toLowerCase()}`}>
                        {ticket.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;