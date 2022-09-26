import Link from 'next/link';

export function Header() {
  return (
    <header>
      <Link href="/home">
        {'ActivityWeb'}
      </Link>
    </header>
  )
}