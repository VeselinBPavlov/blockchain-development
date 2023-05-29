import React, { useEffect, useState } from "react";

import "./Navbar.css";
import { useConnectWallet, useWallets } from "@web3-onboard/react";

import { formatEthAddress } from "../../helpers";

const Navbar = ({ onDisconnect }) => {
  const [{ wallet }] = useConnectWallet();
  const connectedWallets = useWallets();

  const [usrAddress, setUsrAddress] = useState(null);

  useEffect(() => {
    if (
      connectedWallets &&
      connectedWallets.length > 0 &&
      connectedWallets[0].accounts.length > 0
    ) {
      setUsrAddress(connectedWallets[0].accounts[0].address);
    } else {
      setUsrAddress(null);
    }
  }, [connectedWallets]);

  return (
    <div className='navbar'>
      <div className='navbar-left'>
        <span className='navbar-label'>SoftUni</span>
      </div>
      {wallet && (
        <>
          <p className='navbar-label' style={{ margin: "10px" }}>
            {usrAddress && formatEthAddress(usrAddress)}
          </p>
          <div className='navbar-right'>
            <button className='disconnect-button' onClick={onDisconnect}>
              Disconnect
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;
