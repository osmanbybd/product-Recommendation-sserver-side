const express = require('express');
const cors = require('cors');
const port =process.env.PORT || 5000;
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.PRODUCT_URL}:${process.env.PRODUCT_PASS}@cluster0.t3igz9r.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {


    const queryColletions = client.db('product_management').collection('queries')
    const recommendationCollection = client.db('product_management').collection('recommendation')


app.post('/add-query', async(req, res) =>{
    const newQuery = req.body;

    newQuery.timestamp = new Date().toISOString();
    newQuery.recommendationCount = 0;

    const result = await queryColletions.insertOne(newQuery)
    res.send(result)

})


    app.get('/queries' , async(req, res) =>{
        const limit = parseInt(req.query.limit) || 0;
        const result = await queryColletions.find().sort({timestamp : -1}).limit(limit).toArray();
        res.send(result)
    })



    app.get('/queries/:id' , async(req, res) =>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await queryColletions.findOne(query)
      res.send(result)
    })

    app.get('/my-queries/:email' , async(req, res) =>{
      const email = req.params.email; 
      const query = { userEmail : email}
      const result = await queryColletions.find(query).toArray();
      res.send(result)
    })



    app.patch('/like/:id' , async(req, res) =>{
      const id = req.params.id;
      const email = req.body.email;
      const filter = {_id : new ObjectId(id)};
      const item = await queryColletions.findOne(filter);

      if(!item){
        return res.status(404).send({Query : 'Query Not Found'})
      }
      if(!Array.isArray(item.recommendationCount)){
        await queryColletions.updateOne(filter, {
          $set : { recommendationCount : []}
        })
        item.recommendationCount = [];
      }

      const alreadyLiked = item?.recommendationCount.includes(email)
      const updateDoc = alreadyLiked ? { 
        $pull : {
          recommendationCount : email
        }
      }  :{
        $addToSet :{
            recommendationCount : email
        }
      }
      await queryColletions.updateOne(filter , updateDoc)
      res.send({
        message : alreadyLiked ? 'dislike successful' : 'like successful',
        limit : !alreadyLiked
      })
    })


    app.get('/recommendation', async(req, res) => {
      const  queryId = req.query.queryId;
      const result = await recommendationCollection.find({queryId :queryId}).sort({timestamp: -1}).toArray()
      res.send(result)
    })

    app.get('/my-recommendation' , async(req, res) =>{
      const email = req.query.email;
      const recommendationEmail = {recommenderEmail : email};
      const result = await recommendationCollection.find(recommendationEmail).toArray()
      res.send(result)
    })

    app.delete('/myRecommendation/:id' , async(req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const recommendation = await recommendationCollection.findOne(filter)


      const queryId = recommendation.queryId;

      await recommendationCollection.deleteOne(filter)

      await queryColletions.updateOne(
        {_id : new ObjectId(queryId)},
        {$inc : {recommendationCount : - 1}}

        
      )
      res.send({success : true , message : 'Recommendation Delete  and Count Update'})
    })


    app.get('/recommendationForMe' , async( req , res) =>{
      
      const email = req.query.email;
      const userQueries = await queryColletions.find({userEmail :email}).toArray()
      const queryIds = userQueries.map(userQuery => userQuery._id.toString())


      const recommendation = await recommendationCollection.find(
        {
          queryId : {$in : queryIds},
          recommenderEmail : {$ne : email}
        },
        
      ).toArray()
      res.send(recommendation)

    })



   app.post('/recommendation', async(req, res) =>{
        const query = req.body;
        const result = await recommendationCollection.insertOne(query)
      const queryId = query.queryId
        await queryColletions.updateOne(
          {_id : new ObjectId(queryId)},
          {$set  : {recommendationCount : 1}}
        )
        res.send(result)
      })


    app.put('/updateQueries/:id' ,async(req, res) =>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updatePage = req.body
      updatePage.timestamp = new Date()
      const updateDoc = {
        $set :{
          ...updatePage
        }
      }
      const result = await queryColletions.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.delete('/queryDelete/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)};
      const result = await queryColletions.deleteOne(filter)
      res.send(result)
    })

  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('server is running 100')
})

app.listen(port, () =>{
    console.log(`server is running is port ${port}`)
})


