import React from 'react';
import ProductCard from './ProductCard';

const productsData = [
    {
        img:"/England.webp",
        title: "England Euro 24",
        desc: "Home Kit",
        rating: 5,
        price: "50.00",
    },
    {
        img:"/France.jpg",
        title: "France Euro 24",
        desc: "Home Kit",
        rating: 4,
        price: "50.00",
    },
    {
        img:"/Belgium.webp",
        title: "Belgium Euro 24",
        desc: "Home Kit",
        rating: 5,
        price: "50.00",
    },
    {
        img:"/Portugal.webp",
        title: "Portugal Euro 24",
        desc: "Home Kit",
        rating: 4,
        price: "50.00",
    },
    {
        img:"/Germany.webp",
        title: "Germany Euro 24",
        desc: "Home Kit",
        rating: 5,
        price: "50.00",
    },
    {
        img:"/Germany Retro.webp",
        title: "Germany 1996 Retro ",
        desc: "Home Kit",
        rating: 5,
        price: "50.00",
    },
    {
        img:"/Predator.avif",
        title: "Adidas Predator Boots",
        desc: "Home Kit",
        rating: 5,
        price: "30.00",
    },
    {
        img:"/Grey Adidas.avif",
        title: "Adidas Strung Boots",
        desc: "Home Kit",
        rating: 4,
        price: "30.00",
    },
];

const NewProducts = () => {
  return (
    <div>
        <div className='container pt-16'>
            <h2 className='font-medium text-2xl pb-4'>Latest Products</h2>

            <div className='grid grid-cols-1 place-items-center sm:place-items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 xl:gap-x-20 xl:gap-y-10'>
                {productsData.map((item,index) => (
                <ProductCard key={index} img={item.img} title={item.title} desc={item.desc} rating={item.rating} price={item.price}/>
            ))}
            </div>
        </div>
      
    </div>
  )
}

export default NewProducts
