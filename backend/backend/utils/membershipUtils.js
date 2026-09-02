const crypto = require("crypto");

/*
|--------------------------------------------------------------------------
| Generate Renewal ID
|--------------------------------------------------------------------------
*/

function generateRenewalId() {
  const year = new Date().getFullYear();

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `AMRI-REN-${year}-${randomPart}`;
}

/*
|--------------------------------------------------------------------------
| Calculate Membership Expiry
|--------------------------------------------------------------------------
|
| One year from payment/start date.
|
*/

function calculateMembershipExpiry(startDate) {
  const expiryDate = new Date(startDate);

  expiryDate.setFullYear(
    expiryDate.getFullYear() + 1
  );

  return expiryDate;
}

/*
|--------------------------------------------------------------------------
| Is Membership Active?
|--------------------------------------------------------------------------
*/

function isMembershipActive(membership) {
  if (!membership) {
    return false;
  }

  if (!membership.isMember) {
    return false;
  }

  if (!membership.membershipExpiryDate) {
    return false;
  }

  return (
    new Date(membership.membershipExpiryDate) >
    new Date()
  );
}

/*
|--------------------------------------------------------------------------
| Is Membership Expired?
|--------------------------------------------------------------------------
*/

function isMembershipExpired(membership) {
  if (!membership?.membershipExpiryDate) {
    return false;
  }

  return (
    new Date(membership.membershipExpiryDate) <=
    new Date()
  );
}

/*
|--------------------------------------------------------------------------
| Days Until Expiry
|--------------------------------------------------------------------------
*/

function getDaysUntilExpiry(expiryDate) {
  if (!expiryDate) {
    return null;
  }

  const now = new Date();

  const expiry = new Date(expiryDate);

  const difference =
    expiry.getTime() - now.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

module.exports = {
  generateRenewalId,
  calculateMembershipExpiry,
  isMembershipActive,
  isMembershipExpired,
  getDaysUntilExpiry,
};