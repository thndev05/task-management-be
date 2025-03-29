const taskRoute = require('./task.route');
const userRoute = require('./user.route');

const authMiddleware = require('../middlewares/auth.middleware');

module.exports = (app) => {

  app.use("/api/tasks", 
    authMiddleware.requireAuth,
    taskRoute
  );

  app.use("/api/users", userRoute);

}