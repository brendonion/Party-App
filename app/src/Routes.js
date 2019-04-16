import React from 'react';
import { Route, Switch } from 'react-router';
import * as routes from './constants/routes';

import Home from './components/Home';

const Routes = (props) => {
  return (
    <div>
      <Switch>
        <Route exact path={routes.HOME} component={Home} />
        <Route render={(props) => <div>404 - Not Found</div>} />
      </Switch>
    </div>
  )
}

export default Routes
