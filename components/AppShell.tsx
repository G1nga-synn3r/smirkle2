'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navigation from './Navigation';
import type { NavSection } from '@/lib/types';

const pathToSection: Record<string, NavSection> = {
  '/': 'home',
  '/leaderboards': 'leaderboards',
  '/search': 'search',
  '/profile': 'profile',
  '/friends': 'friends',
  '/submit': 'submit',
  '/settings': 'settings',
};

const sectionToPath: Record<NavSection, string> = {
  home: '/',
  leaderboards: '/leaderboards',
  search: '/search',
  profile: '/profile',
  friends: '/friends',
  submit: '/submit',
  settings: '/settings',
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine active section from pathname
  const getActiveSection = (): NavSection => {
    // Check exact match first
    if (pathToSection[pathname]) return pathToSection[pathname];
    // Check prefix match (for dynamic routes like /profile/[id])
    for (const [path, section] of Object.entries(pathToSection)) {
      if (pathname.startsWith(path) && path !== '/') return section;
    }
    return 'home';
  };

  const handleSectionChange = (section: NavSection) => {
    router.push(sectionToPath[section]);
  };

  return (
    <>
      {children}
      <Navigation
        activeSection={getActiveSection()}
        onSectionChange={handleSectionChange}
        isVisible={true}
      />
    </>
  );
}
