
const express = require('express');
const PORT = 3000;
const cors = require("cors")

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  })
)

app.get('/', (req, res) => {
  res.send('Hello, World! This is your microservice.');
});


// const verifyTokenWithExternalService = async (token) => {
//     try {
//         const response = await at('https://your-auth-service/verify-token', { token });
//         return response.data; 
//     } catch (error) {
//         throw new Error('Token verification failed');
//     }
// };

app.post('/createOrder', async (req, res) => {

  try {
    
      // const token = req.header('Authorization')?.split(' ')[1];  
      // const verificationResponse = await verifyTokenWithExternalService(token);
      // if (!verificationResponse.isValid) {
      //     return res.status(401).json({ message: "Token is not valid" });
      // }

      // we will get this userid via jwt 
      const { userId, productId, quantity } = req.body;

      // Validate input
      if (!userId || !productId || !quantity) {
        return res.status(400).json({ message: 'Please provide customerName, productId, and quantity.' });
      }
      
      // Check the inventory Over here .. 

      // make a api call here 

      try {
        const inventoryResponse = await fetch(`http://localhost:3005/inventory/${productId}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          },
      });

        const responseInventory = await inventoryResponse.json(); // Use .json() to parse the response body
        const productData = responseInventory.product;
        console.log(productData);
        const stock = productData.stock;
        
        if (stock < quantity) {
          return res.status(500).json({ message: 'Empty Stock' }); // Ensure res is the correct response object
        }
        

        const totalPrice=( (productData.price) *quantity);
      //    call payment service.
          const paymentResponse = await fetch("http://localhost:3003/payment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                amount:totalPrice,
                userId// replace with a valid user ID
            })
        });
          
        // Check if the payment was successful
        if (paymentResponse.ok) {
          // update the inventory 
          const inventoryUpdateResponse = await fetch("http://localhost:3005/updateInventory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId,
                quantity// replace with a valid user ID
            })
        });

           if(!inventoryUpdateResponse.ok){
            throw new Error("Inventory Update Unsuccessfull !!");
           }
           res.status(200).json({
            message: 'Order placed successfully',
            order: {
              userId,
              product: productData.name,
              quantity,
              totalPrice
            }
          });
        } else {
          // Handle payment failure
            res.status(500).json({ message: 'Payment failed. Please try again.',paymentResponse });
        }

        } catch (error) {
          console.error('Error checking inventory:', error);
          res.status(500).json({ message: 'An error occurred while checking inventory' });
        }
  } catch (error) {
      res.status(400).json({ message: "Error verifying token", error: error.message });
  }

});


    

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
