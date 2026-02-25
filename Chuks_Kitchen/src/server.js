const { app } = require("./app");
const { env } = require("./config/env");

app.listen(env.port, () => {
  console.log(`Chuks Kitchen API running on port ${env.port}`);
});
