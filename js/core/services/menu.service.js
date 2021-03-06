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

    angular
        .module('jwShowcase.core')
        .service('menu', MenuService);

    /**
     * @ngdoc service
     * @name jwShowcase.core.menu
     */
    MenuService.$inject = ['$rootScope', '$timeout', '$controller', '$templateCache', '$ionicPopover'];
    function MenuService ($rootScope, $timeout, $controller, $templateCache, $ionicPopover) {

        var menuPopover;

        this.toggle = toggle;
        this.hide   = hide;
        this.show   = show;

        activate();

        //////////

        function activate () {

            // hide menu when state changes
            $rootScope.$on('$stateChangeStart', function () {
                if (menuPopover) {
                    hide();
                }
            });
        }

        /**
         * Position popover element
         * @param target
         * @param popoverElement
         */
        function positionView (target, popoverElement) {

            var scroll       = angular.element(popoverElement[0].querySelector('.scroll')),
                scrollParent = scroll.parent(),
                overflow, height, targetHeight;

            popoverElement.css({
                margin: 0,
                top:    0,
                left:   0
            });

            height   = popoverElement[0].offsetHeight;
            overflow = scroll[0].scrollHeight - scrollParent[0].offsetHeight;

            if (overflow > 0) {
                targetHeight = height + overflow + 1;
                popoverElement.css('height', targetHeight + 'px');
            }
        }

        /**
         * @ngdoc method
         * @name jwShowcase.core.menu#toggle
         * @methodOf jwShowcase.core.menu
         *
         * @description
         * Toggle menu's visibility.
         */
        function toggle () {

            if (menuPopover) {
                hide();
            }
            else {
                show();
            }
        }

        /**
         * @ngdoc method
         * @name jwShowcase.core.menu#hide
         * @methodOf jwShowcase.core.menu
         *
         * @description
         * Hide menu.
         */
        function hide () {

            if (!menuPopover || !menuPopover.isShown()) {
                return;
            }

            menuPopover.hide();
        }

        /**
         * @ngdoc method
         * @name jwShowcase.core.menu#show
         * @methodOf jwShowcase.core.menu
         *
         * @description
         * Show menu.
         */
        function show () {

            var menuScope;

            if (menuPopover) {
                return;
            }

            menuScope = $rootScope.$new();

            // bind controller to menuScope and inject menu with hide method
            $controller('MenuController as vm', {
                $scope: menuScope,
                menu:   {
                    hide: hide
                }
            });

            // load menu popover
            menuPopover = $ionicPopover
                .fromTemplate($templateCache.get('views/core/menu.html'), {
                    scope:        menuScope,
                    positionView: positionView,
                    animation:    'menu-animation',
                    hideDelay:    300
                });

            menuScope.$on('popover.hidden', function (event, popover) {

                $timeout(function () {
                    menuPopover.remove();
                    menuPopover = null;

                    $rootScope.$broadcast('jwMenu.hidden');
                }, popover.hideDelay);
            });

            menuPopover
                .show(document.body);

            $rootScope.$broadcast('jwMenu.visible');
        }
    }

}());
