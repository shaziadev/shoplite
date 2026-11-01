import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }) =>
  `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`;

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-indigo-600">
          ShopLite
        </Link>

        <div className="flex items-center gap-5">
          <NavLink to="/" end className={linkClass}>Shop</NavLink>
          {user && <NavLink to="/orders" className={linkClass}>Orders</NavLink>}
          {isAdmin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
          <NavLink to="/cart" className={linkClass}>
            Cart
            {count > 0 && (
              <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">{count}</span>
            )}
          </NavLink>

          {user ? (
            <button onClick={logout} className="btn-outline">Log out</button>
          ) : (
            <Link to="/login" className="btn-primary">Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
