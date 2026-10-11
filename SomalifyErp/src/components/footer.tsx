import React from 'react';

const FooterPage: React.FC = () => {
    return (
        <section className="py-10 bg-white sm:pt-16 lg:pt-24">
            <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-2 md:col-span-3 lg:grid-cols-6 gap-y-16  gap-x-12">
                    <div className="col-span-2 md:col-span-3 lg:col-span-2 lg:pr-8">
                        <img className="w-auto h-16" src="horisantalLogo.png" alt="ERP Logo" />

                        <p className="text-base leading-relaxed text-gray-600 mt-7">
                        KaydHub is the ultimate SaaS inventory management system built for today's fast-moving businesses. 
                        </p>

                        <ul className="flex items-center space-x-3 mt-9">
    {/* Facebook */}
    <li>
        <a 
            href="https://www.facebook.com/people/Tamaam-Tech-and-Innovations/100070874105211/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-600 focus:bg-blue-600"
        >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
            </svg>
        </a>
    </li>
    
    {/* WhatsApp */}
    <li>
        <a 
            href="https://wa.me/252634775169" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-green-500 focus:bg-green-500"
        >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
        </a>
    </li>
    
    {/* Instagram */}
    <li>
        <a 
            href="https://www.instagram.com/tamamtech3?utm_source=qr&igsh=MTdkdDVjcGpyd2ppbg==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-pink-600 focus:bg-pink-600"
        >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.999 7.377a4.623 4.623 0 1 0 0 9.248 4.623 4.623 0 0 0 0-9.248zm0 7.627a3.004 3.004 0 1 1 0-6.008 3.004 3.004 0 0 1 0 6.008z" />
                <circle cx="16.806" cy="7.207" r="1.078" />
                <path d="M20.533 6.111A4.605 4.605 0 0 0 17.9 3.479a6.606 6.606 0 0 0-2.186-.42c-.963-.042-1.268-.054-3.71-.054s-2.755 0-3.71.054a6.554 6.554 0 0 0-2.184.42 4.6 4.6 0 0 0-2.633 2.632 6.585 6.585 0 0 0-.419 2.186c-.043.962-.056 1.267-.056 3.71 0 2.442 0 2.753.056 3.71.015.748.156 1.486.419 2.187a4.61 4.61 0 0 0 2.634 2.632 6.584 6.584 0 0 0 2.185.45c.963.042 1.268.055 3.71.055s2.755 0 3.71-.055a6.615 6.615 0 0 0 2.186-.419 4.613 4.613 0 0 0 2.633-2.633c.263-.7.404-1.438.419-2.186.043-.962.056-1.267.056-3.71s0-2.753-.056-3.71a6.581 6.581 0 0 0-.421-2.217z" />
            </svg>
        </a>
    </li>
    
    {/* LinkedIn */}
    <li>
        <a 
            href="https://www.linkedin.com/company/tamaamtech" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center text-white transition-all duration-200 bg-gray-800 rounded-full w-7 h-7 hover:bg-blue-700 focus:bg-blue-700"
        >
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
        </a>
    </li>
</ul>
                    </div>
                   
                    <div>
                        <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">Help</p>
                        <ul className="mt-6 space-y-4">
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Customer Support </a>
                            </li>
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Delivery Details </a>
                            </li>
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Terms & Conditions </a>
                            </li>
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Privacy Policy </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">Company</p>
                        <ul className="mt-6 space-y-4">
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> About </a>
                            </li>
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Features </a>
                            </li>
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Works </a>
                            </li>
                            <li>
                                <a href="#" className="flex text-base text-black transition-all duration-200 hover:text-blue-600 focus:text-blue-600"> Career </a>
                            </li>
                        </ul>
                    </div>

                    <div className="col-span-2 md:col-span-1 lg:col-span-2 lg:pl-8">
                        <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">Subscribe to newsletter</p>
                        <form action="#" method="POST" className="mt-6">
                            <div>
                                <label htmlFor="email" className="sr-only">Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    placeholder="Enter your email" 
                                    className="block w-full p-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600" 
                                />
                            </div>
                            <button type="submit" className="inline-flex items-center justify-center px-6 py-4 mt-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-md hover:bg-blue-700 focus:bg-blue-700">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
                <hr className="mt-16 mb-10 border-gray-200" />
                <p className="text-sm text-center text-gray-600">© Copyright 2025, All Rights Reserved by KaydHUB</p>
            </div>
        </section>
    );
};

export default FooterPage;