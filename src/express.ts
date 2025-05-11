import './db';
import express from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import cors from 'cors';
import logger from './Config/LoggerConfig';
import rateLimit from 'express-rate-limit';


const app = express();
const morganFormat = ':method :url :status :response-time ms';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each ip to 10 requests per window/minute
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression()); // compressor of body data, improving transfer speed.
app.use(cors()); // activate cors. allow access
app.use(limiter); // limit the number of requests
// Logs using morgan
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// Routes

export default app;
