const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
}));

require('dotenv').config();
const PORT = process.env.PORT || 4000;

app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(cookieParser());

require("./config/database").connect();

const auth = require("./routes/authRoutes");
app.use("/api/auth",auth);

const user = require("./routes/userRoutes");
app.use("/api/users",user);

const skills = require("./routes/skillsRoutes")
app.use("/api/skills",skills);

const swap = require("./routes/swapRoutes");
app.use("/api/swaps",swap);

const session = require("./routes/sessionRoutes");
app.use("/api/sessions",session);

const chat = require("./routes/messageRoutes");
app.use("/api/chats",chat)

const instructor = require("./routes/instructorRoutes");
app.use("/api/instructor",instructor);

app.listen(PORT,() => {
    console.log(`App is listning at ${PORT}`);
})