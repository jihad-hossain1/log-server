require("dotenv").config();
const app = require("./app");

app.listen(process.env.PORT || 7000, () => {
    console.log(`server is run on port: ${process.env.PORT}`);
  });
