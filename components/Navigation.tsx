'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            🎓 Spanish Learner
          </Link>

          <div className="flex gap-6">
            <Link
              href="/"
              className={`rounded px-3 py-2 ${
                pathname === '/'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>

            <Link
              href="/upload"
              className={`rounded px-3 py-2 ${
                isActive('/upload')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Upload
            </Link>

            <Link
              href="/learn"
              className={`rounded px-3 py-2 ${
                isActive('/learn')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Learn
            </Link>

            <Link
              href="/stats"
              className={`rounded px-3 py-2 ${
                isActive('/stats')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Stats
            </Link>

            <Link
              href="/playlist"
              className={`rounded px-3 py-2 ${
                isActive('/playlist')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Playlist
            </Link>

            <Link
              href="/sentences"
              className={`rounded px-3 py-2 ${
                isActive('/sentences')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Sentences
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
