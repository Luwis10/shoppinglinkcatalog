const firebaseConfig = {
    apiKey: "AIzaSyA8LI9eFCgg3EUqXfFM9orjR9Zy0S7rFkc",
    authDomain: "shoppinglinkcatalog-2025.firebaseapp.com",
    databaseURL: "https://shoppinglinkcatalog-2025-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "shoppinglinkcatalog-2025",
    storageBucket: "shoppinglinkcatalog-2025.firebasestorage.app",
    messagingSenderId: "663371117283",
    appId: "1:663371117283:web:d0dc2ce27474f8e3280bd6",
    measurementId: "G-CPKCRR8XCT"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();