import React, { useEffect, useState } from "react";

import "./ChainModal.css";
import { useSetChain } from "@web3-onboard/react";

const ChainModal = ({ onDisconnect }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [
    {
      chains, // the list of chains that web3-onboard was initialized with
      connectedChain, // the current chain the user's wallet is connected to
      settingChain, // boolean indicating if the chain is in the process of being set
    },
    setChain, // function to call to initiate user to switch chains in their wallet
  ] = useSetChain();

  useEffect(() => {
    if (chains && connectedChain && chains[0].id !== connectedChain.id) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [connectedChain, chains]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDisconnect = () => {
    handleClose();
    onDisconnect();
  };

  const handleSwitch = () => {
    setChain({ chainId: chains[0].id })
      .then((res) => {
        if (!res) {
          onDisconnect();
        }

        handleClose();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      {isVisible && (
        <div className='modal-overlay'>
          <div className='modal-content'>
            <h2>Wrong Chain ID</h2>
            <p>Please select the correct chain ID.</p>
            <div className='modal-buttons'>
              {settingChain ? (
                <p>Switching...</p>
              ) : (
                <>
                  <button onClick={handleDisconnect}>Disconnect</button>
                  <button onClick={handleSwitch}>Switch</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChainModal;
