import  { useEffect, useState } from 'react';

import Featured from './feature';

import TestimonialsSection from './testimonia';
import FooterPage from './footer';
import { HeroScrollDemo } from './ui/macBook';
const Hero = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check authentication status on component mount
    const userInfo = localStorage.getItem('userInfo');
    setIsLoggedIn(!!userInfo);
  }, []);

  return (
    <div className="overflow-x-hidden bg-gray-50">
      <header className="py-4 md:py-6">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0">
              <a
                href="#"
                className="flex rounded outline-none focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
              >
                <img
                  className="w-auto h-24"
                  src="/horisantalLogo.png"
                  alt="ERP Logo"
                />
              </a>
            </div>

            <div className="flex lg:hidden">
              <button
                type="button"
                className="text-gray-900"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
              >
                {!isExpanded ? (
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* <div className="hidden lg:flex lg:ml-16 lg:items-center lg:justify-center lg:space-x-10 xl:space-x-16">
              {['Features', 'Pricing', 'Automation'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-base font-medium text-gray-900 transition-all duration-200 rounded focus:outline-none font-pj hover:text-opacity-50 focus:ring-1 focus:ring-gray-900 focus:ring-offset-2"
                >
                  {item}
                </a>
              ))}
            </div> */}

<div className="hidden lg:ml-auto lg:flex lg:items-center lg:space-x-10">
              {isLoggedIn ? (
                <a
                  href="/Dashboard/Home"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  Dashboard
                </a>
              ) : (
                <a
                  href="/SignIn"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                >
                  Sign In
                </a>
              )}
            </div>
          </div>

          
          {isExpanded && (
            <nav>
              <div className="px-1 py-8">
                <div className="grid gap-y-7">
                  {/* ... other links ... */}

                  {/* Mobile conditional rendering */}
                  {isLoggedIn ? (
                    <a
                      href="/Dashboard/Home"
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      Dashboard
                    </a>
                  ) : (
                    <a
                      href="/SignIn"
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-bold leading-7 text-white transition-all duration-200 bg-gray-900 border border-transparent rounded-xl hover:bg-gray-600 font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                      Sign In
                    </a>
                  )}
                </div>
              </div>
            </nav>
          )}
        </div>
      </header>

      <section className="pt-12 bg-gray-50 sm:pt-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="px-6 text-lg text-gray-600 font-inter">
            Streamline, Track, and Grow — All in One Powerful Multi-Tenant Platform
            </h1>
            <p className="mt-5 text-2xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-3xl lg:text-4xl lg:leading-tight font-pj">
            The next-generation inventory management software designed for modern
              <span className="relative inline-flex sm:inline">
                <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0" />
                <span className="relative"> business </span>
              </span>
            </p>

            <div className="px-8 sm:items-center sm:justify-center sm:px-0 sm:space-x-5 sm:flex mt-9">
              <a
                href="#"
                className="inline-flex items-center justify-center w-full px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-gray-900 border-2 border-transparent sm:w-auto rounded-xl font-pj hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                Get more Info
              </a>

              <a
                href="#"
                className="inline-flex items-center justify-center w-full px-6 py-3 mt-4 text-lg font-bold text-gray-900 transition-all duration-200 border-2 border-gray-400 sm:w-auto sm:mt-0 rounded-xl font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 focus:bg-gray-900 hover:text-white focus:text-white hover:border-gray-900 focus:border-gray-900"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 18 18"
                  fill="none"
                  stroke="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.18003 13.4261C6.8586 14.3918 5 13.448 5 11.8113V5.43865C5 3.80198 6.8586 2.85821 8.18003 3.82387L12.5403 7.01022C13.6336 7.80916 13.6336 9.44084 12.5403 10.2398L8.18003 13.4261Z"
                    strokeWidth="2"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Watch free demo
              </a>
            </div>

            <p className="mt-8 text-base text-gray-500 font-inter">
              30 Days free trial · No credit card required.
            </p>
          </div>
        </div>

        <div className="pb-12 bg-white">
          <div className="relative">
            <div className="absolute inset-0 h-2/3 bg-gray-50" />
            <div className="relative mx-auto">
              <div className="lg:max-w-6xl lg:mx-auto">
                <HeroScrollDemo/>
              </div>
            </div>
          </div>
        </div>
      
      </section>
      <Featured />
      <TestimonialsSection/>
      <FooterPage/>
    </div>
  );
};

export default Hero;