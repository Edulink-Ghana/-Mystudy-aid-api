import mongoose from "mongoose";
import 'dotenv/config'

 const connectionString=process.env.MONGO_URL;


 //export database
 export const dbConnection = async (next) => {
    try {
      await mongoose.connect(connectionString)
          console.log('Database is Connected Successfully')
      } catch (error) {
     next(error)
    }
 }
