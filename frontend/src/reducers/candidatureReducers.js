import {
  CANDIDATURE_SAVE_FORMATIONS,
  CANDIDATURE_SAVE_EXPERIENCES,
  CANDIDATURE_CREATE_REQUEST,
  CANDIDATURE_CREATE_SUCCESS,
  CANDIDATURE_CREATE_FAIL,
  CANDIDATURE_CREATE_RESET,
  CANDIDATURE_DETAILS_REQUEST,
  CANDIDATURE_DETAILS_SUCCESS,
  CANDIDATURE_DETAILS_FAIL,
  CANDIDATURE_LIST_MY_REQUEST,
  CANDIDATURE_LIST_MY_SUCCESS,
  CANDIDATURE_LIST_MY_FAIL,
  CANDIDATURE_LIST_MY_RESET,
  CANDIDATURE_LIST_REQUEST,
  CANDIDATURE_LIST_SUCCESS,
  CANDIDATURE_LIST_FAIL,
  CANDIDATURE_UPDATE_REQUEST,
  CANDIDATURE_UPDATE_SUCCESS,
  CANDIDATURE_UPDATE_FAIL,
  CANDIDATURE_UPDATE_RESET,
  CANDIDATURE_LIST_CONTROLER_REQUEST,
  CANDIDATURE_LIST_CONTROLER_SUCCESS,
  CANDIDATURE_LIST_CONTROLER_FAIL,
  CANDIDATURE_LIST_CONTROLER_RESET,
  CANDIDATURE_SAVE_FORMATIONS_RESET,
} from '../constants/candidatureConstants';

export const candidatureInformationsReducer = (
  state = { formations: {}, experiences: {} },
  action
) => {
  switch (action.type) {
    case CANDIDATURE_SAVE_FORMATIONS:
      return {
        ...state,
        formations: action.payload,
        success: true,
      };
    case CANDIDATURE_SAVE_FORMATIONS_RESET:
      return {
        ...state,
        success: false,
      };
    case CANDIDATURE_SAVE_EXPERIENCES:
      return {
        ...state,
        experiences: action.payload,
        success: true,
      };
    default:
      return state;
  }
};

export const candidatureCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case CANDIDATURE_CREATE_REQUEST:
      return {
        loading: true,
      };
    case CANDIDATURE_CREATE_SUCCESS:
      return {
        loading: false,
        success: true,
        candidature: action.payload,
      };

    case CANDIDATURE_CREATE_FAIL:
      return {
        loading: false,
        error: action.payload,
      };
    case CANDIDATURE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const candidatureDetailsReducer = (
  state = { loading: true },
  action
) => {
  switch (action.type) {
    case CANDIDATURE_DETAILS_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case CANDIDATURE_DETAILS_SUCCESS:
      return {
        loading: false,
        candidature: action.payload,
      };

    case CANDIDATURE_DETAILS_FAIL:
      return {
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const candidaturesListMyReducer = (
  state = { candidaturess: [] },
  action
) => {
  switch (action.type) {
    case CANDIDATURE_LIST_MY_REQUEST:
      return {
        loading: true,
      };
    case CANDIDATURE_LIST_MY_SUCCESS:
      return {
        loading: false,
        candidatures: action.payload,
      };

    case CANDIDATURE_LIST_MY_FAIL:
      return {
        loading: false,
        error: action.payload,
      };

    case CANDIDATURE_LIST_MY_RESET:
      return {
        candidatures: [],
      };

    default:
      return state;
  }
};

export const candidatureListReducer = (
  state = { candidatures: [] },
  action
) => {
  switch (action.type) {
    case CANDIDATURE_LIST_REQUEST:
      return {
        loading: true,
      };
    case CANDIDATURE_LIST_SUCCESS:
      return {
        loading: false,
        candidatures: action.payload,
      };

    case CANDIDATURE_LIST_FAIL:
      return {
        loading: false,
        error: action.payload,
      };

    default:
      return state;
  }
};

export const candidatureUpdateReducer = (
  state = { candidature: {} },
  action
) => {
  switch (action.type) {
    case CANDIDATURE_UPDATE_REQUEST:
      return {
        loading: true,
      };

    case CANDIDATURE_UPDATE_SUCCESS:
      return {
        loading: false,
        success: true,
      };

    case CANDIDATURE_UPDATE_FAIL:
      return {
        loading: false,
        error: action.payload,
      };
    case CANDIDATURE_UPDATE_RESET:
      return {
        candidature: {},
      };
    default:
      return state;
  }
};

export const candidaturesListControllerReducer = (
  state = { candidatures: [] },
  action
) => {
  switch (action.type) {
    case CANDIDATURE_LIST_CONTROLER_REQUEST:
      return {
        loading: true,
      };
    case CANDIDATURE_LIST_CONTROLER_SUCCESS:
      return {
        loading: false,
        candidatures: action.payload,
      };

    case CANDIDATURE_LIST_CONTROLER_FAIL:
      return {
        loading: false,
        error: action.payload,
      };

    case CANDIDATURE_LIST_CONTROLER_RESET:
      return {
        candidatures: [],
      };

    default:
      return state;
  }
};
