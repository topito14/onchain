

// Definir la dirección del contrato (reemplaza con la dirección real de tu contrato desplegado)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Reemplaza con la dirección real de tu contrato

// ABI del contrato
const CONTRACT_ABI = [
    {
      "inputs": [],
      "name": "getVotes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "option1Votes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "option2Votes",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "voteOption1",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "voteOption2",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById("connect-wallet");
    const walletAddressDisplay = document.getElementById("wallet-address");
    const voteOption1Button = document.getElementById("vote-option1");
    const voteOption2Button = document.getElementById("vote-option2");
    const voteStatus = document.getElementById("vote-status");
    const getVotesButton = document.getElementById("get-votes");
    const votesDisplay = document.getElementById("votes-display");

    let provider;
    let signer;
    let contract;

    // Asegurar que ethers está disponible globalmente
    const ethers = window.ethers;

    // Función para manejar la votación
    const handleVote = async (option) => {
        if (!contract) {
            alert("Por favor, conecta tu wallet primero.");
            return;
        }
        try {
            let tx;
            if (option === "Opción 1") {
                tx = await contract.voteOption1();
            } else {
                tx = await contract.voteOption2();
            }
            voteStatus.textContent = "Transacción enviada, esperando confirmación...";
            await tx.wait();
            voteStatus.textContent = `Votaste por ${option}. Transacción confirmada!`;
            updateVotes();
        } catch (error) {
            console.error("Error al votar:", error);
            voteStatus.textContent = "Error al votar. Revisa la consola para más detalles.";
        }
    };

    // Función para actualizar los votos
    const updateVotes = async () => {
        if (!contract) return;
        try {
            const [option1Votes, option2Votes] = await contract.getVotes();
            votesDisplay.textContent = `Opción 1: ${option1Votes} votos, Opción 2: ${option2Votes} votos`;
        } catch (error) {
            console.error("Error al obtener votos:", error);
            votesDisplay.textContent = "Error al obtener votos";
        }
    };

    // Añadir eventos a los botones
    voteOption1Button.addEventListener("click", () => handleVote("Opción 1"));
    voteOption2Button.addEventListener("click", () => handleVote("Opción 2"));
    getVotesButton.addEventListener("click", updateVotes);

    connectButton.addEventListener("click", async () => {
        try {
            // Inicializar Coinbase Wallet SDK
            const CoinbaseWalletSDK = window.CoinbaseWalletSDK;
            const coinbaseWallet = new CoinbaseWalletSDK({
                appName: "Voting App",
                appLogoUrl: "https://example.com/logo.png",
                darkMode: false
            });

            // Crear un proveedor Web3
            provider = coinbaseWallet.makeWeb3Provider("http://localhost:8545", 31337);

            // Solicitar acceso a la cuenta
            await provider.request({ method: 'eth_requestAccounts' });

            // Crear un proveedor de ethers (compatible con v5 y v6)
            let ethersProvider;
            if (ethers.BrowserProvider) {
                // ethers v6
                ethersProvider = new ethers.BrowserProvider(provider);
                signer = await ethersProvider.getSigner();
            } else if (ethers.providers && ethers.providers.Web3Provider) {
                // ethers v5
                ethersProvider = new ethers.providers.Web3Provider(provider);
                signer = ethersProvider.getSigner();
            } else {
                throw new Error("Versión de ethers no compatible");
            }

            // Crear una instancia del contrato
            contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Obtener la dirección de la wallet conectada
            const walletAddress = await signer.getAddress();

            // Mostrar la dirección en la página
            walletAddressDisplay.textContent = `Wallet conectada: ${walletAddress}`;
            connectButton.textContent = "Wallet Conectada";
            connectButton.disabled = true;

            // Habilitar los botones de votación y obtención de votos
            voteOption1Button.disabled = false;
            voteOption2Button.disabled = false;
            getVotesButton.disabled = false;

            // Actualizar los votos iniciales
            updateVotes();
        } catch (error) {
            console.error("Error conectando la wallet", error);
            walletAddressDisplay.textContent = "Error al conectar la wallet";
        }
    });

    // Inicialmente, deshabilitar los botones de votación y obtención de votos
    voteOption1Button.disabled = true;
    voteOption2Button.disabled = true;
    getVotesButton.disabled = true;
});