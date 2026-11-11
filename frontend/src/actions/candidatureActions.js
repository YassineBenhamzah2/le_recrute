import axios from 'axios';
import {
  CANDIDATURE_CREATE_FAIL,
  CANDIDATURE_CREATE_REQUEST,
  CANDIDATURE_CREATE_SUCCESS,
  CANDIDATURE_DETAILS_FAIL,
  CANDIDATURE_DETAILS_REQUEST,
  CANDIDATURE_DETAILS_SUCCESS,
  CANDIDATURE_LIST_CONTROLER_FAIL,
  CANDIDATURE_LIST_CONTROLER_REQUEST,
  CANDIDATURE_LIST_CONTROLER_SUCCESS,
  CANDIDATURE_LIST_FAIL,
  CANDIDATURE_LIST_MY_FAIL,
  CANDIDATURE_LIST_MY_REQUEST,
  CANDIDATURE_LIST_MY_SUCCESS,
  CANDIDATURE_LIST_REQUEST,
  CANDIDATURE_LIST_SUCCESS,
  CANDIDATURE_SAVE_EXPERIENCES,
  CANDIDATURE_SAVE_FORMATIONS,
  CANDIDATURE_UPDATE_FAIL,
  CANDIDATURE_UPDATE_REQUEST,
  CANDIDATURE_UPDATE_SUCCESS,
} from '../constants/candidatureConstants';
import { logout } from './userActions';

export const saveFormations = (data) => (dispatch) => {
  dispatch({
    type: CANDIDATURE_SAVE_FORMATIONS,
    payload: data,
  });
  localStorage.setItem('formations', JSON.stringify(data));
};

export const saveExperiences = (data) => (dispatch) => {
  dispatch({
    type: CANDIDATURE_SAVE_EXPERIENCES,
    payload: data,
  });
  localStorage.setItem('experiences', JSON.stringify(data));
};

export const createCandidature =
  (candidature) => async (dispatch, getState) => {
    try {
      dispatch({
        type: CANDIDATURE_CREATE_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/candidatures`,
        candidature,
        config
      );
      dispatch({
        type: CANDIDATURE_CREATE_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CANDIDATURE_CREATE_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const getCandidatureDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATURE_DETAILS_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/candidatures/${id}`, config);

    dispatch({
      type: CANDIDATURE_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CANDIDATURE_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listMyCandidatures = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATURE_LIST_MY_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(
      `/api/candidatures/mescandidatures`,
      config
    );

    dispatch({
      type: CANDIDATURE_LIST_MY_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CANDIDATURE_LIST_MY_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listCandidatures = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATURE_LIST_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`/api/candidatures`, config);

    dispatch({
      type: CANDIDATURE_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CANDIDATURE_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const updateCandidature =
  (id, candidature) => async (dispatch, getState) => {
    try {
      dispatch({
        type: CANDIDATURE_UPDATE_REQUEST,
      });

      const {
        userLogin: { userInfo },
      } = getState();

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/candidatures/${id}`,
        candidature,
        config
      );

      dispatch({ type: CANDIDATURE_UPDATE_SUCCESS });

      dispatch({ type: CANDIDATURE_DETAILS_SUCCESS, payload: data });
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      if (message === 'Not authorized, token failed') {
        dispatch(logout());
      }
      dispatch({
        type: CANDIDATURE_UPDATE_FAIL,
        payload: message,
      });
    }
  };

export const listControllerCandidatures = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATURE_LIST_CONTROLER_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(
      `/api/candidatures/controlleurs/list`,
      config
    );

    dispatch({
      type: CANDIDATURE_LIST_CONTROLER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CANDIDATURE_LIST_CONTROLER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const listControllerCandidatures2 = () => async (dispatch, getState) => {
  try {
    dispatch({
      type: CANDIDATURE_LIST_CONTROLER_REQUEST,
    });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(
      `/api/candidatures/controlleurs/list/2`,
      config
    );

    dispatch({
      type: CANDIDATURE_LIST_CONTROLER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CANDIDATURE_LIST_CONTROLER_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
