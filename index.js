const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('TOY STORE SERVER IS RUNNING');
})

app.listen(port, () => {
    console.log(`Toy store server is listening to port ${port}`);
})