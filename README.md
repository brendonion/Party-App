## Boilerplate README

#### About:

This is the frontend boilerplate for all React projects going forward. Configured to be pushed to AWS ECR (Elastic Container Registry) and deployable to Elastic Beanstalk. The Jenkinsfile and Webpack configuration are good to go. Now all you need to do is start coding.

#### Main Stack:

- React
- Redux
- Webpack
- Docker

#### Developers:

Brendan Walker & Jiawei Wu

---

### DEVELOPMENT

##### To build and run container locally:

`make local`

- *App is running at localhost:3000*
- *Hot reloading is still enabled*
- *IMPORTANT - For running tests, run npm install locally before running this command*

##### To run local container:

`make run-local`

- *Only run this command if you've already built the local image and the container is not running*

##### Remove local container:

`make close-local`

##### To SSH into local container:

`make workspace`

- *Used for installing new dependencies and configuration*

##### To run production container locally:

`make run-production`

##### Remove local production container

`make close-production`

---

### DEPLOYMENT:

Jenkins will handle deployment, it just needs to be set up for the project. Please refer to this (documentation)[https://docs.google.com/document/d/1NGeC-p3m4RwSE6MCdXEDeqVp9WL7iUmSn-oPtCK9Vxc/edit].

---

## GUIDELINES

#### Files/Components:

- Consistent file naming scheme
i.e. Home.js -> HomeSidebar.js -> HomeFooter.js

- Containers (i.e. Home.js) contain logic and state (connect to redux) and pass props to sub components (i.e. HomeSidebar.js)

- Put reusable components in one folder in components folder: components -> common -> Countdown.js, GoogleMap.js, etc.

- Component classes are named the same as the files in which they are contained
i.e. Nav.js -> ```class Nav extends Component {...}```

- Organize imports in all files - modules at top, components below modules

i.e. (in order) 

~~~
import React, { Component } from 'react';
import * as Routes from '../constants/routes';
import Sidebar from './Sidebar';
etc
~~~

- Lifecycle methods right underneath constructor

i.e. (in order) 

~~~
constructor() {...}
componentDidMount() {...}
handleSubmit() {...}
etc
~~~

#### Styling:

Depends on the project
