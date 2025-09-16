import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
  name: String,
  company: String,
  email: String,
  requirement: String
});

export default mongoose.model("Client", ClientSchema);
