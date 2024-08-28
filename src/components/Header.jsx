import {useState ,useEffect} from "react"
 
import { Disclosure } from "@headlessui/react";
import Logo from "../utils/Smilepoint_Dental.png";
import { useHistory } from "react-router-dom";

// const navigation = [
//   { name: "Scheduled Patients", href: "/schedule-patient", current: true },
//   { name: "Ivs Awaiting", href: "/awaitingIV", current: false },
//   { name: "Request a Rush", href: "/request-rush", current: false },
//   { name: "Assign IVs", href: "/admin", current: false },
//   { name: "Dashboard", href: "/admin-dashboard", current: false },
//   { name: "Log Out", href: "/", current: false },
// ];
 
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Header = () => {
  const history = useHistory();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
     
    const storedUserRole = localStorage.getItem('role');
    if (storedUserRole) {
      setUserRole(storedUserRole);
    }
  }, []);



  const navigation = [
    { link: "/schedule-patient", text: "Scheduled Patients", show: true },
    { link: "/awaitingIV", text: "IVs Awaiting", show: true },
    { link: "/request-rush", text: "Request a Rush", show: true },
    {
      link: "/admin",
      text: "Assign IVs",
      show: userRole == "admin" ? true : false,
    },
    {
      link: "/admin-dashboard",
      text: "Dashboard",
      show: userRole == "admin" ? true : false,
    },
    {
      link: "/dashboard",
      text: "Dashboard",
      show: userRole == "user" ? true : false,
    },
    { link: "/", text: "Log Out", show: true },
  ];
  return (
    <Disclosure as="nav" >
      {({ open }) => (
        <>
         <div className="bg-blue-950 w-full">
         <div className="w-full px-4 sm:px-6 lg:px-8">
         <div className="flex h-16 items-center justify-between w-full">
      <div className="flex items-center">
        <img
          className="h-11 w-auto rounded-md bg-slate-100"
          src={Logo}
          alt="SmilePoint Dental"
        />
      </div>
      <div className="flex items-center space-x-4 font-tahoma">
        {navigation.map((item) => {
          if (item.show)
            return (
              <button
                key={item.text}
                onClick={() => history.push(item.link)}
                className="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                aria-current={item.show ? "page" : undefined}
              >
                {item.text}
              </button>
            );
        })}
      </div>
    </div>
  </div>
         </div>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
