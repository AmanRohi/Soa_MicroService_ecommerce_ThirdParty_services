
const express = require('express');
const app = express();
const PORT = 3000;


app.use(express.json());


app.get('/', (req, res) => {
  res.send('Hello, World! This is your microservice.');
});


const verifyTokenWithExternalService = async (token) => {
    try {
        const response = await axios.post('https://your-auth-service/verify-token', { token });
        return response.data; 
    } catch (error) {
        throw new Error('Token verification failed');
    }
};

app.post('/', async (req, res) => {

  try {
    
      const token = req.header('Authorization')?.split(' ')[1];  
      const verificationResponse = await verifyTokenWithExternalService(token);
      if (!verificationResponse.isValid) {
          return res.status(401).json({ message: "Token is not valid" });
      }

      const { customerName, productId, quantity } = req.body;


    
      // Validate input
      if (!customerName || !productId || !quantity) {
        return res.status(400).json({ message: 'Please provide customerName, productId, and quantity.' });
      }
    
      
      
      // Check the inventory Over here .. 

      // make a api call here 

      try {
          
          const inventoryResponse = await axios.get(`https://api.example.com/inventory/${productId}`);
          const stock = inventoryResponse.data.stock; 
      
        if(stock == 0) res.status(500).json({message : 'Empty Stock'});

      //    call payment service.
      const paymentResponse = await axios.post('https://api.example.com/payment', {
          customerName,
          productId,
          quantity,
          price
        });
    
        // Check if the payment was successful
        if (paymentResponse.data.status === 'success') {
          return res.status(200).json({
            message: 'Order placed successfully',
            order: {
              customerName,
              product: product.name,
              quantity,
              totalPrice
            }
          });
        } else {
          // Handle payment failure
          return res.status(500).json({ message: 'Payment failed. Please try again.' });
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
