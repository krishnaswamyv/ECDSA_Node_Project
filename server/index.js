  const express = require("express");
  const app = express();
  const cors = require("cors");
  const port = 3042;
  const keccak = require("ethereum-cryptography/keccak");
  const secp = require("ethereum-cryptography/secp256k1");
  const { utf8ToBytes } = require("ethereum-cryptography/utils");


  app.use(cors());
  app.use(express.json());


  const addPubKeyMap = [ 
    { address: "7dd3627d2bd09b5d9e96d31b892610a7247cb2a4", pubKey: "03012a1ce0e44313826fa5bb57e048e21a7edbce2bda4f1bf5ba08a4299c310160" } ,
    { address: "1a432e448e77ae9e4062a4079f4a85e732e37c0f", pubKey: "031e01358615dda56241a563a8d1bcd8fd3e8c7481717697e94f32a2b8c082db5f" } ,
    { address: "c823974e345f88c01ae95c40a2564711223b5ac4", pubKey: "02d357bc5261711c0ce73bb22b335793bc979e7ac35b888a3a76a31aaf38633bcb" } ,
    { address: "44a6b0e7cdeea0a3ee14dcea5e6dd7ab8b2c1c2b", pubKey: "03499be1454b938b0c49a275522ce81dc81815db3b49940f322def85e5883e28c5" } ,
    { address: "1909e4ac861b19e309e12f2cde6ff1e911eb286f", pubKey: "02234dea0e1ba2fbc9ebacd741ad1f3f8d172fc629825f661db22a839172a01094" }
  ];


  const balances = {
    "7dd3627d2bd09b5d9e96d31b892610a7247cb2a4": 100,
    "1a432e448e77ae9e4062a4079f4a85e732e37c0f": 50,
    "c823974e345f88c01ae95c40a2564711223b5ac4": 75,
    "44a6b0e7cdeea0a3ee14dcea5e6dd7ab8b2c1c2b": 300,
    "1909e4ac861b19e309e12f2cde6ff1e911eb286f": 225
  };

  let nonce = 0;

  app.get("/balance/:address", (req, res) => {
    const { address } = req.params;
    const balance = balances[address] || 0;
    res.send({ balance });
  });

  app.post("/send", (req, res) => {

    const { r,s , recipient, amount } = req.body;

    /* Recreating the sender's signature instance at server end
    using the r & s components received from the Client */

    const signatureObj = { r: BigInt('0x'+r), s: BigInt('0x'+s) }

    let senderAddress;
    let senderEqReceiver = false;
    nonce++;

    addPubKeyMap.every((el) => {


    senderAddress = el.address;

    /* Creating the Transaction hash while iterating 
    through the list of available addresses and verifying
    Sender's identity based on the associated Public Key 
    and the received signature */

    const transaction = {
      sender: senderAddress,
      amount: parseInt(amount),
      receiver: recipient,
      nonce: nonce
    };

    const tranStr = JSON.stringify(transaction);
    const tranHash = keccak.keccak256(utf8ToBytes(tranStr));
    
    const isValid = secp.secp256k1.verify(signatureObj, tranHash, el.pubKey);
    
    if (isValid) // Sender has been successfully identified and authenticated
    {
      if (senderAddress === recipient)  {
        senderEqReceiver = true;
      }
      return false;
        
    }

    return true;


    });


    if(senderEqReceiver){
      nonce--;
      console.log("Sender is same as the Recipient");
      res.status(400).send({ message: "Transaction declined. Receiver address cannot be the same as the Sender!" });
    }

    else {

      
      if (!senderAddress){
        nonce--;
        console.log("Sender could not be verified");
        res.status(400).send({ message: "Sender could not be verified!" });
      }
      
      else {

        if (balances[recipient] === undefined) {
          nonce--;
          res.status(400).send({ message: "Recipient address is not valid!" });
        }
        else {
          setInitialBalance(senderAddress);
          setInitialBalance(recipient);

          if (balances[senderAddress] < amount) {
            nonce--;
            res.status(400).send({ message: "Not enough funds!" });
          } else {
              balances[senderAddress] -= amount;
              balances[recipient] += amount;
              res.send({ balance: balances[senderAddress] });       
          }

        }
      }
  
    }
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
  });

  function setInitialBalance(address) {
    if (!balances[address]) {
      balances[address] = 0;
    }
  }
