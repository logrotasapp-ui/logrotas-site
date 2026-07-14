import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDQgXb5Smvd0C8cslsq0WPIaahweH2Ox5E',
  authDomain: 'logrotas-85e7e.firebaseapp.com',
  projectId: 'logrotas-85e7e',
  storageBucket: 'logrotas-85e7e.firebasestorage.app',
  messagingSenderId: '404332371972',
  appId: '1:404332371972:web:fb1234a8c8294536121551'
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

function saudacaoPorHora() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function applyAuthState(user) {
  const body = document.body;
  body.classList.remove('auth-pending', 'auth-logged-in', 'auth-logged-out');
  body.classList.add(user ? 'auth-logged-in' : 'auth-logged-out');

  const saud = document.getElementById('saudacaoMenu');
  if (saud) {
    if (user) {
      const nome = ((user.displayName || '').trim().split(' ')[0]) || '';
      saud.textContent = nome ? `${saudacaoPorHora()}, ${nome}` : `${saudacaoPorHora()}!`;
    } else {
      saud.textContent = '';
    }
  }
}

onAuthStateChanged(auth, applyAuthState);

document.querySelectorAll('[data-auth-action="logout"]').forEach((el) => {
  el.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      await signOut(auth);
      window.location.href = 'index.html';
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  });
});
