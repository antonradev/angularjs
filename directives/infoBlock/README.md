## InfoBlock - custom Angular.js directive

Displays content in blocks with several elements - block icon, title, link for the title and description text. 
This directive can work with ng-repeat and binding data to its attributes, or can be placed directly without any repeaters.
For example, if there is no data for the URL attribute, the directive hides the link and the title is not clickable.

The directive stores marked blocks IDs in the local storage of the browser. Marked blockes are listed in visible menu and can be cleared and then their values are removed from the local storage array.

Live demo: http://angularjs.uxpd.net/infoblocks/

Author: Anton Radev 2015 http://antonradev.com
