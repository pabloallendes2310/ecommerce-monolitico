import { useEffect, useState } from 'react'

import Loading from '../components/Loading'
import { getHealth } from '../services/api'
import './Health.css'

function Health() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    getHealth().then(setHealth)
  }, [])

  if (!health) {
    return <Loading label="Validando estado" />
  }

  return (
    <main className="health-page">
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </main>
  )
}

export default Health
