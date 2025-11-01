<<<<<<< HEAD
import { Outlet } from "react-router-dom";
=======
import { Outlet , useLocation} from "react-router-dom";
import {useEffect} from "react";
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
import {NavBar} from '../components/NavBar';
import {Footer} from '../components/Footer'
import { SideBar } from "../components/SideBar"

export const HomeLayout = () => {
<<<<<<< HEAD
=======
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, [pathname]);
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  
  return <div className="w-full h-full">
    <NavBar/>
    <div className='w-full flex gap-1 mt-15'>
      <SideBar/>
<<<<<<< HEAD
      <div className='ml-14 md:ml-50 w-full p-2 md:p-3'>
      <Outlet/>
      </div>
=======
      <div className="border-t-5 border-[#d6bfa6] text-[#3a2e28] w-full">
        <div className='ml-18 md:ml-50 p-3 md:p-4'>
      <Outlet/>
      </div>
      </div>
      
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    </div>
    <Footer/>
  </div>
 
<<<<<<< HEAD
}
=======
}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
