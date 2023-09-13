const secp = require("ethereum-cryptography/secp256k1");
const privateKey = secp.secp256k1.utils.randomPrivateKey();
const { toHex } = require("ethereum-cryptography/utils");
const { hexToBytes } = require("ethereum-cryptography/utils");
const publicKey = secp.secp256k1.getPublicKey(privateKey);
const keccak = require('ethereum-cryptography/keccak')

console.log('PrivateKey: ', toHex(privateKey));
console.log('PublicKey: ', toHex(publicKey));
//console.log('PublicKey: ', publicKey);
//console.log('PublicKey: ', publicKey.slice(1));
//console.log('PubKey with first byte stripped off', toHex(publicKey.slice(1)));
const pkHash = keccak.keccak256(publicKey.slice(1));
const address = pkHash.slice(-20);
console.log('PubKeyHash: ', toHex(pkHash));
//console.log('Last 20 bytes of keccak hash:', pkHash.slice(-20));
//console.log('Last 20 bytes of keccak hash:', toHex(pkHash.slice(-20)));

console.log('Address', toHex(address));