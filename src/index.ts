import express from "express";
import cors from "cors";
import oltRoutes from "./routes/oltRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use(oltRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
