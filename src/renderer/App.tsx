import React from 'react';
import { BrowserRouter as Router, Redirect, Route, RouteProps, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Header from './components/Header';
import { Provider } from 'react-redux';
import store from './store';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthenticatedUser } from './services/authService';

interface PrivateRouteProps extends RouteProps {
    component: React.ComponentType<any>;
    allow?: (user: AuthenticatedUser | undefined) => boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, allow, ...rest }) => {
    const { isAuthenticated, user } = useAuth();

    return (
        <Route
            {...rest}
            render={(props) => {
                if (!isAuthenticated) {
                    return <Redirect to={{ pathname: '/login', state: { from: props.location?.pathname } }} />;
                }

                if (allow && !allow(user)) {
                    return <Redirect to="/sales" />;
                }

                return <Component {...props} />;
            }}
        />
    );
};

const AppShell: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="app-shell">
            {isAuthenticated && <Header />}
            <main className="app-main">
                <div className="app-main__inner">
                    <Switch>
                        <Route path="/" exact>
                            <Redirect to="/login" />
                        </Route>
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                        <PrivateRoute path="/dashboard" component={Dashboard} />
                        <PrivateRoute path="/sales" component={Sales} />
                        <PrivateRoute
                            path="/purchases"
                            component={Purchases}
                            allow={(user) => Boolean(user?.canManageInventory)}
                        />
                        <Redirect to="/login" />
                    </Switch>
                </div>
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <AuthProvider>
                <Router>
                    <AppShell />
                </Router>
            </AuthProvider>
        </Provider>
    );
};

export default App;