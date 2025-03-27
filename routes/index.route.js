const taskRoute = require('./task.route');
const userRoute = require('./user.route');

module.exports = (app) => {

  app.use("/api/tasks", taskRoute);

  app.use("/api/users", userRoute);

}