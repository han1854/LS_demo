// token helpers
function saveToken(token, user) {
  localStorage.setItem('api_token', token);
  if (user) localStorage.setItem('api_user', JSON.stringify(user));
}
function getToken(){ return localStorage.getItem('api_token'); }
function getUser(){ try{return JSON.parse(localStorage.getItem('api_user'));}catch(e){return null} }
function logout(){ localStorage.removeItem('api_token'); localStorage.removeItem('api_user'); window.location.href = './login.html'; }
window.Auth = { saveToken, getToken, getUser, logout };
