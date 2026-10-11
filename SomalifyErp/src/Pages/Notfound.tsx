

import Lottie from 'lottie-react';
import animationData from '../assets/notFound.json';
import { Link } from 'react-router-dom';

function Notfound() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
    <Lottie
      animationData={animationData}
      loop
      className="w-full dark:text-white max-w-[400px]"
    />
    <Link to={'/Dashboard/Home'}>
    <button className='bg-cyan-600 rounded-xl p-2 text-white'> Back to home </button>
    </Link>
  </div>
  )
}

export default Notfound