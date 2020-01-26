# Lama
 A Blog powered by Node.js

# Database
 Lama requires Mongodb, it uses Mongoose to connect.
The commited code for the Mongoose conection, in the app.js file is using a secure Mongobd connecton and looks like this.

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
 Lama has a variety of themes to choose from on the settings page. All themes are direct imports from https://bootswatch.com. The default theme is Readable. Other settings available are Header this sets the header line for the app; the default is Lama. You also have the ability to turn off new user sign up and can change the URLs for the Twitter and Facebook icons in the footer of the page.

# Current Version 1.1.1
 Fixed theme URLs.


# Future Release
 Future version plans include the ability to search for blogs by date/Author. Currently the app sorts all blogs by date, putting the most recent at the top etc...,  and comment delete.


