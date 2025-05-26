const express = require('express');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api', stockRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
