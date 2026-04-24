import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { authState } from '../atoms/auth';

const AuthInitializer = () => {
  const setAuth = useSetRecoilState(authState);

  useEffect(() => {
    const token = localStorage.getItem('sky_token');
    const user = localStorage.getItem('sky_user');

    if (token && user) {
      try {
        setAuth({
          isAuthenticated: true,
          user: JSON.parse(user),
          token: token
        });
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem('sky_token');
        localStorage.removeItem('sky_user');
      }
    }
  }, [setAuth]);

  return null;
};

export default AuthInitializer;
