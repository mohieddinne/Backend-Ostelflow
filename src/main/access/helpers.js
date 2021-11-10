const { UsersRole, UsersAccess, UsersPrivilege } = require("../../models");
const slugify = require("slugify");

const FLAGS = {
  PAGE_FLAG: 0,
};

/**
 * Get roles details
 * @param integer id
 */
module.exports.getRoles = async function (ids) {
  let where = {};
  // Verify and clean data
  if (Array.isArray(ids)) {
    where.id = ids.map(Number).filter((item) => item > 0);
    if (where.id.length <= 0) return null;
  }

  // Get data
  const attributes = ["id", "name", "slug"];
  const promises = [
    UsersRole.findAll({
      where,
      include: [
        {
          model: UsersAccess,
          as: "accesses",
          attributes,
          through: {
            attributes: [
              "id",
              "can_view",
              "can_view_own",
              "can_edit",
              "can_create",
              "can_delete",
            ],
          },
        },
      ],
    }),
    UsersAccess.findAll({ attributes }),
  ];

  const [roles, allAccesses] = await Promise.all(promises);

  // Merge the Accesses and there privileges
  const data = roles.map((role) => {
    return {
      id: role.id,
      name: role.name,
      accesses: allAccesses.map((access) => {
        const uAccess = role.accesses.find((item) => item.id === access.id);
        const item = {
          id: access.id,
          name: access.name,
          slug: access.slug,
          pageFlag: false,
          can_view: false,
          can_view_own: false,
          can_edit: false,
          can_create: false,
          can_delete: false,
        };
        if (uAccess) {
          const privilege = uAccess.UsersPrivilege;
          item.can_view = privilege.can_view;
          item.can_view_own = privilege.can_view_own;
          item.can_edit = privilege.can_edit;
          item.can_create = privilege.can_create;
          item.can_delete = privilege.can_delete;
        }
        return item;
      }),
    };
  });

  return data;
};

/**
 * Get role id from name
 * @param String name
 */
module.exports.getRoleId = async function (name) {
  let where = {};
  // Verify and clean data
  if (name && name.length) {
    where = { name: name };
  }

  // Get data
  const roles = await UsersRole.findAll({
    where,
  });
  if (roles.length == 1) {
    return roles[0].id;
  }
  return -1;
};

module.exports.getAccesses = async function (ids) {
  let where = {};

  if (ids !== undefined) {
    // Verify and clean data
    ids = ids.filter((item) => typeof item === "number");
    if (!Array.isArray(ids) || ids.length <= 0) {
      return false;
    }
    where = {
      id: ids,
    };
  }

  // Get the data
  const accesses = await UsersAccess.findAll({
    where: where,
  });

  // Reforme the object and init the can_* attribute
  accesses.forEach((access) => {
    access.name = access.accessName;
    access.can_view = false;
    access.can_view_own = false;
    access.can_edit = false;
    access.can_create = false;
    access.can_delete = false;
  });
  console.log(accesses);
  return accesses;
};

/**
 * Grant or disgrant access to a level
 * @param integer levelId
 * @param integer accessId
 * @param string privilege
 * @returns boolean
 */
module.exports.changeAccess = async function (levelId, accessId, privilege) {
  // Validate input
  if (
    typeof levelId != "number" ||
    levelId <= 0 ||
    typeof accessId != "number" ||
    accessId <= 0
  ) {
    return false;
  }

  // Get the access params
  const access = await UsersPrivilege.findOne({
    where: {
      levelId: levelId,
      accessId: accessId,
    },
  });

  // Check if access exists
  if (!access) {
    // Creat the access value
    await UsersPrivilege.create(
      {
        levelId: levelId,
        accessId: accessId,
        [privilege]: true, // Set the value by default to true
      },
      {
        // Force the ORM to not add the [id] column
        fields: ["levelId", "accessId", privilege],
      }
    )
      .then(() => {
        return true;
      })
      .catch(function (err) {
        return false;
      });
    return true;
  }

  // Update and return
  return await access
    .update({
      [privilege]: !(access[privilege] === true),
    })
    .then(() => {
      return true;
    })
    .catch(function (err) {
      return false;
    });
};

