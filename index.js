const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.prsyf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
   try{
        await client.connect();
        const database = client.db('plantstore');
        const servicesCollection = database.collection('services');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');


           
        //Get API
        app.get('/services', async(req, res) =>{
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        //Get API for users
        app.get('/users', async(req, res) =>{
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        })

        //Get API for Reviews
        app.get('/reviews', async(req, res) =>{
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        //Get single services

        app.get('/services/:id', async(req,res)=>{
            const id =req.params.id;
            const query ={_id: ObjectId(id)};
            const service = await servicesCollection.findOne(query);
            res.json(service)
        })

        //POST API for services
        app.post('/services', async(req, res) =>{
            const service = req.body;
           console.log('hit the post', service)
            const result = await servicesCollection.insertOne(service);
            //console.log(result);
            res.json(result)
        }) 

        //Get email for verify
        app.get('/users/:email', async(req, res) =>{
            const email = req.params.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                   isAdmin = true;
            }
            res.json({admin: isAdmin});
        })


        //POST API for users
        app.post('/users', async(req, res) =>{
            const user = req.body;
           console.log('hit the post', user)
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        //POST API for reviews
        app.post('/reviews', async(req, res) =>{
            const review = req.body;
           console.log('hit the post', review)
            const result = await reviewsCollection.insertOne(review);
            res.json(result)
        })



         //PUT API for admin
        app.put('/users/admin', async(req,res) =>{
            const user = req.body;
            const filter = {email: user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result);
        })



        //Delete API
        app.delete('/services/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        })



   }
   finally{

             //await client.close();
             
   }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running plantstore server')
})

app.listen(port, () =>{
    console.log('Running plantstore on port', port);
})