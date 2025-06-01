import Modal from 'react-modal'

import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { FaCalendarDay, FaCalendarWeek, FaInbox, FaPlus } from 'react-icons/fa6'

export default function SideNav() {
  const navItems = [
    { to: '/search', label: 'Search', icon: FaSearch },
    { to: '/inbox', label: 'Inbox', icon: FaInbox },
    { to: '/today', label: 'Today', icon: FaCalendarDay },
    { to: '/upcoming', label: 'Upcoming', icon: FaCalendarWeek },
  ]
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false)

  return (
    <>
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

        <div className="flex items-center justify-between px-2">
          <h4>Collections</h4>
          <button
            onClick={() => setIsAddCollectionOpen(true)}
            className="text-primary">
            <FaPlus />
          </button>
        </div>
      </nav>

      <Modal isOpen={isAddCollectionOpen}>
        <div>Test</div>
      </Modal>
    </>
  )
}
