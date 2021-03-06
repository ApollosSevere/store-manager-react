import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import MockAdapter from 'axios-mock-adapter';
import { apiInstance } from '../../utils/index';
import {
  CREATE_USERS_FAILURE,
  CREATE_USERS_SUCCESS,
  GET_USERS,
  USERS_LOADING,
  getUsers,
  createUser,
  userLoading,
  CLEAR_MODAL_ERRORS,
  clearModalErrors,
  USER_ACTION_START,
  UPDATE_USERS_SUCCESS,
  updateUser
} from './usersActions';

const mock = new MockAdapter(apiInstance);
const mockStore = configureMockStore([thunk]);
const store = mockStore();

describe('User Actions', () => {
  beforeEach(() => {
    store.clearActions();
  });

  afterEach(() => {
    mock.reset();
  });

  test('should dispatch USERS_LOADING when fetching users', () => {
    const expectedAction = [
      {
        type: USERS_LOADING,
        payload: { isLoading: true }
      }
    ];
    store.dispatch(userLoading(true));
    expect(store.getActions()).toEqual(expectedAction);
  });

  test('should dispatch USER_LOGGED_OUT for unauthenticated users', () => {
    const mockPayload = {
      data: {},
      message: 'Sample DB Message'
    };

    mock.onGet('/users/').reply(401, mockPayload);

    const expectedAction = [
      {
        type: USERS_LOADING,
        payload: { isLoading: true }
      },
      {
        type: 'USER_LOGGED_OUT',
        payload: { isAuthenticated: false, userRole: 'guest' }
      }
    ];

    store.dispatch(getUsers()).catch(() => {
      expect(store.getActions()).toEqual(expectedAction);
    });
  });

  test('should dispatch GET_USERS when admin gets action', () => {
    const mockPayload = {
      data: {},
      message: 'Sample DB Message'
    };

    mock.onGet('/users/').reply(200, mockPayload);

    const expectedAction = [
      {
        type: USERS_LOADING,
        payload: { isLoading: true }
      },
      {
        type: GET_USERS,
        payload: { users: mockPayload.data, actionMessage: mockPayload.message, isLoading: false }
      }
    ];

    store.dispatch(getUsers()).then(() => {
      expect(store.getActions()).toEqual(expectedAction);
    });
  });

  test('should dispatch CREATE_USERS_SUCCESS when admin creates an account', () => {
    const mockPayload = {
      data: {},
      message: ''
    };
    const closeModalMock = (() => jest.fn())();
    const userDetails = {};

    mock.onPost('/auth/signup').reply(201, mockPayload);

    const expectedAction = [
      {
        type: USER_ACTION_START,
        payload: true
      },
      {
        type: CREATE_USERS_SUCCESS,
        payload: { data: mockPayload.data, message: mockPayload.message }
      }
    ];

    store.dispatch(createUser(userDetails, closeModalMock)).then(() => {
      expect(closeModalMock).toBeCalled();
      expect(store.getActions()).toEqual(expectedAction);
    });
  });

  test('should dispatch CREATE_USERS_FAILURE for server errors when admin tries to creates an account', () => {
    const mockPayload = {
      data: {
        error: [],
        message: ''
      }
    };
    const closeModalMock = (() => jest.fn())();
    const userDetails = {};

    mock.onPost('/auth/signup').reply(500, mockPayload);

    const expectedAction = [
      {
        type: USER_ACTION_START,
        payload: true
      },
      {
        type: CREATE_USERS_FAILURE,
        payload: { data: mockPayload.data, message: mockPayload.message }
      }
    ];

    store.dispatch(createUser(userDetails, closeModalMock)).catch(() => {
      expect('').toEqual(true);
      expect(store.getActions()).toEqual(expectedAction);
    });
  });

  test('should dispatch USER_LOGGED_OUT when admin is unauthenticated but tries to creates an account', () => {
    const mockPayload = {
      data: {}
    };
    const closeModalMock = (() => jest.fn())();
    const userDetails = {};

    mock.onPost('/auth/signup').reply(401, mockPayload);

    const expectedAction = [
      {
        type: USERS_LOADING,
        payload: { isLoading: true }
      },
      {
        type: 'USER_LOGGED_OUT',
        payload: { isAuthenticated: false, userRole: 'guest' }
      }
    ];

    store.dispatch(createUser(userDetails)).catch(() => {
      expect(store.getActions()).toEqual(expectedAction);
    });
  });

  /* test('should dispatch UPDATE_USERS_SUCCESS for successful user update', () => {
    const closeModalMock = (() => jest.fn())();
    const userDetails = {
      id: 1,
      name: 'Jesse'
    };

    const putMockPayload = {
      message: `${userDetails.name} was updated successfully`,
      data: []
    };

    mock
      .onPut(`/users/${userDetails.id}`)
      .reply(200, putMockPayload)
      .onGet('/users/')
      .reply(200, putMockPayload);

    const expectedAction = [
      {
        type: USER_ACTION_START,
        payload: true
      },
      {
        type: UPDATE_USERS_SUCCESS,
        payload: { users: putMockPayload.data, actionMessage: putMockPayload.message, modalLoading: false }
      }
    ];

    store.dispatch(updateUser(userDetails, closeModalMock)).then(() => {
      expect(store.getActions()).toEqual(expectedAction);
    });
  }); */

  test('should dispatch CLEAR_MODAL_ERRORS with no payload', () => {
    const expectedAction = [
      {
        type: CLEAR_MODAL_ERRORS
      }
    ];

    store.dispatch(clearModalErrors());
    expect(store.getActions()).toEqual(expectedAction);
  });
});
