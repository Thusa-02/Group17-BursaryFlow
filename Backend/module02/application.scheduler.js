// module 02
// Automatically moves expired submitted applications to GS_REVIEW.

const {
  BursaryApplication,
  APPLICATION_STATUS
} = require('./application.model');

const moveExpiredApplicationsToGSReview = async () => {
  try {
    const now = new Date();

    const result = await BursaryApplication.updateMany(
      {
        status: APPLICATION_STATUS.SUBMITTED,
        editDeadline: {
          $ne: null,
          $lte: now
        }
      },
      {
        $set: {
          status: APPLICATION_STATUS.GS_REVIEW
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[Application Scheduler] ${result.modifiedCount} application(s) moved to GS_REVIEW`
      );
    }

    return result.modifiedCount;
  } catch (error) {
    console.error(
      '[Application Scheduler] Failed to process expired applications:',
      error.message
    );

    return 0;
  }
};

const startApplicationDeadlineScheduler = () => {
  // Run once immediately when the server starts.
  moveExpiredApplicationsToGSReview();

  // Check every minute.
  const interval = setInterval(
    moveExpiredApplicationsToGSReview,
    60 * 1000
  );

  return interval;
};

module.exports = {
  moveExpiredApplicationsToGSReview,
  startApplicationDeadlineScheduler
};