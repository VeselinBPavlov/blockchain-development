import './App.css';
import { ethers } from "ethers"
import { useState, useEffect } from "react";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [blockNumber, setBlockNumber] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (localStorage.getItem("connected")) {
      handleConnection();
    }
  }, [])

  function handleConnection() {
    if (!window.ethereum) {
      alert("install MetaMask");
      return;
    }

    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const newProvider = new ethers.providers.Web3Provider(window.ethereum);

    newProvider
      .send("eth_requestAccounts", [])
      .then((accounts) => {
        if (accounts.length > 0) setCurrentAccount(accounts[0]);
        localStorage.setItem("connected", true);
        setProvider(newProvider);
      })
      .catch((e) => console.log(e));
  }

  function sendTransaction() {
    const signer = provider.getSigner();
    setLoading(true);
    signer.sendTransaction({
      to: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      value: ethers.utils.parseEther("1.0")
    }).then((tx) => {
      console.log(tx);
      return tx.wait();
    }).then((receipt) => {
      setMessage("Success");
    }).catch((e) => {
      setError(e.message);
    }).finally(() => {
      setLoading(false);
    });
  }

  function getBlockNumber() {
    if (!provider) return;

    provider.getBlockNumber()
      .then((blockNumber) => {
        setBlockNumber(blockNumber);
      });
  }

  function getBalance() {
    if (!provider) return;

    provider.getBalance(currentAccount)
      .then((balance) => {
        setBalance(balance);
      });
  }

  return (
    <div className="App">
      <button onClick={handleConnection}>Connect</button>
      {currentAccount ? <h1>{currentAccount}</h1> : <h1>Not Connected</h1>}
      {provider ? (
        <>
          <button onClick={getBlockNumber}>Get Block Number</button>
          <button onClick={getBalance}>Get Balance</button>
          <button onClick={sendTransaction}>Send Tansaction</button>
        </>
      ) : (
        <h1>Not Connected</h1>
      )}
      {blockNumber != null ? <h1>{blockNumber}</h1> : <h1>Block Not Connected</h1>}
      {balance > 0 ? <h1>{ethers.utils.formatEther(balance)} HETH</h1> : <h1>Not available balance</h1>}
      {loading && <h1>Loading...</h1>}
      {error && <h3>{error}</h3>}
      {message && <h3>{message}</h3>}
    </div>
  );
}

export default App;
