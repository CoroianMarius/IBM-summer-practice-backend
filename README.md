This is an [Express.js](https://expressjs.com/) project.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The development server uses [nodemon](https://nodemon.io/) which will automatically restart the server when your code changes.

There is a sample example for [routes and controllers](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes) which returns a dummy response when a request is made to the server. You can find them at `src/routes/sample.js` and `src/controllers/sample.js`.

You can use [Postman](https://www.postman.com/) for testing the API.

There is also a sample example for a [model](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose) here `src/models/sample.js`, and a [MongoDB](https://www.mongodb.com/) connection config here `src/config/database.js`.

This project uses [mongoose](https://mongoosejs.com/), which is a is a JavaScript object-oriented programming library that creates a connection between MongoDB and the Node.js JavaScript runtime environment.

You can use a [MongoDB Atlas free tier cluster](https://www.mongodb.com/atlas/database) that allows you to quickly deploy and use a cloud database without worying about all the complexity.

## Learn More

To learn more about server side development, take a look at the following resource:

- [MDN docs tutorial](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs) - learn about Express.js, Node.js and MongoDB.
