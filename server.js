const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');


app.use(express.json());
app.use(cors());
dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})
//Check if there's a connection
db.connect((err) => {
    //If no connection
    if (err) return console.log("Error connecting to MYSQL");
    //IF connection works successfully
    console.log("Connected to MYSQL as id: " ,db.threadId)
})

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//Data.ejs file is in Views folder
app.get('/data',(req,res) => {
    //Question 1:retrieve data from the database
    db.query('SELECT patient_id, first_name, last_name, date_of_birth FROM patients', (err, results) =>{
        if (err){
            console.error(err)
            res.status(500).send('Error Retrieving data')
        } else{res.render('data',{results: results});
        }
    });
});
app.get('/providers', (req, res) => {
  const sqlQuery = 'SELECT first_name, last_name, provider_specialty FROM providers'
  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).send('An error occurred while fetching the providers.');
      return;
    }
  });
});

//Question 3: GET endpoint to retrieve patients by first name
app.get('/patients/by-name', (req, res) => {
    const firstName = req.query.first_name; 
  
    if (!firstName) {
      return res.status(400).send('First name is required');
    }
  
    const sqlQuery = 'SELECT patient_id, first_name, last_name, date_of_birth FROM patients WHERE first_name = ?';
    
    db.query(sqlQuery, [firstName], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('An error occurred while fetching the patients.');
        return;
      }
  
      if (results.length === 0) {
        return res.status(404).send('No patients found with the given first name');
      }
    });
  });
// Question 4: GET endpoint to retrieve providers by specialty
  app.get('/providers/by-specialty', (req, res) => {
    const specialty = req.query.provider_specialty; 
  
    if (!specialty) {
      return res.status(400).send('Provider specialty is required');
    }
  
    const sqlQuery = 'SELECT first_name, last_name, provider_specialty FROM providers WHERE provider_specialty = ?';
  
    db.query(sqlQuery, [specialty], (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).send('An error occurred while fetching the providers.');
        return;
      }
  
      if (results.length === 0) {
        return res.status(404).send('No providers found with the given specialty');
      }
    });
  });

//Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);

    //Sending a message to browser
    console.log('Sending message to the browser...');
    app.get('/', (req,res) => {
        res.send('Server started successfully!');
    });
});



