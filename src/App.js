import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Mainpage from "./Pages/Mainpage.js";
import "./Pages/Mainpage.css";
import "./App.css";
import Spinner from "./components/Loader/index.js";
import { LoaderContext } from "./context/loader.js";

function App() {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  async function addMumbaiTestnet() {
    if (window.ethereum) {
      try {
        const mumbaiTestnet = {
          chainId: "0x13881", // Mumbai Testnet Chain ID
          chainName: "Mumbai Testnet", // Chain Name
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          rpcUrls: ["https://rpc-mumbai.maticvigil.com"], // Mumbai Testnet RPC URL
          blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"], // Mumbai Testnet Block Explorer URL
        };

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [mumbaiTestnet],
        });

        console.log("Mumbai Testnet added to MetaMask");
      } catch (error) {
        console.error("Error adding Mumbai Testnet:", error);
      }
    } else {
      console.error("MetaMask not detected");
    }
  }
  useEffect(() => {
    const { ethereum } = window;
    const checkMetamaskAvailability = async () => {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      sethaveMetamask(true);
    };
    checkMetamaskAvailability();
  }, []);
  const SwitchChainToPolygon = async () => {
    // if (typeof ethereum !== "undefined" && ethereum.isMetaMask) return;
    console.log("22");

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // You can make a request to add the chain to wallet here
        await addMumbaiTestnet();
        console.log("Mumbai test net is not added ,please add !");
      } else {
        process.exit();
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) {
        sethaveMetamask(false);
      }
      const chain = (await provider.getNetwork()).chainId;
      if (chain !== "8001") {
        console.log("here");

        await SwitchChainToPolygon();
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccountAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
  };
  const [loader, setLoader] = useState(false);

  return (
    <div className="App">
      {loader && <Spinner />}
      <LoaderContext.Provider value={{ loader, setLoader }}>
        <div className="App-header">
          {haveMetamask ? (
            <div className="App-header">
              {isConnected ? (
                <Mainpage />
              ) : (
                <div className="outside">
                  <div class="card">
                    <div>
                      <img
                        src="https://yellow-visible-rooster-901.mypinata.cloud/ipfs/QmeyQRf5Udp9EXbzPDzfkqu1gwj3PzifhrVMLptMSqGE26"
                        class="img-fluid"
                        alt="..."
                      />
                    </div>
                    <div class="card-body">
                      <p class="card-text">
                        Connect to mint a Soul Bound Token and Edit its Traits!
                      </p>
                      <button
                        type="button"
                        class="btn btn-success"
                        onClick={connectWallet}
                      >
                        CONNECT
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p>Please Install MataMask</p>
          )}
        </div>
      </LoaderContext.Provider>
    </div>
  );
}

export default App;
