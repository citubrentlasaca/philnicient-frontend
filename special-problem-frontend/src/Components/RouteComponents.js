import { Navigate } from 'react-router-dom';

export const PublicRoute = ({ component: Component, redirectTo }) => {
    const token = sessionStorage.getItem('access_token');
    return token ? <Navigate to={redirectTo} /> : <Component />;
};

export const PrivateRoute = ({ component: Component, redirectTo }) => {
    const token = sessionStorage.getItem('access_token');
    return token ? <Component /> : <Navigate to={redirectTo} />;
};