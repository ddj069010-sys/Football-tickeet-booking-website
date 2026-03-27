// ─── User Layout ───
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function UserLayout() {
    return (
        <div className="app">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
