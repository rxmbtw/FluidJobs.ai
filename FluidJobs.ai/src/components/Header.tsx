/**
 * Header component
 * Props: none
 * Responsibilities: Renders breadcrumb, search input, notifications, and profile dropdown
 * Role-based behavior: Can be extended to show different breadcrumbs or notifications based on user role
 */
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <span>Dashboard</span>
        {/* Add dynamic breadcrumbs here */}
      </nav>
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        className="border rounded px-2 py-1 text-sm"
      />
      {/* Notifications */}
      <button className="mx-2" title="Notifications">
        <span role="img" aria-label="bell">🔔</span>
      </button>
      {/* Profile dropdown */}
      <div className="relative">
        <button className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neutral-dark" />
          <span className="text-xs">Profile</span>
        </button>
        {/* Dropdown menu placeholder */}
      </div>
    </header>
  );
};

export default Header;
