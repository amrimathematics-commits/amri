const Membership = require("../models/Membership");
const {
  sendMembershipRenewalReminderEmail,
} = require("./emailService");

/*
|--------------------------------------------------------------------------
| MEMBERSHIP SCHEDULER
|--------------------------------------------------------------------------
|
| This service:
|
| 1. Finds active memberships.
| 2. Sends a renewal reminder when 30 days or less remain.
| 3. Automatically expires memberships after their expiry date.
|
| Lifetime memberships are ignored because they never expire.
|
|--------------------------------------------------------------------------
*/

const RENEWAL_FEE = 500;

const processMemberships = async () => {
  try {
    const now = new Date();

    console.log(
      `[Membership Scheduler] Running at ${now.toISOString()}`
    );

    /*
    |--------------------------------------------------------------------------
    | 1. EXPIRE MEMBERSHIPS
    |--------------------------------------------------------------------------
    */

    const expiredMemberships =
      await Membership.find({
        isMember: true,

        membershipType: {
          $ne: "Lifetime",
        },

        membershipExpiryDate: {
          $ne: null,
          $lte: now,
        },
      });

    if (expiredMemberships.length > 0) {
      for (const membership of expiredMemberships) {
        try {
          membership.isMember = false;

          membership.status = "expired";

          await membership.save();

          console.log(
            `[Membership Scheduler] Membership expired: ${
              membership.memberId ||
              membership._id
            }`
          );
        } catch (error) {
          console.error(
            `[Membership Scheduler] Failed to expire membership ${
              membership._id
            }:`,
            error.message
          );
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 2. FIND MEMBERSHIPS REQUIRING RENEWAL REMINDER
    |--------------------------------------------------------------------------
    */

    const activeMemberships =
      await Membership.find({
        isMember: true,

        membershipType: {
          $ne: "Lifetime",
        },

        membershipExpiryDate: {
          $ne: null,
          $gt: now,
        },

        renewalReminderSent: {
          $ne: true,
        },
      });

    for (const membership of activeMemberships) {
      try {
        const expiryDate =
          new Date(
            membership.membershipExpiryDate
          );

        const remainingMilliseconds =
          expiryDate.getTime() -
          now.getTime();

        const remainingDays =
          remainingMilliseconds /
          (1000 * 60 * 60 * 24);

        /*
        |--------------------------------------------------------------------------
        | SEND REMINDER WITHIN 30 DAYS
        |--------------------------------------------------------------------------
        */

        if (
          remainingDays <= 30 &&
          remainingDays > 0
        ) {
          /*
          |--------------------------------------------------------------------------
          | SAFETY: GENERATE RENEWAL ID IF MISSING
          |--------------------------------------------------------------------------
          */

          if (!membership.renewalId) {
            const year =
              now.getFullYear();

            let renewalId;

            let exists = true;

            while (exists) {
              const randomNumber =
                Math.floor(
                  100000 +
                    Math.random() *
                      900000
                );

              renewalId =
                `AMRI-REN-${year}-${randomNumber}`;

              exists =
                await Membership.exists({
                  renewalId,
                });
            }

            membership.renewalId =
              renewalId;
          }

          /*
          |--------------------------------------------------------------------------
          | SEND EMAIL
          |--------------------------------------------------------------------------
          */

          await sendMembershipRenewalReminderEmail({
            membership,

            renewalFee:
              RENEWAL_FEE,

            renewalUrl:
              process.env.CLIENT_URL
                ? `${process.env.CLIENT_URL.replace(
                    /\/$/,
                    ""
                  )}/membership/renew`
                : "/membership/renew",
          });

          /*
          |--------------------------------------------------------------------------
          | MARK REMINDER SENT
          |--------------------------------------------------------------------------
          */

          membership.renewalReminderSent =
            true;

          membership.renewalReminderSentAt =
            new Date();

          await membership.save();

          console.log(
            `[Membership Scheduler] Renewal reminder sent to ${membership.email}`
          );
        }
      } catch (error) {
        console.error(
          `[Membership Scheduler] Renewal processing failed for ${membership._id}:`,
          error.message
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | COMPLETE
    |--------------------------------------------------------------------------
    */

    console.log(
      `[Membership Scheduler] Completed. Expired: ${expiredMemberships.length}`
    );
  } catch (error) {
    console.error(
      "[Membership Scheduler] General error:",
      error
    );
  }
};

/*
|--------------------------------------------------------------------------
| START SCHEDULER
|--------------------------------------------------------------------------
|
| Runs once when the server starts.
|
| Then runs every 24 hours.
|
|--------------------------------------------------------------------------
*/

const startMembershipScheduler = () => {
  console.log(
    "[Membership Scheduler] Starting..."
  );

  /*
  |--------------------------------------------------------------------------
  | RUN IMMEDIATELY
  |--------------------------------------------------------------------------
  */

  processMemberships();

  /*
  |--------------------------------------------------------------------------
  | RUN EVERY 24 HOURS
  |--------------------------------------------------------------------------
  */

  const interval =
    setInterval(
      processMemberships,
      24 * 60 * 60 * 1000
    );

  /*
  |--------------------------------------------------------------------------
  | DON'T KEEP NODE PROCESS ALIVE ONLY FOR THIS TIMER
  |--------------------------------------------------------------------------
  */

  if (
    typeof interval.unref ===
    "function"
  ) {
    interval.unref();
  }

  return interval;
};

module.exports = {
  processMemberships,
  startMembershipScheduler,
};