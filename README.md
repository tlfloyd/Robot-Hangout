# Robot-Hangout
Creates a web-page that multiples tabs can connect to and see other users moving their robot around
To see this effect, when you execute the run.bat file, you can duplicate the tab it opens and put them side by side
When you click in one tab, a robot will appear on the other tab, mirroring it's movements
In every tab, there will be one blue robot (the user) and all other robots will be green (users from other tabs)

In this project, the front-end is coded using an html file calling a javascript file as its script
More specifically, I created a typescript file that compiles into a javascript file
The front-end handles drawing sprites to the screen, inputs made by the user, and regularly requesting updates from the back-end
Each user will only request an update from the back-end once per second, so as to not hammer my laptop)
Realistically, to create a seamless experience with no lag, update requests would be sent much more frequently

-When a player clicks, it will send a request to the back end containing its unique ID and the location it clicked
-When a player requests an update, it sends a request to the back end containing its ID, and its current location
-When the back-end sends information of a new player, the front-end will add that player's information to an array of Sprites to be drawn to the screen

The back-end consists of 2 python files, main.py and daemon.py
The daemon.py is a basic daemon file that was provided for this project, and handles most of the communication between the front and back ends
The main.py file handles the specifics of the requests and responses between the front and back ends as follows:

-If a request is made from a user clicking on the screen, it records that click, and saves it in a List
-If it is a new user sending a click, it adds that user and their custom ID to a Dict
-If a request is made from a regular update cycle, it responds with all click information that has happened since the user. This information is sent in a List of Tuples


To send requests, the front-end will call the httpPost() function, giving it a payload (the information) and a callback function which will use the information that the back end responds with
Any information sent between the servers is formatted as a JSON object, which particularly helps reduce the load on the back-end
