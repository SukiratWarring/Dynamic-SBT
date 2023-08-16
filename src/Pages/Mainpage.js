import "./Mainpage.css";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import abi from "../sbt.json";
import { ethers } from "ethers";
import DisplayNfts from "./Displaypage";
import { LoaderContext } from "../context/loader";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
function Mainpage() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [tokenid, setTokenid] = useState(null);
  const [balance, setBalance] = useState(0);
  const [receipt, setReceipt] = useState("");
  const [mint, setMint] = useState(true);
  const { setLoader } = useContext(LoaderContext);
  const [errorMsg, setErrorMsg] = useState("");
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  useEffect(() => {
    checkBalance();
  }, []);
  useEffect(() => {
    checkBalance();
  }, [receipt]);
  const checkBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      process.env.REACT_APP_SBT_CONTRACT,
      abi,
      signer
    );
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const balance = Number(await contractInstance.balanceOf(accounts[0]));
    setBalance(balance);
  };
  const mintNft = async (CID, tokenid) => {
    try {
      const uri = `https://yellow-visible-rooster-901.mypinata.cloud/ipfs/${CID}`;
      //calling the contract with ethers
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractInstance = new ethers.Contract(
        process.env.REACT_APP_SBT_CONTRACT,
        abi,
        signer
      );
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (tokenid != null) {
        const tx = await contractInstance.changeTokenUri(tokenid, uri, {
          gasLimit: 5000000,
        });
        const receipt = await tx.wait();
        setReceipt(receipt);
        setLoader(false);
        console.log("receipt", receipt);
      } else {
        console.log("Minitng");
        console.log(
          "ethers.utils.isAddress(address)",
          ethers.utils.isAddress(address)
        );

        const tx = await contractInstance.safeMint(address, uri, {
          gasLimit: 5000000,
        });
        const receipt = await tx.wait();

        setReceipt(receipt);
        console.log("receipt", receipt);
      }
    } catch (error) {
      if (!ethers.utils.isAddress(address)) {
        setLoader(false);
        setErrorMsg("Please Set a valid address!");
        handleShow();
      } else {
        setLoader(false);
        setErrorMsg("Error while minting nft !");
        handleShow();
      }
      console.log("error", error);
    }
  };
  const handleSubmit = (e) => {
    setLoader(true);
    e.preventDefault();
    const data = {
      pinataOptions: {
        cidVersion: 1,
      },
      pinataMetadata: {
        name: "SBT",
        keyvalues: {
          customKey: "customValue",
          customKey2: "customValue2",
        },
      },
      pinataContent: {
        image: `https://yellow-visible-rooster-901.mypinata.cloud/ipfs/QmSJLPXZxkh6KMHYm1e6xqQs3kK7SWWFcgzdBH2gvjQ98u`,
        name: `Sbt Token for ${name}`,
        attributes: [
          {
            trait_type: "Name",
            value: `${name}`,
          },
          {
            trait_type: "Address",
            value: `${address}`,
          },
          {
            trait_type: "Country",
            value: `${country}`,
          },
        ],
      },
    };
    var config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
        pinata_secret_api_key: process.env.REACT_APP_PINATA_API_SECRET,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then((res) => {
        console.log(res.data.IpfsHash);

        mintNft(res.data.IpfsHash, tokenid);
      })
      .catch((err) => {
        setLoader(false);
        setErrorMsg("Error while uploading to pinata !");
        handleShow();
        console.log("err", err);
      });
  };
  const toggle = () => {
    setMint(false);
  };
  const toggle_2 = () => {
    setMint(true);
    setTokenid(null);
  };
  return (
    <div>
      <div class="form">
        {mint ? (
          <div class="Mint">
            <form>
              <div class="mb-3 margin">
                <label for="name" class="form-label">
                  Name
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  placeholder="name.."
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div class="mb-3">
                <label for="addr" class="form-label">
                  Address
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="addr"
                  placeholder="address.."
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div class="mb-3">
                <label for="country" class="form-label">
                  Country
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="country"
                  placeholder="country.."
                  onChange={(e) => {
                    setCountry(e.target.value);
                  }}
                />
              </div>
              <div className="d-flex justify-content-between">
                <button
                  type="submit"
                  class="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Mint
                </button>

                {balance > 0 ? (
                  <button class="btn btn-secondary" onClick={toggle}>
                    Edit
                  </button>
                ) : (
                  <button class="btn btn-secondary" onClick={toggle} disabled>
                    Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div class="Edit">
            <form>
              <div class="mb-3">
                <label for="name" class="form-label">
                  Name
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="name"
                  placeholder="name.."
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div class="mb-3">
                <label for="addr" class="form-label">
                  Address
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="addr"
                  placeholder="address.."
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div class="mb-3">
                <label for="country" class="form-label">
                  Country
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="country"
                  placeholder="country.."
                  onChange={(e) => {
                    setCountry(e.target.value);
                  }}
                />
              </div>
              <div class="mb-3">
                <label for="country" class="form-label">
                  Token Id
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="country"
                  placeholder="tokenId.."
                  onChange={(e) => {
                    setTokenid(e.target.value);
                  }}
                />
              </div>
              <div className="d-flex justify-content-between">
                <button
                  type="submit"
                  class="btn btn-primary"
                  onClick={handleSubmit}
                >
                  Edit
                </button>
                <button class="btn btn-secondary" onClick={toggle_2}>
                  Mint
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      <div className="container">
        {balance > 0 ? <DisplayNfts receipt={receipt} /> : ""}
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
  );
}

export default Mainpage;
