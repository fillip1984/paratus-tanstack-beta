import { Link } from '@tanstack/react-router'

export default function SideNav() {
  return (
    <nav className="flex flex-col">
      <div className="px-2 font-bold">
        <Link to="/">HomeSSS</Link>
      </div>

      <div className="px-2 font-bold">
        <Link to="/demo/tanstack-query">TanStack Query</Link>
      </div>

      <div className="px-2 font-bold">
        <Link to="/demo/start/server-funcs">Start - Server Functions</Link>
      </div>

      <div className="px-2 font-bold">
        <Link to="/demo/start/api-request">Start - API Request</Link>
      </div>
    </nav>
  )
}
