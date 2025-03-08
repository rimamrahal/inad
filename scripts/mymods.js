 require("dotenv").config();

var Dropbox = require("dropbox").Dropbox;
const fetch = require("node-fetch");


const dbx = new Dropbox({
    accessToken: process.env.DROPBOXACCESSTOKEN,
    fetch
});

saveDropbox = function (content, filename, foldername) {
    return dbx.filesGetMetadata({
        path: "/" + foldername,
    }).catch(err => {
              //console.log(err['error']['path'])
        if (err.error.error.path['.tag'] == 'not_found') {
            return dbx.filesCreateFolder({
                path: "/" + foldername,
                autorename: false,
            });
        } else {
            throw err;
        }
    }).then(() => {
        return dbx.filesUpload({
            path: "/" + foldername + "/" + filename,
            contents: content
        });
    });
};

saveDropboxSingleFile = function (content, filename) {
    return dbx.filesUpload({
        path: "/" + filename,
        contents: content,
        autorename: false,
        mode:  'overwrite'
    });
};

module.exports.saveDropbox = saveDropbox;
module.exports.saveDropboxSingleFile = saveDropboxSingleFile;