// ─── Admin Layout ───
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AdminLayout() {
    return (
        <div className="app admin-theme">
            <Navbar />
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
