'use strict';

/**
 * /api/services/DataService.js
 *
 * Generic data service which contains helper functions for data fetching.
 */
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Helper function to fetch generic data from database with sails.js. Note that
 * this will not use .sort(), .limit() nor .skip() methods of waterline.
 *
 * Usually this function is used to fetch grouped data from database and that
 * is the reason why we cannot use those previously mentioned waterline ORM functions.
 *
 * @param   {Request}   request         Request object
 * @param   {Object}    [extraCriteria] Extra criteria object
 * @param   {Function}  next            Callback function
 */
exports.getCollection = function(request, extraCriteria, next) {
    // Determine model name and used default criteria object
    var model = actionUtil.parseModel(request);
    var criteria = actionUtil.parseCriteria(request);

    // Merge extra criteria to main criteria object
    if (extraCriteria) {
        criteria = _.merge(criteria, extraCriteria);
    }

    // Fetch data from database
    model
        .find(criteria)
        .exec(function found(error, items) {
            next(error, items);
        });
};

/**
 * Helper function to sort and paginate array of items. Sort and pagination parameters
 * are parsed from current Request object.
 *
 * This function is needed because waterline doesn't support sorting and pagination with
 * groupBy criteria.
 *
 * @param   {Array}     items   Array of items to sort and paginate
 * @param   {Request}   request Request object
 *
 * @returns {Array}
 */
exports.sortAndPaginate = function(items, request) {
    var limit = actionUtil.parseLimit(request);
    var skip = actionUtil.parseSkip(request);
    var sort = actionUtil.parseSort(request).split(' ');

    items = _.sortBy(items, sort[0]);

    if (sort[1] === 'DESC') {
        items.reverse();
    }

    return items.slice(skip, (skip + limit));
};

/**
 * Service method to fetch single user data from database.
 *
 * @param   {Number|Object} where           Used query conditions
 * @param   {Function}      next            Callback function to call after query
 * @param   {Boolean}       [noExistsCheck] If data is not found, skip error
 */
exports.getUser = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    User
        .findOne(where)
        .populate('passports')
        .exec(function(error, /** sails.model.user */ user) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch user data]");
                sails.log.error(error);
            } else if (!user && !noExistsCheck) {
                error = new Error();

                error.message = "User not found.";
                error.status = 404;
            }

            next(error, user);
        });
};

/**
 * Service method to fetch single passport data from database.
 *
 * @param   {Number|Object} where           Used query conditions
 * @param   {Function}      next            Callback function to call after query
 * @param   {Boolean}       [noExistsCheck] If data is not found, skip error
 */
exports.getPassport = function(where, next, noExistsCheck) {
    noExistsCheck = noExistsCheck || false;

    Passport
        .findOne(where)
        .exec(function(error, /** sails.model.passport */ passport) {
            if (error) {
                sails.log.error(__filename + ":" + __line + " [Failed to fetch passport data]");
                sails.log.error(error);
            } else if (!passport && !noExistsCheck) {
                error = new Error();

                error.message = "Passport not found.";
                error.status = 404;
            }

            next(error, passport);
        });
};