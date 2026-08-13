import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis.js";

export const SUBMISSION_QUEUE_NAME = "submission-execution";
export const SUBMISSION_JOB_NAME = "execute-submission";

export const submissionQueue = new Queue(SUBMISSION_QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: false,
  },
});
