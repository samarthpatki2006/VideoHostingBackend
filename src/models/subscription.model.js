import mongoose,{Scehma} from "mongoose";
const subscriptionSchema=new Schema(
  {
    subscriber:{
      type:mongoose.Types.ObjectId,
      ref:"User"
    },
    channel:{
      type:mongoose.Types.ObjectId,
      ref:"User"
    }
  },{
    timestamps:true
  }
  
)
export const Subscrption=mongoose.model("Subscription",subscriptionSchema)