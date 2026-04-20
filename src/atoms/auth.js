import { atom } from 'recoil';

export const authState = atom({
  key: 'authState',
  default: {
    isAuthenticated: false,
    user: null, // { id, email, nickname, role }
    token: null,
  },
});
