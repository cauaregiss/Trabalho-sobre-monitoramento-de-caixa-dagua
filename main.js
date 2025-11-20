// Importa as funções necessárias do SDK do Firebase
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Importa Firestore, doc e getDoc
import { getAuth } from "firebase/auth"; // Importa a Autenticação

// Sua configuração do app web do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCM2ttRU74dQ3tvJ6pT-CirPaicFpXaI2s",
  authDomain: "aquamonitor-b01e0.firebaseapp.com",
  projectId: "aaquamonitor-b01e0",
  storageBucket: "aquamonitor-b01e0.firebasestorage.app",
  messagingSenderId: "142579099024",
  appId: "1:142579099024:web:8d2cdea7f6682029ceff15",
  measurementId: "G-HYFHQ08Y75"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Inicializa o Firestore
const auth = getAuth(app); // Inicializa a Autenticação

// Função para ler e exibir os dados da caixa d'água
const exibirNivelAgua = async () => {
  try {
    // AQUI ESTÁ A CORREÇÃO: o nome da coleção foi trocado para "usuarios"
    const docRef = doc(db, "Usuarios", "Id_Controle");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dados = docSnap.data();
     
      const nivelElement = document.getElementById("nivel-atual");
      const capacidadeElement = document.getElementById("capacidade-total");

      if (nivelElement) {
        // Verifique se o campo "nivel" existe no seu documento
        nivelElement.textContent = `${dados.nivel}%`;
      }
      if (capacidadeElement) {
        // Verifique se o campo "capacidade" existe no seu documento
        capacidadeElement.textContent = `${dados.capacidade}%`;
      }

      console.log("Dados do documento:", dados);
    } else {
      console.log("Documento não encontrado!");
    }
  } catch (e) {
    console.error("Erro ao ler documento: ", e);
  }
};

exibirNivelAgua();