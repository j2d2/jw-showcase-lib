/**
 * Copyright 2015 Longtail Ad Solutions Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 **/

(function () {

    /**
     * @const MEDIA_QUERIES
     * @type {<Object>}
     */
    var SCREEN_SIZES = {
        xs: window.matchMedia('(max-width: 540px)'),
        sm: window.matchMedia('(min-width: 541px) and (max-width: 960px)'),
        md: window.matchMedia('(min-width: 961px) and (max-width: 1280px)'),
        lg: window.matchMedia('(min-width: 1281px) and (max-width: 1680px)'),
        xl: window.matchMedia('(min-width: 1681px)')
    };

    angular
        .module('jwShowcase.core')
        .service('utils', utils);

    /**
     * @ngdoc service
     * @name jwShowcase.core.utils
     * @description Collection of utility functions
     */
    function utils () {

        this.flatMap                = flatMap;
        this.ucfirst                = ucfirst;
        this.getTransitionEventName = getTransitionEventName;
        this.getVideoDurationByItem = getVideoDurationByItem;
        this.debounce               = debounce;
        this.getValueForScreenSize  = getValueForScreenSize;
        this.replaceImageSize       = replaceImageSize;
        this.copyToClipboard        = copyToClipboard;
        this.slugify                = slugify;

        ////////////////////////

        /**
         * @ngdoc method
         * @name jwShowcase.core.utils#flatMap
         * @methodOf jwShowcase.core.utils
         *
         * @description
         * Flatten array with map function
         *
         * @param {Array}       array       Input array
         * @param {Function}    transform   Map function
         * @returns {Array}                 Flattened array
         */
        function flatMap (array, transform) {

            return Array.prototype.concat.apply([], array.map(transform));
        }

        /**
         * @ngdoc method
         * @name jwShowcase.core.utils#ucfirst
         * @methodOf jwShowcase.core.utils
         *
         * @description
         * Uppercase the first character of given string
         *
         * @param   {string} input  Input string
         * @returns {string}        string result
         */
        function ucfirst (input) {

            var string = String(input);

            return string[0].toUpperCase() + string.slice(1);
        }

        /**
         * @ngdoc method
         * @name jwShowcase.core.utils#getTransitionEventName
         * @methodOf jwShowcase.core.utils
         *
         * @description
         * Returns correct transition event name
         *
         * @param {string}              event   Event name, e.g.: end
         * @returns {string|undefined}          Transition event name for the current navigator
         */
        function getTransitionEventName (event) {

            var el          = document.createElement('fakeelement'),
                transitions = {
                    'transition':       'transition' + event,
                    'OTransition':      'oTransition' + ucfirst(event),
                    'MozTransition':    'transition' + event,
                    'WebkitTransition': 'webkitTransition' + ucfirst(event)
                },
                index;

            for (index in transitions) {
                if (el.style[index] !== undefined) {
                    return transitions[index];
                }
            }
        }

        /**
         * Find duration in item sources and return it in seconds or minutes format. If the duration is 0 the string
         * 'LIVE' will be returned.
         *
         * @param {jwShowcase.core.item} item Playlist item
         * @returns {string} The found duration with sec or min suffix.
         */
        function getVideoDurationByItem (item) {

            var source,
                duration = 0;

            if (angular.isNumber(item.duration)) {

                duration = item.duration;
            }
            else if (angular.isArray(item.sources)) {

                source = item.sources
                    .find(function (source) {
                        return source.duration > 0;
                    });

                if (source && source.duration) {
                    duration = source.duration;
                }
            }

            if (duration === 0) {
                return 'LIVE';
            }

            if (duration < 60) {
                return duration + ' sec';
            }

            return Math.ceil(duration / 60) + ' min';
        }

        /**
         * Debounce the given function `fn` by the given time `wait`.
         *
         * @param {function}    fn      Function to execute after wait.
         * @param {number}      wait    Debounce time in milliseconds
         * @returns {function}          Debounced function
         */
        function debounce (fn, wait) {

            var timeoutId;

            function debounced () {

                var thisArg = this,
                    args    = arguments;

                clearTimeout(timeoutId);
                timeoutId = setTimeout(function () {
                    fn.apply(thisArg, args);
                }, wait);
            }

            return debounced;
        }

        /**
         * Get value based on matching screenSize, will return last given screenSize or defaultValue when none did
         * match.
         *
         * @param {Object} screenSizes
         * @param {*}      defaultValue
         *
         * @returns {*} Value
         */
        function getValueForScreenSize (screenSizes, defaultValue) {

            var keys  = Object.keys(screenSizes),
                key,
                index = 0,
                last;

            for (; index < keys.length; index++) {

                key = keys[index];

                if (angular.isDefined(screenSizes[key])) {
                    last = screenSizes[key];
                }

                if (SCREEN_SIZES[key] && true === SCREEN_SIZES[key].matches) {
                    return last;
                }
            }

            return last || defaultValue;
        }

        /**
         * Replace size in image url
         *
         * @param {string} url
         * @param {string} width
         *
         * @returns {string}
         */
        function replaceImageSize (url, width) {

            var matches;

            if (!url) {
                return '';
            }

            matches = url.match(/-(\d+)\.(\w+)$/);

            if (matches.length === 3) {
                url = url.replace(matches[0], matches[0].replace(matches[1], width));
            }

            return url;
        }

        /**
         * Copy given string to the clipboard via a hidden input element
         *
         * @param {string} text Text to be copied into the clipboard
         * @returns {boolean} Returns true if the text was copied successful
         */
        function copyToClipboard (text) {

            var inputElement = angular.element('<input type="text" />'),
                success      = false;

            inputElement.css({
                position: 'absolute',
                left:     '-1000px',
                fontSize: '18px'
            });

            inputElement.val(text);

            angular.element(document.body).append(inputElement);

            if (inputElement[0] && inputElement[0].select) {

                inputElement[0].select();

                try {
                    document.execCommand('copy');
                    success = true;
                }
                catch (error) {
                }

                inputElement[0].blur();
            }

            inputElement.remove();

            return success;
        }

        /**
         * Slugify text
         * @param {string} text
         * @returns {string}
         */
        function slugify (text) {

            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        }
    }

}());
