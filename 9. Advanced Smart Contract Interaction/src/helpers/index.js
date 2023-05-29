import { ethers } from "ethers";
import { ERC20_ABI, ERC20_ADDRESS } from "../constants";

export function formatEthAddress(address) {
  if (!address || address.length < 8) {
    return "";
  }

  const firstFive = address.slice(0, 5);
  const lastThree = address.slice(-3);

  return `${firstFive}...${lastThree}`;
}

export function getContract(connectedWallets) {
  const injectedProvider = connectedWallets[0].provider;
  const provider = new ethers.providers.Web3Provider(injectedProvider);
  const signer = provider.getSigner();
  return new ethers.Contract(ERC20_ADDRESS, ERC20_ABI, signer);
}
