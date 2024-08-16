import {useEffect, useState} from 'react'
import {Outlet, Navigate} from 'react-router-dom'

const ProtectedRoutes = () => {
  const [hasVisited, setHasVisited] = useState<boolean | null>(null)

  useEffect(() => {
    const visited = localStorage.getItem('hasVisited') === 'true'
    setHasVisited(visited)
    console.log('ProtectedRoutes: hasVisited:', visited)
  }, [])

  if (hasVisited === null) {
    // While checking the `hasVisited` state, you might want to show a loading indicator or return null
    return null
  }

  return hasVisited ? <Outlet /> : <Navigate to="/intro" />
}

export default ProtectedRoutes
