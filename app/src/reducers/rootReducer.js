import { combineReducers } from 'redux';

const createReducer = (reducer, name) => (state, action) => {
  if (name !== action.name && state !== undefined) {
    return state;
  }
  return reducer(state, action);
}

const rootReducer = combineReducers({
  state: (state = {}) => state,
});

export default rootReducer;
