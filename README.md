## NOTICe: The development has moved to https://github.com/codeledge/image-database-next



Image Database
=======================

Project cloned from https://github.com/sahat/hackathon-starter


Readme will come soon

Install:

```
git clone https://github.com/mshd/image-database-express
cd image-database-express
npm install
nodemon app.js`
```

maybe you need to run
```
npm rebuild node-sass
```

#Database
.env.example has mongodb credentionals


#Usage
Basically there are two ways to upload new photos.

A basic form: where you can upload a file, and optionally provide a source.
If no upload file is given, the source Url will be copied to the uploads.

Multi upload: 1) search for a person 2) the script will redirect to a page with all their relatives. This form only accepts ULRs. Empty fields will be ignored. Depending on the amount of urls, this form might take a bit longer to process.

Image list: A list of all images, Users with role=admin can delete images, deletion will consist of removing the DB entry and remove the photo and its thumbnails.

Currently anyone can upload photos.

# License

GNU General Public License v3.0

#Author
M. Schibel
