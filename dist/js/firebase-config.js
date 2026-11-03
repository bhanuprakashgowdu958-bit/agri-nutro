// Official Firebase Configuration & Initialization for NutriAgro Feeds
window.firebaseConfig = {
  apiKey: "AIzaSyDcnDOa5Q0T-WA1kQzXgYMWYmwRdvrapfc",
  authDomain: "nutriagro-feeds.firebaseapp.com",
  databaseURL: "https://nutriagro-feeds-default-rtdb.firebaseio.com",
  projectId: "nutriagro-feeds",
  storageBucket: "nutriagro-feeds.firebasestorage.app",
  messagingSenderId: "72168249807",
  appId: "1:72168249807:web:fe771d178d76f265901aba",
  measurementId: "G-3ZGJV6N5Q5"
};

// Initialize Firebase (Compat SDK for zero-build browser compatibility)
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
  try {
    firebase.initializeApp(window.firebaseConfig);
    if (typeof firebase.analytics === 'function') {
      try {
        firebase.analytics();
      } catch (err) {}
    }
  } catch (e) {
    console.warn('Firebase init notice:', e);
  }
}

