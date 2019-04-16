import React from 'react';
import { Route, Switch } from 'react-router';
import * as routes from './constants/routes';

import Game from './components/Game';

const Routes = (props) => {
  return (
    <Switch>
      <Route exact path={routes.HOME} component={Game} />
      <Route render={(props) => <div>Page Not Found</div>} />
    </Switch>
  );
}

export default Routes
