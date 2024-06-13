import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <div className="hidden lg:block">
        <div className="container">
            <div className="flex w-fit gap-10 mx-auto font-medium py-4 text-blackish">
                <Link href="#">HOME</Link>
                <Link href="#">CATEGORIES</Link>
                <Link href="#">MEN&apos;S</Link>
                <Link href="#">WOMEN&apos;S</Link>
                <Link href="#">EURO &apos;24</Link>
                <Link href="#">RETRO</Link>
                <Link href="#">CLUBS</Link>
                <Link href="#">HOT OFFERS</Link>
            </div>
        </div>
    </div>
  );
}

export default Navbar;
