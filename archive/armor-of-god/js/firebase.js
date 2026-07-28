// Firebase connection and the small, deliberately narrow leaderboard API.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyCDZtdslIA7IhzXFkOGRzzfFClNQ0VXDj4',
    authDomain: 'armor-of-god-a3820.firebaseapp.com',
    projectId: 'armor-of-god-a3820',
    storageBucket: 'armor-of-god-a3820.firebasestorage.app',
    messagingSenderId: '164091299081',
    appId: '1:164091299081:web:db27909f80afa2a9743fd8',
    measurementId: 'G-FETHTHEY2P'
};

const db = getFirestore(initializeApp(firebaseConfig));
const scores = collection(db, 'leaderboard');

window.FirebaseLeaderboard = {
    async submit(name, score) {
        const result = await addDoc(scores, { name, score, createdAt: serverTimestamp() });
        return result.id;
    },
    async fetchTopScores() {
        const snapshot = await getDocs(query(scores, orderBy('score', 'desc')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};
