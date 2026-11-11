import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {
  userDetailsReducer,
  userListReducer,
  userLoginReducer,
  userRegisterReducer,
  userUpdateProfilReducer,
  userUpdateReducer,
} from './reducers/userReducers';
import {
  candidatureCreateReducer,
  candidatureDetailsReducer,
  candidatureInformationsReducer,
  candidatureListReducer,
  candidaturesListControllerReducer,
  candidaturesListMyReducer,
  candidatureUpdateReducer,
} from './reducers/candidatureReducers';

const reducer = combineReducers({
  userRegister: userRegisterReducer,
  userLogin: userLoginReducer,
  userDetails: userDetailsReducer,
  userUpdateProfil: userUpdateProfilReducer,
  userList: userListReducer,
  userUpdate: userUpdateReducer,

  candidatureInformations: candidatureInformationsReducer,
  candidatureCreate: candidatureCreateReducer,
  candidatureDetails: candidatureDetailsReducer,
  candidaturesListMy: candidaturesListMyReducer,
  candidatureList: candidatureListReducer,
  candidatureUpdate: candidatureUpdateReducer,
  candidaturesListController: candidaturesListControllerReducer,
});

const middleware = [thunk];

const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const formationsFromStorage = localStorage.getItem('formations')
  ? JSON.parse(localStorage.getItem('formations'))
  : null;

const experiencesFromStorage = localStorage.getItem('experiences')
  ? JSON.parse(localStorage.getItem('experiences'))
  : null;

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
  candidatureInformations: {
    formations: formationsFromStorage,
    experiences: experiencesFromStorage,
  },
};

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
