'use strict';

const RESPONSE_STATUS_CODES_VAL = {
    'STATUS200': 200,
    'STATUS204': 204,
    'STATUS400': 400,
    'STATUS401': 401,
    'STATUS405': 405,
    'STATUS409': 409,
    'STATUS412': 412,
    'STATUS417': 417,
    'STATUS422': 422,
    'STATUS429': 429,
    'STATUS500': 500
};

const RESPONSE_STRINGS = {
    UPDATE_ERROR: 'Error updating the record.',
    UPDATE_SUCCESSFUL: 'Record updated successfully.',
    DELETE_SUCCESSFUL: 'Record deleted successfully.',
    DELETE_ERROR: 'Error deleting the record.',
    GETUSER_ERROR: 'Error fetching user details.',
    GETVENDOR_ERROR: 'Error fetching vendor details.',
    GETCARTYPE_ERROR: 'Error fetching car types.',
    BOOKING_ERROR: 'Error while checking in.',
    RECEIPT_ERROR: 'Error getting receipt.',
    PARKING_LOT_CREATED: 'Parking lot created successfully.',
    CHECKOUT_COMPLETION_ERROR: 'Error in marking booking status to completed.',
    LOGGED_IN: 'Login successful.',
    INVALID_PASSWORD: 'Incorrect password',
    INVALID_UERNAME: 'User email not found',
    EXISTS_UERNAME: 'User alreadyy registered',
    NO_DATA_FOUND: 'No data found.',
    PRIVACY_POLICY_UPDATED: 'Privacy policy updated successfully.',
    PRIVACY_POLICY_CREATED: 'Privacy policy created successfully.',
    INVALID_TOKEN: 'Unauthorized, Invalid token',
    UNAUTHORIZED: 'Unauthorized',
    NO_ACCESS: 'You do not have access to this section.',
    INVALID_SUBSCRIPTION_REQ: 'Subscription request is not valid.'
};

const STRING_VARS = {
    SERVER_ERROR: 'Unexpected error occured at server.',
    ADMIN_PASSWORD_RESET_MAIL_SUBJECT: 'Admin Password reset link.',
    ADMIN: 'Admin'
};

module.exports = {
    RESPONSE_STATUS_CODES: RESPONSE_STATUS_CODES_VAL,
    RESPONSE_MSG: RESPONSE_STRINGS,
    STRING_VARS,
};