# Lama

A Blog powered by Node.js

# Installation

The Current version of Lama has been tested with node.js v12.x, please make sure you have node.js v12.x installed,
then navigate to the project directory run npm install. Then run npm start. The console should tell you what IP and Port it is running on.

# Database

Lama requires Mongodb, it uses Mongoose to connect.
The committed code for the Mongoose connection, in the app.js file is using a secure Mongobd connection and looks like this.

mongoose.connect('mongodb://sysLama:123@localhost/Lama', {
uri_decode_auth : true
}, function(err, db) {}
);

In the example above sysLama is the user and 123 is the password. You will want to create a user with a better password!!
This type of connection will require a user with read/write authority to be created in the Lama db.

If you plan on using the default settings for Mongodb, which does not require users, then you will want to change the Mongoose connector to look like this.

mongoose.connect('mongodb://localhost/Lama', {
uri_decode_auth : true
}, function(err, db) {}
);

# Users

Once up and running the first user created for the app will automatically be assigned admin rights to the app. Every user after that can be assigned admin rights in the admin section of the app. If all users have admin rights removed the next user created will gain admin rights.

# Settings

Lama has a variety of themes to choose from on the settings page. All themes are direct imports from https://bootswatch.com/3/. The default theme is Readable. Other settings available are Header this sets the header line for the app; the default is Lama. You also have the ability to turn off new user sign up and can change the URLs for the Twitter and Facebook icons in the footer of the page.

# Current Version 2.0.0

First major version update. I have updated the base node js version to 12.x and have updated all dependencies to there latest version as of this build date. I also refactored all breaking feature updates to be compatible with current versions.

# Future Release

Search for blogs by date. / Delete users.
