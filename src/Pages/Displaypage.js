import { useEffect, useState, useContext } from "react";
import { ethers } from "ethers";
import abi from "../sbt.json";
import "./Displaying.css";
import { LoaderContext } from "../context/loader";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
function DisplayNfts({ receipt }) {
  const [nft, setNfts] = useState("");
  const { setLoader } = useContext(LoaderContext);
  const [show, setShow] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  useEffect(() => {
    fetchingNfts();
  }, []);
  useEffect(() => {
    setLoader(true);
    fetchingNfts();
  }, [receipt]);
  const fetchingNfts = async () => {
    const tokens = [];
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractInstance = new ethers.Contract(
      process.env.REACT_APP_SBT_CONTRACT,
      abi,
      signer
    );
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const balance = Number(await contractInstance.balanceOf(accounts[0]));
      for (var i = 0; i < balance; i++) {
        const tokenid = await contractInstance.tokenOfOwnerByIndex(
          accounts[0],
          i
        );
        const tokenUri = await contractInstance.tokenURI(tokenid);
        const meta = await fetch(tokenUri);
        const result = await meta.json();
        tokens.push({ tokenid, tokenUri, result });
      }
      console.log("tokens", tokens);
      setNfts(tokens);
      setLoader(false);
    } catch (error) {
      setErrorMsg("Error While fetching Nft(s)");
      handleShow();
      console.log("error", error);
    }
  };
  return (
    <div className="form-d row">
      <div>Minted Nft(s)</div>
      {nft
        ? nft.map((e, k) => {
            return (
              <div className="card col-3 ">
                <img src={`${e.result.image}`} className="card-img-top mt-2" />
                <div className="card-body">
                  <h5 className="card-title">{`Token Id : ${Number(
                    e.tokenid
                  )}`}</h5>
                  <p className="card-text">
                    {`Name : ${e.result.attributes[0].value}`}
                  </p>
                  <p className="card-text custom-text">
                    {`Address : ${e.result.attributes[1].value.slice(
                      0,
                      3
                    )}...${e.result.attributes[1].value.slice(-4)}`}
                  </p>
                  <p className="card-text">
                    {`Country : ${e.result.attributes[2].value}`}
                  </p>
                </div>
              </div>
            );
          })
        : "No Nfts minted/found Yet !"}
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

export default DisplayNfts;
