import React, { useCallback, useEffect, useState } from "react";
import TransferCard from "./TransferCard/TransferCard.jsx";

import "./TransferSection.css";
import { useWallets } from "@web3-onboard/react";
import { getContract } from "../../helpers/index.js";

const TransfersSection = () => {
  const [transfers, setTransfers] = useState([]);

  const connectedWallets = useWallets();

  useEffect(() => {
    const contract = getContract(connectedWallets);

    const filter = contract.filters.Transfer(
      connectedWallets[0].accounts[0].address,
      null
    );

    // List all transfers sent from me in a specific block range
    contract.queryFilter(filter, 0, "latest").then((fetchedTransfers) => {
      fetchedTransfers = fetchedTransfers.map((transfer) => {
        transfer.value = transfer.args.value.toString();
        transfer.from = transfer.args.to;
        return transfer;
      });

      setTransfers(fetchedTransfers);
    });
  }, [connectedWallets]);

  return (
    <section className='transfers-section'>
      <h2>Transfers</h2>
      <div className='transfers-section-main'>
        {transfers.map((transfer, index) => (
          <TransferCard
            key={index}
            from={transfer.from}
            value={transfer.value}
          />
        ))}
      </div>
    </section>
  );
};

export default TransfersSection;
