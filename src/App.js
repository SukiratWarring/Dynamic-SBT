import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Mainpage from "./Pages/Mainpage.js";
import "./Pages/Mainpage.css";
import "./App.css";
import Spinner from "./components/Loader/index.js";
import { LoaderContext } from "./context/loader.js";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
function App() {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  async function addMumbaiTestnet() {
    if (window.ethereum) {
      try {
        const mumbaiTestnet = {
          chainId: "0x35B61", //  Chain ID
          chainName: "June Testnet", // Chain Name
          nativeCurrency: {
            name: "JUNE",
            symbol: "JUNE",
            decimals: 18,
          },
          rpcUrls: ["https://api.socotra-test.network:9650/ext/bc/JUNE/rpc"], // RPC URL
          blockExplorerUrls: [
            "https://mcnscan.io/chain/NLp7mU4yqN9xfu3Yezc6Sq66xFx5E1bKaxsBZRBZ7N7FmKhb5/",
          ], // Block Explorer URL
        };

        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [mumbaiTestnet],
        });
      } catch (error) {
        setErrorMsg(error.message);
        handleShow();
        process.exit();
      }
    } else {
      setErrorMsg("MetaMask not detected");
      handleShow();
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
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x35B61" }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // You can make a request to add the chain to wallet here
        await addMumbaiTestnet();
      } else {
        setErrorMsg(switchError.message);
        handleShow();
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
      if (chain !== "220001") {
        await SwitchChainToPolygon();
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccountAddress(accounts[0]);
      setIsConnected(true);
    } catch (error) {
      setErrorMsg(error.message);
      handleShow();
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
                  <Modal show={show} onHide={handleClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>Error Occured</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{errorMsg}</Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleClose}>
                        Close
                      </Button>
                    </Modal.Footer>
                  </Modal>
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
