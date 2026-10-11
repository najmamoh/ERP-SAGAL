// import React from 'react'
// import {
//     Sheet,
//     SheetContent,
//     SheetDescription,
//     SheetHeader,
//     SheetTitle,
//     SheetTrigger,
//   } from "@/components/ui/sheet"
// import { RiMenu2Fill } from 'react-icons/ri'
  

// const SHEET_SIDES = ["top", "left"] as const
 
// type SheetSide = (typeof SHEET_SIDES)[number]

// function SideParsm() {
//   return (
//     <div>
//            {SHEET_SIDES.map((side) => ( 

//                <Sheet key={side}>
//     <SheetTrigger><RiMenu2Fill/></SheetTrigger>
//     <SheetContent key={side} className="w-[400px] sm:w-[540px] bg-white">
//       <SheetHeader>
//         <SheetTitle>Are you absolutely sure?</SheetTitle>
//         <SheetDescription>
//           This action cannot be undone. This will permanently delete your account
//           and remove your data from our servers.
//         </SheetDescription>
//       </SheetHeader>
//     </SheetContent>
//   </Sheet>
//         ))}
//   </div>
//   )
// }

// export default SideParsm

import  { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  // SheetDescription,
  // SheetHeader,
  // SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { RiMenuFold2Fill } from 'react-icons/ri';
// import { MdAnalytics, MdOutlineCancel, MdOutlinePayment } from 'react-icons/md';
// import { AiOutlineProduct } from 'react-icons/ai';
// import { FaSellsy } from 'react-icons/fa';
// import { IoIosNotifications, IoIosSettings } from 'react-icons/io';
// import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { useStateContext } from './ui/ContextProvider';
import { links } from '../components/ui/Yumm';
import { Link } from 'react-router-dom';
import { SiShopware } from 'react-icons/si';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/Redux/Store';
import { getOneCompanayFN } from '@/Redux/Slice/GetOneCompanaySlice';
import { useDispatch } from 'react-redux';

const SHEET_SIDES = ['top', 'left'] as const;

type SheetSide = (typeof SHEET_SIDES)[number];

function SideParsm() {
  const [selectedSide, _setSelectedSide] = useState<SheetSide>('left');
  // console.log(setSelectedSide)

  const { currentColor, activeMenu, setActiveMenu, screenSize, } = useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu !== undefined && screenSize! <= 1024) {
      setActiveMenu(false);
      
    }
    
  };


  useEffect(() => {
    // Check the theme preference stored in local storage
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.body.classList.add('DarkSide');
    } else {
      document.body.classList.remove('DarkSide');
    }
  }, []);

    const dispatch = useDispatch<AppDispatch>();

  const activeLink = `flex items-center rounded-xl  gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2 bg-gradient-to-r from-[#605bff] to-[#3a3799] shadow-[0_4px_23px_0_rgba(96,91,255,0.5)] `;
  const normalLink = 'flex items-center rounded-xl gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-white hover:bg-light-gray m-2';
     const GetOneCompanayState = useSelector((state: RootState) => state.GetOneCompanay);
       useEffect(() => {
         dispatch(getOneCompanayFN());
       }, [dispatch]);
  return (
    <div className='mt-0 '>
      <Sheet>
        <SheetTrigger>
          <div className='text-2xl bg-transparent dark:text-white'>
          
          <RiMenuFold2Fill />
          </div>
        </SheetTrigger>
        <SheetContent side={selectedSide} className="w-[100%]  border-none  ">
          {/* <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </SheetDescription>
          </SheetHeader> */}
         <div className={`bg-white w-[100%] h-screen pb-10 overflow-y-auto ${localStorage.getItem('theme') === 'dark' ? 'DarkSide' : ''}`}>
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link to="/" onClick={handleCloseSideBar} className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white  text-slate-900">
              <SiShopware /> <span>{GetOneCompanayState.data.company_name}</span>
            </Link>
            {/* <div content="Menu" position="BottomCenter">
              <button
                type="button"
                onClick={() => setActiveMenu(!activeMenu)}
                style={{ color: currentColor }}
                className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
              >
                <MdOutlineCancel />
              </button>
            </div> */}
          </div>
          <div className="mt-10 ">
            {links.map((item,index) => (
              <div key={`${item.title}-${index}`}>
                <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
                  {item.title}
                </p>
                {item.links.map((link) => (
                  <NavLink
                  to={`/Dashboard/${link.name}`}
                  key={link.name}
                  onClick={handleCloseSideBar}
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? currentColor : ''
                  })}
                  // active ClassName={activeLink}
                  className={({isActive}) => `${isActive ? activeLink : normalLink}`}
                >
                    {link.icon}
                    <span className="capitalize ">{(link as { label?: string }).label || link.name}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default SideParsm;