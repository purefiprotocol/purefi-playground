import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Navbar } from '../Navbar';
import './Layout.css';

function Layout() {
  return (
    <>
      <Navbar />
      <main className="main py-3">
        <Outlet />
      </main>
      <ToastContainer />
    </>
  );
}

export default Layout;
