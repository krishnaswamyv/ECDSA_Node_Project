import { useState } from "react";
import server from "./server";
import {keccak256} from "ethereum-cryptography/keccak";
import {bytesToHex, utf8ToBytes} from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

let nonce = 0;

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
    
      /* Creating a signature representing the transaction and 
      extracting & sending r & s components of the signature to the server
      for authentication of the sender's identity */
      
      nonce++;
      const transaction = {
        sender: address,
        amount: parseInt(sendAmount),
        receiver: recipient,
        nonce: nonce
      };
  
      const tranStr = JSON.stringify(transaction);
      const tranHash = keccak256(utf8ToBytes(tranStr));
      const tranSignature = secp.secp256k1.sign(bytesToHex(tranHash),privateKey);
 
      const r = tranSignature['r'];
      const s = tranSignature['s'];
    
      const {
        data: { balance },
      } = await server.post(`send`, {
        r: r.toString(16),
        s: s.toString(16),
        amount: parseInt(sendAmount),
        recipient,
      });
    
      setBalance(balance);
    } catch (ex) {
      nonce--;
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
