import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Header from './components/Header';
import { Provider } from 'react-redux';
import store from './store';

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Header />
                <Switch>
                    <Route path="/" exact component={Login} />
                    <Route path="/dashboard" component={Dashboard} />
                    <Route path="/sales" component={Sales} />
                    <Route path="/purchases" component={Purchases} />
                </Switch>
            </Router>
        </Provider>
    );
};

export default App;