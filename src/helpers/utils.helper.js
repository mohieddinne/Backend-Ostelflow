/**
 * Tekru Plateform JS helpers
 */
const { Option } = require("../models");
const fs = require("fs");
const path = require("path");
const urlJoin = require("url-join");

const utilsHelpers = {
  options: {},

  // Add the public URL to an Endpoint
  async getOption(name) {
    // Validate input
    if (typeof name != "string" || name == "") {
      return false;
    }

    if (this.options[name] != null) {
      return this.options[name];
    }

    // Get the option
    const option = await Option.findOne({
      attributes: ["value"],
      where: {
        name,
      },
    });

    // Check if option exists
    if (!option) {
      Option.create({
        name,
        value: null,
      });
      return false;
    }

    this.options[name] = option.value; // Store it into the object
    return this.options[name];
  },

  // Get options
  async getOptions(...names) {
    if (!Array.isArray(names)) return null;

    const optionNames = names.filter((item) => typeof item === "string");
    // TODO add a caching handler

    // Get the options
    const options = await Option.findAll({
      attributes: ["value"],
      where: { name: optionNames },
    });

    // Check if option exists
    if (!options) {
      return null;
    }
    return options.map((option) => option.value);
  },

  async clearOptionsCache() {
    this.options = {};
    return true;
  },

  // Upload a file
  async uploadFile(data) {
    // Get the vars
    let { destination, file, allowedFileMime, savedFileName } = data;

    // Set the destination
    if (destination == null || destination == undefined || destination == "") {
      destination = config.folders.upload_misc;
    }
    const uploadFolder = path.join(
      __dirname,
      "../../", // Get back to the root of the server folder
      destination
    );

    // Verify if the user folder exists
    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder); // Creat the folder
    }

    // Get the file vars
    const { mimetype, createReadStream } = await file;

    // Set the default allowed file mime
    if (typeof allowedFileMime != "object" || allowedFileMime.length < 1) {
      allowedFileMime = ["image/jpeg", "image/jpg", "image/png"]; // TODO make an option in DB
    }

    // Validate file metadata
    if (allowedFileMime.indexOf(mimetype) < 0) {
      return false;
    }

    // Prepare the destination
    if ([undefined, null, ""].indexOf(savedFileName) > -1) {
      const today = new Date();
      const mimeType_temp = mimetype.split("/");
      savedFileName =
        "" +
        today.getFullYear() +
        ("0" + (today.getMonth() + 1)).slice(-2) +
        today.getDate() +
        "-" +
        today.getTime() +
        "." +
        mimeType_temp[1];
    }

    // Save the file
    return await new Promise((resolve, reject) => {
      createReadStream()
        .pipe(fs.createWriteStream(path.join(uploadFolder, savedFileName)))
        .on("close", function () {
          resolve(savedFileName);
        })
        .on("error", function (err) {
          reject(false);
        });
    });
  },

  /**
   * Render file URL
   * Get the file name of .jpg file and verify it's existance
   * The file will return a null if the file is not existing of the server public folder
   * @param String fileName file name with no URL (ex: 20190830-1567181256802-87.jpeg)
   */
  async renderFilePublicUrl(fileName, path) {
    if (fileName.indexOf("http://") >= 0 || fileName.indexOf("https://") >= 0) {
      return fileName;
    }
    if (path == null || path == undefined) {
      path = config.folders.upload_misc;
    }
    return await this.fileExists(fileName, path)
      .then(function () {
        return urlJoin(config.urls.server_url, path, fileName);
      })
      .catch(function () {
        return null;
      });
  },

  /**
   * renderProfilePictureUrl
   * Get the file name of .jpg file and verify it's existance
   * The file will return a null if the file is not existing of the server public folder
   * @param String fileName file name with no URL (ex: 20190830-1567181256802-87.jpeg)
   */
  async renderProfilePictureUrl(fileName) {
    return await this.fileExists(fileName, config.folders.upload_user)
      .then(function (result) {
        return urlJoin(
          config.urls.server_url,
          config.folders.upload_user,
          fileName
        );
      })
      .catch(function (error) {
        return null;
      });
  },

  async fileExists(fileName, fileFolder, returnsPath = false) {
    if (fileFolder == undefined) {
      fileFolder = config.folders.upload_misc;
    }
    const filePath = path.join(
      __dirname,
      "../../", // Get back to the root of the server folder
      fileFolder,
      fileName
    );
    return new Promise((resolve, reject) => {
      fs.access(filePath, fs.F_OK, (err) => {
        if (err) {
          return reject(err);
        }
        if (returnsPath) resolve(filePath);
        return true;
      });
    });
  },
};

utilsHelpers.fromUrl = function (url) {
  return urlJoin(config.urls.frontend_url, url);
};

utilsHelpers.backendUrl = function (url) {
  return urlJoin(config.urls.server_url, url);
};

const ref = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-";
const key = "CGBRXnFJZTa41EA9LfmwWvYuhPd528MepOQUkyj3lrzNx-t7IqcDoKVbgi0Ss6H";

utilsHelpers.encrypt = function (value, l = 32) {
  const string = value.toString();
  const length = string.length;
  let result = "";
  if (length < l) {
    for (let i = 0; i < l - 1 - length; i++) {
      const rand = Math.floor(Math.random() * Math.floor(62));
      result += key[rand];
    }
    result += key[ref.indexOf("-")];
  }
  for (let i = 0; i < length; i++) {
    const char = string[i];
    const index = ref.indexOf(char);
    if (index >= 0) result += key[index];
    else result += char;
  }
  return result;
};

utilsHelpers.decrypt = function (value) {
  const string = value.toString();
  let result = "";
  for (let i = 0; i < string.length; i++) {
    const char = string[i];
    const index = key.indexOf(char);
    if (index >= 0) result += ref[index];
    else result += char;
  }
  // Remove the white space
  const sepIndex = result.indexOf("-");
  if (sepIndex >= 0) {
    result = result.slice(sepIndex + 1, result.length);
  }

  return result;
};

utilsHelpers.checkEmailValid = function (email) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

module.exports = utilsHelpers;

module.exports.dateToIndex = () => {};
