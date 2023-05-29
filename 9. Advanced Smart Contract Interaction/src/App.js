import "./App.css";

import { init, useConnectWallet } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule from "@web3-onboard/walletconnect";

import ChainModal from "./components/ChainModal/ChainModal";
import Navbar from "./components/NavBar/NavBar";
import Button from "./components/Button/Button";
import SendForm from "./components/SendForm.jsx/SendForm";
import EventModal from "./components/EventModal/EventModal";
import TransfersSection from "./components/TransferSection/TransferSection";

const API_KEY = "Pv-hZUItmViRh3LlPTzymYC4LdC0QO0X";
const rpcUrl = `https://eth-sepolia.g.alchemy.com/v2/${API_KEY}`;

const injected = injectedModule();
const walletConnect = walletConnectModule();

// initialize Onboard
init({
  connect: {
    autoConnectLastWallet: true,
  },
  wallets: [injected, walletConnect],
  chains: [
    {
      id: "0xaa36a7",
      token: "ETH",
      label: "Ethereum Sepolia",
      rpcUrl,
    },
  ],
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});

function App() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  function handleConnect() {
    connect();
  }

  function handleDisconnect() {
    if (!wallet) {
      return;
    }

    disconnect(wallet).catch((error) => {
      console.error(error);
    });
  }

  if (wallet) {
    return (
      <div className='App'>
        <Navbar onDisconnect={handleDisconnect} />
        <div className='main'>
          <ChainModal onDisconnect={handleDisconnect} />
          <EventModal />
          <SendForm />
          <TransfersSection />
        </div>
      </div>
    );
  }

  return (
    <div className='App'>
      <Navbar onDisconnect={handleDisconnect} />
      <div className='main'>
        <Button
          disabled={connecting}
          handleClick={handleConnect}
          text={"Connect"}
        />
      </div>
    </div>
  );
}

export default App;
