import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <div className="hidden lg:block">
        <div className="container">
            <div className="flex w-fit gap-10 mx-auto font-medium py-4 text-blackish">
                <Link className='navbar__link relative' href="#">HOME</Link>
                <Link className='navbar__link relative' href="#">CATEGORIES</Link>
                <Link className='navbar__link relative' href="#">MEN&apos;S</Link>
                <Link className='navbar__link relative' href="#">WOMEN&apos;S</Link>
                <Link className='navbar__link relative' href="#">EURO &apos;24</Link>
                <Link className='navbar__link relative' href="#">RETRO</Link>
                <Link className='navbar__link relative' href="#">CLUBS</Link>
                <Link className='navbar__link relative' href="#">HOT OFFERS</Link>
            </div>
        </div>
    </div>
  );
}

export default Navbar;
