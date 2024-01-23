import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

const picturesData = [
  { id: 1, name: 'Flower 1', price: 0.001 },
  { id: 2, name: 'Flower 2', price: 0.002 },
  { id: 3, name: 'Flower 3', price: 0.001 },
  { id: 4, name: 'Flower 4', price: 0.001 },
  { id: 5, name: 'Flower 5', price: 0.003 },
  { id: 6, name: 'Flower 6', price: 0.001 },
  { id: 7, name: 'Flower 7', price: 0.001 },
  { id: 8, name: 'Flower 8', price: 0.002 },
  { id: 9, name: 'Flower 9', price: 0.001 },
  { id: 10, name: 'Flower 10', price: 0.003 },
];

const App = () => {
  const [web3, setWeb3] = useState(null);
 // const [accounts, setAccounts] = useState([]);
  const [pictureStore, setPictureStore] = useState(null);
  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    async function initWeb3() {
      // Modern dapp browsers
      if (window.ethereum) {
        const _web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          setWeb3(_web3);
        } catch (error) {
          console.error('User denied account access');
        }
      }
      // Legacy dapp browsers
      else if (window.web3) {
        const _web3 = new Web3(window.web3.currentProvider);
        setWeb3(_web3);
      }
      // Non-dapp browsers
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    }

    initWeb3();
  }, []);

  useEffect(() => {
    async function initContract() {
      if (web3) {
        // Replace with your deployed contract address
        const contractAddress = '0xe94789a7EC6f7A7a487DD5923c8a1dCe1dc0348E';
        const _pictureStore = new web3.eth.Contract(
          // Replace with your contract ABI (interface)
          [
            // ... Paste your ABI here
            
              {
                "inputs": [],
                "stateMutability": "nonpayable",
                "type": "constructor"
              },
              {
                "anonymous": false,
                "inputs": [
                  {
                    "indexed": true,
                    "internalType": "address",
                    "name": "buyer",
                    "type": "address"
                  },
                  {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "pictureId",
                    "type": "uint256"
                  }
                ],
                "name": "PicturePurchased",
                "type": "event"
              },
              {
                "inputs": [
                  {
                    "internalType": "uint256",
                    "name": "_pictureId",
                    "type": "uint256"
                  }
                ],
                "name": "purchasePicture",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
              },
              {
                "inputs": [
                  {
                    "internalType": "uint256",
                    "name": "_newPrice",
                    "type": "uint256"
                  }
                ],
                "name": "setPicturePrice",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
              },
              {
                "stateMutability": "payable",
                "type": "receive"
              },
              {
                "inputs": [],
                "name": "owner",
                "outputs": [
                  {
                    "internalType": "address payable",
                    "name": "",
                    "type": "address"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              },
              {
                "inputs": [],
                "name": "picturePrice",
                "outputs": [
                  {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                  }
                ],
                "stateMutability": "view",
                "type": "function"
              }
            
          ],
          contractAddress
        );
        setPictureStore(_pictureStore);
      }
    }

    initContract();
  }, [web3]);

  const addToCart = (picture) => {
    setCart([...cart, picture]);
    setTotalPrice(totalPrice =>totalPrice + picture.price);
  };
  const handlePay = async () => {
    if (web3 && pictureStore) {
      try {
        const accounts = await web3.eth.getAccounts();
        const buyerAddress = accounts[0];
  
        // Assume you are purchasing only one picture at a time for simplicity
        const pictureId = 1;
  
        const picturePriceWei = web3.utils.toWei(totalPrice.toString(), 'ether');
  
        // Call the purchasePicture function on the smart contract
        await pictureStore.methods.purchasePicture(pictureId).send({
          from: buyerAddress,
          value: picturePriceWei,
        });
  
        alert(`Payment successful! Total Amount: Ξ${totalPrice}`);
  
        // Remove the purchased picture from the cart
     //   const updatedCart = cart.filter((cartItem) => cartItem.id !== pictureId);
  
        // Update the total price based on the prices of pictures in the cart
     //   const updatedTotalPrice = updatedCart.reduce((total, cartItem) => total + cartItem.price, 0);
        const updatedPictures = picturesData.filter(picture => !cart.includes(picture));
    
        picturesData.splice(0, picturesData.length, ...updatedPictures);
       
  
        // Set the updated cart and total price
        setCart([]);
        setTotalPrice(0);
      } catch (error) {
        console.error('Error processing payment:', error);
        alert('Error processing payment. Please try again.');
      }
    }
  };
  


  return (
    <div className="App">
      <h1>Picture Buying Store   (via CryptoCurrency-SepoliaETH)</h1>
      <div className="picture-container">
        {picturesData.map((picture) => (
          <div key={picture.id} className="picture-card">
            <img src={require(`./pictures/${picture.id}.jpg`)} alt={picture.name} />
            <p>{picture.name}</p>
            <p>Ξ{picture.price}</p>
            <button onClick={() => addToCart(picture)}>Buy</button>
          </div>
        ))}
      </div>
      <div className="cart">
        <h2>Shopping Cart</h2>
        {cart.map((cartItem) => (
          <div key={cartItem.id} className="cart-item">
            <p>{cartItem.name}</p>
            <p>Ξ{cartItem.price}</p>
          </div>
        ))}
        <p>Total: Ξ{totalPrice}</p>
        <button onClick={handlePay}>Pay</button>
      </div>
    </div>
  );
};

export default App;