/**
 * Bulk update an access
 * @param integer accessId
 * @param string privilege
 * @param boolean access
 * @returns boolean
 */
module.exports.bulkChangeAccess = async function (
  accessId,
  privilege,
  access = false
) {
  // Get the access params
  const accesses = await UsersPrivilege.findAll({
    where: {
      accessId: accessId,
    },
  });
  if (!access) {
    return false;
  }
  // Update and return
  return await accesses
    .update({
      [privilege]: access,
    })
    .then(() => {
      return true;
    })
    .catch(function (err) {
      return false;
    });
};

/**
 * Create an Access in the DB
 * @param string name The name of the Access
 * @param string slug The slug of the Access
 * @returns boolean
 */
module.exports.create = async function (name, { slug, flag }) {
  const item = {
    accessName: name,
  };
  if (!slug) {
    item.slug = slugify(name).replace(":", "").toLowerCase();
  }
  if (flag) {
    flag = parseInt(flag);
    switch (flag) {
      case FLAGS.PAGE_FLAG:
        item.pageFlag = true;
        break;
      default:
        break;
    }
  }

  let id = 0;
  await UsersAccess.create(item)
    .then((result) => {
      id = result.id;
    })
    .catch(function (err) {
      console.log(err);
    });

  if (!id) {
    return false;
  }

  return id;
};

/**
 * Delete an Access in the DB
 * @param integer name The name of the Access
 * @param boolean slug The slug of the Access
 * @returns boolean
 */
module.exports.delete = async function (id, force = false) {
  if (!id) {
    return false;
  }

  const accessValue = await UsersAccess.findOne({
    where: {
      id,
    },
    attributes: ["pageFlag"],
  });

  if (accessValue.pageFlag || force) {
    return await UsersAccess.destroy({
      where: {
        id,
      },
    })
      .then(async () => {
        await UsersPrivilege.destroy({
          where: {
            accessId: id,
          },
        })
          .then(() => {
            return true;
          })
          .catch(() => {
            return false;
          });
      })
      .catch(() => {
        return false;
      });
  }

  return false;
};

/**
 * Check if a level has a privilege to an acces
 */
module.exports.hasAccessByLevel = async function (
  accessId,
  privilege,
  levelId
) {
  // Get the access value
  const access = await UsersPrivilege.findOne({
    where: {
      levelId: levelId,
      accessId: accessId,
    },
  });

  if (!access || !(access[privilege] === true)) {
    return false;
  }

  return true;
};

// Toggle a role access
// Revisited on the 22 oct. 20202 by Kharrat M.
module.exports.toggleAccess = async function (role, slug, privilegeString) {
  if (!role || !slug || !privilegeString)
    throw new Error("Functon attributes role, slug, privilege are mandatory.");

  const access = await UsersAccess.findOne({
    where: {
      slug,
    },
    attributes: ["id"],
    include: [
      {
        model: UsersRole,
        as: "privileges",
        attributes: ["id"],
        where: {
          id: role,
        },
        through: {
          model: UsersPrivilege,
          attributes: ["id", privilegeString],
        },
      },
    ],
  });

  let id = null;
  let privilege = null;
  if (access && access.privileges && access.privileges[0]) {
    id = access.privileges[0].UsersPrivilege.id;
    privilege = access.privileges[0].UsersPrivilege[privilegeString];
  }

  try {
    if (!id) {
      const access = await UsersAccess.findOne({
        where: {
          slug,
        },
        attributes: ["id"],
      });
      await UsersPrivilege.create({
        role_id: role,
        access_id: access.id,
        [privilegeString]: true,
      });
    } else
      await UsersPrivilege.update(
        {
          role_id: role,
          access_id: access.id,
          [privilegeString]: !privilege,
        },
        {
          where: {
            id,
          },
        }
      );
  } catch (e) {
    throw e;
  }

  return true;
};

// Create a role
module.exports.createRole = async function (item) {
  if (!item) throw new Error("Functon attributes item is mandatory.");

  if (item.id) delete item.id;

  try {
    return await UsersRole.create(item);
  } catch (e) {
    throw e;
  }
};
