const { DB_NAME } = require('../../constants')
module.exports = JSON.stringify({
  default_dev_env: "local",
  default_port: 8880,
  local: {
    sessionDuration: "365d",
    jwt_secret: "TNEsc5UeV5DsZ8sL",
    port: 8880,
    cleanOnStart: true,
    db: {
      username: "root",
      password: "",
      database: `${DB_NAME}`,
      host: "localhost",
      dialect: "mysql"
    },
    urls: {
      frontend_domain: "http://localhost:3000",
      frontend_url: "http://localhost:3000/",
      server_url: "http://localhost:8880/"
    },
    email: {
      host: "smtp.ethereal.email",
      secure: false,
      require_TLS: true,
      port: 587,
      username: "adah.crooks91@ethereal.email",
      password: "yWbQJesE9TFBJYvkFN"
    },
    folders: {
      upload_main: "public/uploads/",
      upload_image: "public/uploads/images/",
      upload_user: "public/uploads/images/users/",
      upload_misc: "public/uploads/misc/",
      upload_misc_image: "public/uploads/images/misc/",
      upload_content_image: "public/upxloads/images/content/",
      upload_menu_categories: "public/uploads/images/menu-categories/"
    },
    frontend: {
      serve: false,
      folder: "public/frontend/"
    }
  }
})
