<<<<<<< HEAD
import { createBrowserRouter, RouterProvider, } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { ToastContainer, Bounce } from 'react-toastify';
=======
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { ToastContainer, Bounce } from "react-toastify";
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
import { Dashboard } from "./pages/Dashboard";
import { HomeLayout } from "./Layouts/HomeLayout";
import { Settings } from "./pages/Settings";
import { Reports } from "./pages/Reports";
import { Officials } from "./pages/Officials";
import { Polls } from "./pages/Polls";
import { Petitions } from "./pages/Petitions";
import { PetitionForm } from "./pages/PetitionForm";
import { PollsForm } from "./pages/PollsForm";
<<<<<<< HEAD

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
=======
import { Profile } from "./pages/Profile";
import { HelpSupport } from "./pages/HelpSupport";
import { PageNotFound } from "./pages/PageNotFound";


const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  {
    path: "/home",
    element: <HomeLayout />,
    children: [
<<<<<<< HEAD
      {
        path: '/home/dashboard',
        element: <Dashboard />
      },
      {
        path: '/home/petitions',
        element: <Petitions />
      },
      {
        path: '/home/petitions/form',
        element: <PetitionForm />
      },
      {
        path: '/home/polls',
        element: <Polls />
      },
      {
        path: '/home/polls/form',
        element: <PollsForm />
      },
      {
        path: '/home/officials',
        element: <Officials />
      },
      {
        path: '/home/reports',
        element: <Reports />
      },
      {
        path: '/home/settings',
        element: <Settings />
      },
    ]
  },
=======
      { path: "dashboard", element: <Dashboard /> },
      { path: "profile", element: <Profile /> },
      { path: "petitions", element: <Petitions /> },
      { path: "petitions/form", element: <PetitionForm /> },
      { path: "polls", element: <Polls /> },
      { path: "polls/form", element: <PollsForm /> },
      { path: "officials", element: <Officials /> },
      { path: "reports", element: <Reports /> },
      { path: "settings", element: <Settings /> },
      { path: "help-support", element: <HelpSupport /> },
    ],
  },
  { path: "*" , element: <PageNotFound/>}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
]);

function App() {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-blue-100 flex">
=======
    <div className="min-h-screen bg-[#fdf3e7] flex flex-col">
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
<<<<<<< HEAD
        closeOnClick={false}
=======
        closeOnClick
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
<<<<<<< HEAD
        theme="light"
=======
        theme="colored"
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        transition={Bounce}
        style={{ zIndex: 1000000 }}
      />
      <RouterProvider router={router} />
    </div>
  );
}

<<<<<<< HEAD
=======



>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
export default App;
