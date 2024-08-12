import { Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import Logo from "../utils/Smilepoint_Dental.png"

// const navigation = [
//   { name: "Scheduled Patients", href: "/schedule-patient", current: true },
//   { name: "Ivs Awaiting", href: "/awaitingIV", current: false },
//   { name: "Request a Rush", href: "/request-rush", current: false },
//   { name: "Assign IVs", href: "/admin", current: false },
//   { name: "Dashboard", href: "/admin-dashboard", current: false },
//   { name: "Log Out", href: "/", current: false },
// ];

const userRole = localStorage.getItem("role");

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

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const Header = () => {
  return (
    <Disclosure as="nav" className="bg-gray-800 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 ">
            <div className="relative flex h-16 items-center   " >
              <div className="flex justify-between items-center w-full px-2 sm:px-6 lg:px-8">
                <div className="flex items-center  ">
                  <img
                    className="h-11 w-auto bg-slate-100"
                    src={Logo}
                    alt="SmilePoint Dental"
                  />
                </div>
                <div className="hidden sm:ml-6 sm:block sm:flex-grow sm:flex sm:justify-end font-tahoma ">
                  <div className="flex space-x-4">
                    {navigation.map((item) => {
                      if (item.show)
                        return (
                          <a
                            key={item.text}
                            href={item.link}
                            className={classNames(
                              "bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-700 hover:text-white"
                            )}
                            aria-current={item.show ? "page" : undefined}
                          >
                            {item.text}
                          </a>
                        );
                    })}
                  </div>
                </div>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              ></Transition>
            </div>
          </div>
        </>
      )}
    </Disclosure>
  );
};

export default Header;
