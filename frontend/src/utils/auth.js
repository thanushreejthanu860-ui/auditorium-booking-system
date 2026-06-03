export const getAuth = () => ({
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  name: localStorage.getItem('name'),
});

export const setAuth = ({ token, role, name }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('name', name);
};

export const clearAuth = () => localStorage.clear();

export const isAuthenticated = () => !!localStorage.getItem('token');
