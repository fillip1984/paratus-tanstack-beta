import { Link } from '@tanstack/react-router'
import {
  FaCalendarDay,
  FaCalendarWeek,
  FaInbox,
  FaSearch,
} from 'react-icons/fa'

export default function SideNav() {
  const navItems = [
    { to: '/search', label: 'Search', icon: FaSearch },
    { to: '/inbox', label: 'Inbox', icon: FaInbox },
    { to: '/today', label: 'Today', icon: FaCalendarDay },
    { to: '/upcoming', label: 'Upcoming', icon: FaCalendarWeek },
  ]
  return (
    <nav className="bg-foreground m-2 flex flex-col rounded-xl py-2 transition duration-150">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`[&.active]:bg-background hover:text-primary ml-2 flex items-center rounded-l-xl p-4`}>
          <item.icon className="mr-2" />
          {item.label}
        </Link>
      ))}

      {/* <div className="px-2 font-bold">
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
      </div> */}
    </nav>
  )
}
